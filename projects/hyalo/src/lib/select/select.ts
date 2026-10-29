import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import type { FormValueControl } from '@angular/forms/signals';
import { injectId } from '../core/ids';
import { HyFidelity } from '../fidelity/fidelity';
import { HyIcon } from '../icon/icon';
import { HY_FIELD, type HyFieldControl } from '../field/field-control';
import { hyDropdownPositions } from '../overlay/positions';

/** One choice in a select. */
export interface HySelectOption<T> {
  readonly value: T;
  readonly label: string;
  readonly disabled?: boolean;
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
  },
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class HySelect<T> implements FormValueControl<T | undefined>, HyFieldControl {
  private readonly fidelity = inject(HyFidelity);
  protected readonly field = inject(HY_FIELD, { optional: true });
  private readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');

  /** The choices. */
  readonly options = input.required<readonly HySelectOption<T>[]>();
  /** Selected value. Two-way bindable and works with `[formField]`. */
  readonly value = model<T | undefined>(undefined);
  /** Text shown while nothing is selected. */
  readonly placeholder = input('Select');
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
  readonly id = signal(injectId('select')).asReadonly();
  readonly errorMessage = computed(() => {
    const first = this.errors()[0];
    return first ? (first.message ?? first.kind) : undefined;
  });

  protected readonly expanded = signal(false);
  protected readonly positions = hyDropdownPositions();
  protected readonly panelWidth = signal(0);
  protected readonly useNative = computed(() => this.native() || this.fidelity.tier() === 'low');
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

  protected pickNative(event: Event): void {
    const index = Number((event.target as HTMLSelectElement).value);
    const option = this.options()[index];
    if (option) this.value.set(option.value);
  }

  protected indexOf(value: T | undefined): number {
    return this.options().findIndex((o) => o.value === value);
  }
}
