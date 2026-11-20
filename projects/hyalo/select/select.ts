import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  TemplateRef,
  afterNextRender,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  resource,
  untracked,
  viewChild,
} from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  Overlay,
  type ConnectedPosition,
  type ScrollStrategy,
} from '@angular/cdk/overlay';
import type { FormValueControl } from '@angular/forms/signals';
import { HyFidelity, injectId } from '@hyalo/angular/core';
import { HyIcon } from '@hyalo/angular/icon';
import { HY_FIELD, type HyFieldControl } from '@hyalo/angular/field';
import { hyDropdownPositions, ɵHyPresence as HyPresence } from '@hyalo/angular/overlay';

/** One choice in a select. */
export interface HySelectOption<T> {
  readonly key?: string | number;
  readonly group?: { readonly key: string; readonly label: string; readonly disabled?: boolean };
  readonly value: T;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface HySelectOptionContext<T> {
  readonly $implicit: HySelectOption<T>;
}
export interface HySelectPageRequest {
  readonly offset: number;
  readonly limit: number;
  readonly signal: AbortSignal;
}
export interface HySelectPage<T> {
  readonly options: readonly HySelectOption<T>[];
  readonly hasMore: boolean;
}

/**
 * A single-choice select with a glass dropdown, built on Angular Aria's
 * combobox and listbox patterns.
 *
 * ```html
 * <hy-field label="Strap">
 *   <hy-select [options]="straps" [formField]="form.strap" placeholder="Choose a strap" />
 * </hy-field>
 * ```
 *
 * Focus stays on the trigger while the list is open, and options are
 * announced through `aria-activedescendant`. Arrow keys move, Enter or
 * Space picks, Escape closes, and typing jumps to a matching option.
 *
 * On the low fidelity tier, or with `native`, it renders a real `<select>`
 * instead. That gives the platform picker on phones and costs nothing.
 */
@Component({
  selector: 'hy-select',
  imports: [
    NgTemplateOutlet,
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    Listbox,
    Option,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    HyIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-select',
    '[attr.data-native]': 'useNative() || null',
    '(focusout)': 'scheduleMode()',
  },
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class HySelect<T> implements FormValueControl<T | undefined>, HyFieldControl {
  private readonly fidelity = inject(HyFidelity);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  private readonly ready = signal(false);
  protected readonly field = inject(HY_FIELD, { optional: true });
  private readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  private readonly overlay = viewChild(CdkConnectedOverlay);
  private readonly presence = new HyPresence();

  /** The choices. */
  readonly options = input.required<readonly HySelectOption<T>[]>();
  /** Selected value. Two-way bindable and works with `[formField]`. */
  readonly value = model<T | undefined>(undefined);
  /** Text shown while nothing is selected. */
  readonly placeholder = input('Select');
  readonly name = input('');
  readonly optionTemplate = input<TemplateRef<HySelectOptionContext<T>>>();
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);
  readonly displayWith = input<(value: T) => string>();
  readonly selectedTemplate =
    input<TemplateRef<{ $implicit: T | undefined; option: HySelectOption<T> | undefined }>>();
  readonly groupTemplate = input<TemplateRef<{ $implicit: string }>>();
  readonly headerTemplate = input<TemplateRef<unknown>>();
  readonly footerTemplate = input<TemplateRef<unknown>>();
  readonly panelClass = input<string | string[]>('hy-select-overlay');
  readonly popupWidth = input<string | number>();
  readonly overlayPositions = input<ConnectedPosition[]>();
  readonly scrollStrategy = input<ScrollStrategy>(inject(Overlay).scrollStrategies.reposition());
  readonly offsetX = input(0);
  readonly offsetY = input(0);
  readonly typeaheadDelay = input(500);
  readonly wrap = input(true);
  readonly canSelectNullable = input(true);
  readonly createValue = input<(text: string) => T>();
  readonly customValueLabel = input('Add option');
  readonly virtualized = input(false);
  readonly itemHeight = input(44);
  readonly viewportHeight = input(264);
  readonly pageSize = input(50);
  readonly loadPage = input<(request: HySelectPageRequest) => Promise<HySelectPage<T>>>();
  readonly opened = model(false);
  readonly openedPanel = output<void>();
  readonly closedPanel = output<void>();
  readonly renderedRangeChange = output<{ start: number; end: number; total: number }>();
  readonly formDisabled = signal(false);
  protected readonly effectiveDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly customText = signal('');
  private readonly remoteOptions = signal<readonly HySelectOption<T>[]>([]);
  private readonly pageOffset = signal(0);
  private readonly hasMore = signal(false);
  protected readonly virtualOffset = signal(0);
  protected readonly virtualIndex = signal(-1);
  protected readonly virtualActiveId = computed(() =>
    this.virtualIndex() < 0 ? undefined : this.triggerId + '-option-' + this.virtualIndex(),
  );
  private readonly page = resource({
    params: () => {
      const load = this.loadPage();
      return this.expanded() && load
        ? { load, offset: this.pageOffset(), limit: Math.max(1, this.pageSize()) }
        : undefined;
    },
    loader: async ({ params, abortSignal }) => ({
      ...(await params.load({ offset: params.offset, limit: params.limit, signal: abortSignal })),
      offset: params.offset,
    }),
  });
  protected readonly pageBusy = computed(() => this.page.isLoading());
  protected readonly pageFailed = computed(() => this.page.status() === 'error');
  /** Disables the select. Set automatically by Signal Forms. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Marks the field as required. Set automatically by Signal Forms. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Set by Signal Forms. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Set by Signal Forms. Only the first message is shown. */
  readonly errors = input<readonly { readonly kind: string; readonly message?: string }[]>([]);
  /** Set by Signal Forms. Errors show only after the field is touched. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Always render a native `<select>`. */
  readonly native = input(false, { transform: booleanAttribute });
  /** Emits when the control loses focus, so forms can mark it touched. */
  readonly touch = output<void>();

  readonly labelable = true;
  protected readonly nativeId = injectId('select');
  protected readonly triggerId = this.nativeId + '-trigger';
  readonly id = computed(() => (this.useNative() ? this.nativeId : this.triggerId));
  readonly errorMessage = computed(() => {
    const first = this.errors()[0];
    return first ? (first.message ?? first.kind) : undefined;
  });

  protected readonly expanded = this.opened;
  /** Stays true while the panel fades out after `expanded` turns false. */
  protected readonly rendered = signal(false);
  protected readonly positions = hyDropdownPositions();
  protected readonly panelWidth = signal(0);
  protected readonly useNative = signal(true);
  protected readonly keyedOptions = computed(() => {
    const keys = new Set<string>();
    return [...this.options(), ...this.remoteOptions()].map((option, index) => {
      const value = option.value;
      if (option.key === undefined && (typeof value === 'object' || typeof value === 'function'))
        throw new Error('HySelect: object values require a stable option key');
      const key =
        option.key === undefined
          ? `${typeof value}:${String(value)}`
          : `${typeof option.key}:${option.key}`;
      if (keys.has(key)) throw new Error('HySelect: duplicate option key ' + key);
      keys.add(key);
      return {
        index,
        option,
        key,
        disabled: !!(option.disabled || option.group?.disabled),
        context: { $implicit: option },
      };
    });
  });
  protected readonly virtualRange = computed(() => {
    const total = this.keyedOptions().length,
      height = Math.max(1, this.itemHeight());
    const start = this.virtualized()
      ? Math.min(Math.max(0, total - 1), Math.max(0, Math.floor(this.virtualOffset() / height) - 2))
      : 0;
    return {
      start,
      end: this.virtualized()
        ? Math.min(total, start + Math.ceil(Math.max(1, this.viewportHeight()) / height) + 4)
        : total,
      total,
    };
  });
  protected readonly visibleOptions = computed(() =>
    this.keyedOptions().slice(this.virtualRange().start, this.virtualRange().end),
  );
  protected readonly groups = computed(() => {
    const groups = new Map<
      string,
      {
        key: string;
        label: string;
        options: {
          option: HySelectOption<T>;
          key: string;
          disabled: boolean;
          context: HySelectOptionContext<T>;
        }[];
      }
    >();
    for (const option of this.keyedOptions()) {
      const key = option.option.group?.key ?? '';
      const group = groups.get(key) ?? {
        key,
        label: option.option.group?.label ?? '',
        options: [],
      };
      group.options.push(option);
      groups.set(key, group);
    }
    return [...groups.values()];
  });
  protected readonly selectedOption = computed(() =>
    [...this.options(), ...this.remoteOptions()].find(
      (o) => this.value() !== undefined && this.compareWith()(o.value, this.value() as T),
    ),
  );
  protected readonly listValue = computed(() => {
    const v = this.value();
    return v === undefined ? [] : [this.selectedOption()?.value ?? v];
  });
  protected readonly showsError = computed(() =>
    this.field ? this.field.errorShown() : this.invalid() && this.touched(),
  );

  constructor() {
    effect(() => {
      if (this.effectiveDisabled()) this.opened.set(false);
    });
    effect(() => {
      if (!this.page.hasValue()) return;
      const page = this.page.value();
      this.remoteOptions.update((current) =>
        page.offset ? [...current, ...page.options] : page.options,
      );
      this.hasMore.set(page.hasMore);
    });
    let wasOpen = false;
    effect(() => {
      const open = this.opened();
      if (open === wasOpen) return;
      wasOpen = open;
      if (open) this.openedPanel.emit();
      else this.closedPanel.emit();
    });
    effect(() => this.renderedRangeChange.emit(this.virtualRange()));
    afterNextRender(() => this.ready.set(true));
    effect(() => {
      this.ready();
      this.native();
      this.fidelity.tier();
      this.scheduleMode();
    });
    effect(() => {
      const open = this.expanded();
      untracked(() => {
        const panel = this.panelElement();
        if (open) {
          // Reopened while fading out: turn the exit around.
          if (panel && this.presence.leaving) this.presence.enter(panel);
          this.rendered.set(true);
        } else if (panel) {
          this.presence.leave(panel, () => this.rendered.set(false));
        } else {
          this.rendered.set(false);
        }
      });
    });
    this.field?.register({
      id: this.id,
      invalid: computed(() => this.invalid() && this.touched()),
      errorMessage: this.errorMessage,
      required: this.required,
      disabled: this.effectiveDisabled,
      labelable: true,
    });
  }

  protected setExpanded(open: boolean): void {
    if (open && this.effectiveDisabled()) return;
    if (open) this.panelWidth.set(this.trigger()?.nativeElement.offsetWidth ?? 0);
    this.expanded.set(open);
  }

  /** Runs when the overlay attaches a fresh panel. */
  protected onAttach(): void {
    const panel = this.panelElement();
    if (panel) this.presence.enter(panel);
  }

  private panelElement(): HTMLElement | null {
    return (
      this.overlay()?.overlayRef?.overlayElement.querySelector<HTMLElement>('.hy-select__panel') ??
      null
    );
  }

  protected pick(values: readonly T[]): void {
    const next = values[values.length - 1];
    if (
      this.effectiveDisabled() ||
      next === undefined ||
      (next === null && !this.canSelectNullable()) ||
      (this.value() !== undefined && this.compareWith()(next, this.value() as T))
    )
      return;
    this.value.set(next);
    this.close();
  }

  /** Closes after a click on an option, including the one already selected. */
  protected onPanelClick(event: MouseEvent): void {
    const option = (event.target as Element | null)?.closest('[role="option"]');
    if (option && option.getAttribute('aria-disabled') !== 'true') this.close();
  }

  close(): void {
    this.expanded.set(false);
    this.trigger()?.nativeElement.focus();
  }
  open(): void {
    this.setExpanded(true);
  }
  toggle(): void {
    this.setExpanded(!this.expanded());
  }
  retry(): void {
    this.page.reload();
  }
  loadMore(): void {
    if (!this.pageBusy() && this.hasMore()) this.pageOffset.set(this.remoteOptions().length);
  }
  protected scrollOptions(event: Event): void {
    const panel = event.target as HTMLElement;
    this.virtualOffset.set(panel.scrollTop);
    if (
      panel.scrollTop + panel.clientHeight >=
      panel.scrollHeight - Math.max(1, this.itemHeight()) * 2
    )
      this.loadMore();
  }
  protected optionLabel(option: HySelectOption<T>): string {
    return this.displayWith()?.(option.value) ?? option.label;
  }
  protected isSelected(value: T): boolean {
    return this.value() !== undefined && this.compareWith()(value, this.value() as T);
  }
  protected commitCustom(event: Event): void {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') return;
    const create = this.createValue();
    const text = this.customText().trim();
    if (this.effectiveDisabled() || !create || !text) return;
    this.value.set(create(text));
    this.customText.set('');
    this.close();
  }
  protected virtualKeys(event: KeyboardEvent): void {
    if (
      !this.virtualized() ||
      this.effectiveDisabled() ||
      !['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Escape'].includes(event.key)
    )
      return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.key === 'Escape') {
      this.close();
      return;
    }
    const items = this.keyedOptions();
    if (event.key === 'Enter') {
      const item = items[this.virtualIndex()];
      if (item && !item.disabled) this.pick([item.option.value]);
      return;
    }
    this.open();
    const direction = event.key === 'ArrowUp' || event.key === 'End' ? -1 : 1;
    let index =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : this.virtualIndex() + direction;
    while (index >= 0 && index < items.length && items[index]?.disabled) index += direction;
    if (index < 0 || index >= items.length) return;
    this.virtualIndex.set(index);
    this.virtualOffset.set(
      Math.max(0, index * Math.max(1, this.itemHeight()) - Math.max(1, this.viewportHeight()) / 2),
    );
    queueMicrotask(() => {
      const panel = this.panelElement();
      if (panel) panel.scrollTop = this.virtualOffset();
    });
  }

  protected scheduleMode(): void {
    queueMicrotask(() => {
      if (this.destroy.destroyed || !this.ready()) return;
      if (this.expanded() || this.host.contains(this.document.activeElement)) return;
      this.useNative.set(this.native() || this.fidelity.tier() === 'low');
    });
  }

  protected pickNative(event: Event): void {
    if (this.effectiveDisabled()) return;
    const key = (event.target as HTMLSelectElement).value;
    if (!key && !this.required()) {
      this.value.set(undefined);
      return;
    }
    const choice = this.keyedOptions().find((item) => item.key === key);
    if (choice && !choice.disabled && (choice.option.value !== null || this.canSelectNullable()))
      this.value.set(choice.option.value);
  }
}
