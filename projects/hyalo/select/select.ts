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
  untracked,
  viewChild,
} from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
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

  protected readonly expanded = signal(false);
  /** Stays true while the panel fades out after `expanded` turns false. */
  protected readonly rendered = signal(false);
  protected readonly positions = hyDropdownPositions();
  protected readonly panelWidth = signal(0);
  protected readonly useNative = signal(true);
  protected readonly keyedOptions = computed(() => {
    const keys = new Set<string>();
    return this.options().map((option) => {
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
        option,
        key,
        disabled: !!(option.disabled || option.group?.disabled),
        context: { $implicit: option },
      };
    });
  });
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
    this.options().find((o) => o.value === this.value()),
  );
  protected readonly listValue = computed(() => {
    const v = this.value();
    return v === undefined ? [] : [v];
  });
  protected readonly showsError = computed(() =>
    this.field ? this.field.errorShown() : this.invalid() && this.touched(),
  );

  constructor() {
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
      disabled: this.disabled,
      labelable: true,
    });
  }

  protected setExpanded(open: boolean): void {
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
    if (next === undefined || next === this.value()) return;
    this.value.set(next);
    this.close();
  }

  /** Closes after a click on an option, including the one already selected. */
  protected onPanelClick(event: MouseEvent): void {
    const option = (event.target as Element | null)?.closest('[role="option"]');
    if (option && option.getAttribute('aria-disabled') !== 'true') this.close();
  }

  protected close(): void {
    this.expanded.set(false);
    this.trigger()?.nativeElement.focus();
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
    if (!key && !this.required()) {
      this.value.set(undefined);
      return;
    }
    const choice = this.keyedOptions().find((item) => item.key === key);
    if (choice && !choice.disabled) this.value.set(choice.option.value);
  }
}
