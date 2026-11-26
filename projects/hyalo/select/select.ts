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
  CDK_CONNECTED_OVERLAY_DEFAULT_CONFIG,
  OVERLAY_DEFAULT_CONFIG,
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  Overlay,
  type ConnectedPosition,
  type FlexibleOverlayPopoverLocation,
  type ScrollStrategy,
} from '@angular/cdk/overlay';
import type { FormValueControl } from '@angular/forms/signals';
import { HY_CONFIG, HyFidelity, injectId, normalizeSearch } from '@hyalo/angular/core';
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
  private readonly policy = inject(HY_CONFIG).components?.select;
  private readonly fidelity = inject(HyFidelity);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  private readonly ready = signal(false);
  private pendingNativeKey: string | undefined;
  protected readonly field = inject(HY_FIELD, { optional: true });
  private readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  private readonly nativeSelect = viewChild<ElementRef<HTMLSelectElement>>('nativeSelect');
  private readonly overlay = viewChild(CdkConnectedOverlay);
  private readonly connectedDefaults = inject(CDK_CONNECTED_OVERLAY_DEFAULT_CONFIG, { optional: true });
  private readonly overlayDefaults = inject(OVERLAY_DEFAULT_CONFIG, { optional: true });
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
  /** Optional DOM parent for the custom select's dropdown. */
  readonly panelContainer = input<HTMLElement>();
  protected readonly overlayMount = computed<FlexibleOverlayPopoverLocation | null>(() => {
    const parent = this.panelContainer();
    if (parent) return { type: 'parent', element: parent };
    const configured = this.connectedDefaults?.usePopover;
    return configured === undefined
      ? this.overlayDefaults?.usePopover === false ? null : 'global'
      : configured;
  });
  readonly popupWidth = input<string | number>();
  readonly overlayPositions = input<ConnectedPosition[]>();
  readonly scrollStrategy = input<ScrollStrategy>(inject(Overlay).scrollStrategies.reposition());
  readonly offsetX = input(0);
  readonly offsetY = input(0);
  readonly typeaheadDelay = input(this.policy?.typeaheadDelay ?? 500);
  readonly wrap = input(this.policy?.wrap ?? true);
  readonly canSelectNullable = input(this.policy?.canSelectNullable ?? true);
  /** Return undefined to reject a draft without changing the current selection. */
  readonly createValue = input<(text: string) => T | undefined>();
  readonly customValueRejected = output<{ readonly text: string; readonly error?: unknown }>();
  readonly customValueLabel = input('Add option');
  readonly emptyLabel = input('No options available');
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
  private readonly createdSelection = signal<{ value: T; label: string } | undefined>(undefined);
  private readonly remoteOptions = signal<readonly HySelectOption<T>[]>([]);
  private readonly pageOffset = signal(0);
  private readonly hasMore = signal(false);
  private pageController: AbortController | undefined;
  protected readonly virtualOffset = signal(0);
  protected readonly virtualIndex = signal(-1);
  private searchPrefix = '';
  private lastType = -Infinity;
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
    loader: async ({ params, abortSignal }) => {
      this.pageController?.abort();
      const controller = new AbortController();
      this.pageController = controller;
      const abort = (): void => controller.abort();
      abortSignal.addEventListener('abort', abort, { once: true });
      try {
        return {
          ...(await params.load({
            offset: params.offset,
            limit: params.limit,
            signal: controller.signal,
          })),
          offset: params.offset,
        };
      } finally {
        abortSignal.removeEventListener('abort', abort);
      }
    },
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
  protected readonly listboxId = this.nativeId + '-listbox';
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
      if (option.key === undefined && (typeof value === 'object' && value !== null || typeof value === 'function'))
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
        disabled: !!(
          option.disabled ||
          option.group?.disabled ||
          (value == null && !this.canSelectNullable())
        ),
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
  protected readonly selectedLabel = computed(() => {
    const option = this.selectedOption();
    if (option) return this.optionLabel(option);
    const value = this.value();
    if (value === undefined) return undefined;
    const display = this.displayWith();
    if (display) return display(value);
    const created = this.createdSelection();
    return created && this.compareWith()(created.value, value) ? created.label : undefined;
  });
  protected readonly showsError = computed(() =>
    this.field ? this.field.errorShown() : this.invalid() && this.touched(),
  );

  constructor() {
    afterNextRender(() => {
      const trigger = this.trigger()?.nativeElement;
      if (!trigger) return;
      const onKey = (event: KeyboardEvent): void => this.virtualKeys(event);
      trigger.addEventListener('keydown', onKey, true);
      this.destroy.onDestroy(() => trigger.removeEventListener('keydown', onKey, true));
    });
    effect((onCleanup) => {
      const trigger = this.trigger()?.nativeElement;
      if (!this.opened() || this.useNative() || !trigger) return;
      const measure = (): void => this.panelWidth.set(trigger.offsetWidth);
      measure();
      if (typeof ResizeObserver !== 'undefined') {
        const resize = new ResizeObserver(measure);
        resize.observe(trigger);
        onCleanup(() => resize.disconnect());
      }
    });
    this.destroy.onDestroy(() => this.pageController?.abort());
    effect(() => {
      if (!this.opened()) this.pageController?.abort();
    });
    // During hydration the host already contains the server-rendered control.
    // Read the live value before option bindings can restore the server default.
    // A native picker can commit before Angular's change listener exists; unlike
    // synthetic replay, its live selected state is the browser's source of truth.
    const baseline = this.host.querySelector<HTMLSelectElement>('select.hy-select__native');
    const baselineKey = baseline?.value;
    const defaultKey = baseline?.querySelector<HTMLOptionElement>('option[selected]')?.value;
    afterNextRender(() => {
      // This callback only gates this instance's first completed render, not
      // application-wide hydration. Incremental replay may arrive before inputs.
      const key =
        this.pendingNativeKey ?? (baseline && baselineKey !== defaultKey ? baselineKey : undefined);
      this.pendingNativeKey = undefined;
      if (key !== undefined) this.commitNativeKey(key);
      this.ready.set(true);
    });
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
    if (!open) {
      this.searchPrefix = '';
      this.lastType = -Infinity;
    }
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
    if (!values.length) return;
    const next = values[values.length - 1];
    if (next === undefined) {
      if (this.canSelectNullable()) this.clear();
      return;
    }
    if (
      this.effectiveDisabled() ||
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

  /** Clears the current value and restores the placeholder when selection is optional. */
  clear(): void {
    if (this.required() || this.effectiveDisabled()) return;
    this.value.set(undefined);
    this.createdSelection.set(undefined);
    this.close();
  }

  close(): void {
    this.setExpanded(false);
    if (!this.useNative()) this.trigger()?.nativeElement.focus();
  }
  open(): void {
    if (this.useNative()) {
      const select = this.nativeSelect()?.nativeElement;
      if (!select || this.effectiveDisabled()) return;
      select.focus();
      try {
        select.showPicker?.();
      } catch (error: unknown) {
        if (!(error instanceof DOMException)) throw error;
        // A browser can require user activation or decline the platform picker.
      }
      return;
    }
    this.setExpanded(true);
  }
  toggle(): void {
    if (this.useNative()) this.open();
    else this.setExpanded(!this.expanded());
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
    if (event instanceof KeyboardEvent) {
      if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault();
        this.trigger()?.nativeElement.focus();
        return;
      }
      if (event.key === 'Tab' || event.key === 'Escape') return;
      event.stopPropagation();
      if (event.key !== 'Enter' || event.isComposing) return;
    }
    event.preventDefault();
    event.stopPropagation();
    const create = this.createValue();
    const text = this.customText().trim();
    if (this.effectiveDisabled() || !create || !text) return;
    let value: T | undefined;
    try {
      value = create(text);
    } catch (error) {
      this.customValueRejected.emit({ text, error });
      return;
    }
    if (value === undefined || (value === null && !this.canSelectNullable())) {
      this.customValueRejected.emit({ text });
      return;
    }
    this.createdSelection.set({ value, label: text });
    this.value.set(value);
    this.customText.set('');
    this.close();
  }
  protected relayOptionKey(event: KeyboardEvent, listbox: HTMLElement): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
    } else if (event.target === event.currentTarget) {
      listbox.dispatchEvent(new KeyboardEvent(event.type, event));
    }
  }

  protected virtualKeys(event: KeyboardEvent): void {
    if (event.key === 'Tab' && !event.shiftKey && this.expanded() && this.createValue()) {
      const draft = this.panelElement()?.querySelector<HTMLInputElement>('.hy-select__draft');
      if (draft) {
        event.preventDefault();
        draft.focus();
      }
      return;
    }
    if (
      !this.virtualized() ||
      this.effectiveDisabled() ||
      event.isComposing ||
      event.altKey || event.ctrlKey || event.metaKey
    ) return;
    if (event.key.length === 1 && event.key !== ' ') {
      this.searchVirtual(event);
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Escape', ' '].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.key === 'Escape') {
      this.close();
      return;
    }
    const items = this.keyedOptions();
    if (event.key === 'Enter' || event.key === ' ') {
      if (!this.expanded()) {
        this.open();
        return;
      }
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
          : this.virtualIndex() < 0 && direction < 0 ? items.length - 1 : this.virtualIndex() + direction;
    const wraps = this.wrap() && (event.key === 'ArrowDown' || event.key === 'ArrowUp');
    for (let count = 0; count < items.length; count++, index += direction) {
      if (wraps) index = (index + items.length) % items.length;
      if (index < 0 || index >= items.length) return;
      if (!items[index]?.disabled) {
        this.focusVirtual(index);
        return;
      }
    }
  }

  private searchVirtual(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.open();
    const key = normalizeSearch(event.key);
    const interval = event.timeStamp - this.lastType;
    const previous = interval <= this.typeaheadDelay() ? this.searchPrefix : '';
    this.searchPrefix = previous + key;
    this.lastType = event.timeStamp;
    const repeat = previous.length > 0 && Array.from(previous).every((letter) => letter === key);
    const query = repeat ? key : this.searchPrefix;
    const items = this.keyedOptions();
    const active = this.virtualIndex();
    for (let step = previous && !repeat ? 0 : 1; step <= items.length; step++) {
      const index = (active + step + items.length) % items.length;
      const item = items[index];
      if (item && !item.disabled && normalizeSearch(this.optionLabel(item.option)).startsWith(query)) {
        this.focusVirtual(index);
        return;
      }
    }
  }

  private focusVirtual(index: number): void {
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
    const key = (event.target as HTMLSelectElement).value;
    if (!this.ready()) {
      this.pendingNativeKey = key;
      return;
    }
    this.commitNativeKey(key);
  }

  private commitNativeKey(key: string): void {
    if (this.effectiveDisabled()) return;
    if (!key) {
      this.clear();
      return;
    }
    const choice = this.keyedOptions().find((item) => item.key === key);
    if (choice && !choice.disabled) {
      if (choice.option.value === undefined) this.clear();
      else this.value.set(choice.option.value);
    }
  }
}
