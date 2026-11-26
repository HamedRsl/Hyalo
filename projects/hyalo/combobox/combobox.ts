import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterRenderEffect,
  computed,
  input,
  output,
  model,
} from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import type { FormValueControl } from '@angular/forms/signals';
import { hyDropdownPositions } from '@hyalo/angular/overlay';
import { HyOptionQuery } from './query';
@Component({
  selector: 'hy-combobox',
  imports: [
    NgTemplateOutlet,
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    Listbox,
    Option,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './combobox.html',
  styleUrl: './combobox.css',
})
export class HyCombobox<T> extends HyOptionQuery<T> implements FormValueControl<T | null> {
  constructor() {
    super();
    this.installOptionKeyboard((value) => this.choose([value]));
    afterRenderEffect(() =>
      this.element
        .querySelector<HTMLInputElement>('input')
        ?.setCustomValidity(this.required() && this.value() === null ? 'Choose an option.' : ''),
    );
  }
  readonly value = model<T | null>(null);
  /** A typed conversion is required before arbitrary text can become a value. */
  readonly createValue = input<(text: string) => T>();
  readonly requireExactMatch = input(false);
  readonly hint = input('');
  readonly clearable = input(true);
  readonly clearLabel = input('Clear selection');
  readonly valueCommitted = output<T | null>();
  protected readonly positions = hyDropdownPositions();
  protected readonly selection = computed(() => {
    const value = this.value();
    return value === null
      ? []
      : [this.results().find((item) => this.same(item.option.value, value))?.option.value ?? value];
  });
  protected readonly selected = computed(() =>
    this.knownOptions().filter((option) =>
      this.selection().some((value) => this.same(value, option.value)),
    ),
  );
  protected readonly selectedLabel = computed(() => {
    const option = this.selected()[0];
    const value = this.value();
    return option
      ? this.optionLabel(option)
      : value === null
        ? ''
        : (this.displayWith()?.(value) ?? '');
  });
  protected commitText(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || this.blocked() || !this.query().trim()) return;
    const exact = this.results().find((item) => !item.disabled && item.label === this.query());
    const create = this.createValue();
    if (exact) this.choose([exact.option.value]);
    else if (!this.requireExactMatch() && create) {
      const text = this.query().trim(),
        value = create(text);
      this.value.set(value);
      this.valueCommitted.emit(value);
      this.dismiss();
    }
  }
  protected choose(values: readonly T[]): void {
    // Aria may clear its transient listbox selection when a new query has no match.
    // Clearing the committed value is an explicit clear-button action instead.
    if (this.blocked() || !values.length) return;
    const selectable = values.filter(
      (value) => !this.results().find((item) => this.same(item.option.value, value))?.disabled,
    );
    this.remember(selectable);
    this.value.set(selectable[selectable.length - 1] ?? null);
    this.valueCommitted.emit(this.value());
    this.dismiss();
    this.query.set('');
    this.focus();
  }
  /** Clear the committed value and return focus to the input. */
  clear(): void {
    if (this.blocked() || this.value() === null) return;
    this.value.set(null);
    this.valueCommitted.emit(null);
    this.query.set('');
    this.focus();
  }
}
