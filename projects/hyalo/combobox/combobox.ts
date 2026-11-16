import {
  ChangeDetectionStrategy,
  Component,
  afterRenderEffect,
  computed,
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
    afterRenderEffect(() =>
      this.element
        .querySelector<HTMLInputElement>('input')
        ?.setCustomValidity(this.required() && this.value() === null ? 'Choose an option.' : ''),
    );
  }
  readonly value = model<T | null>(null);
  protected readonly positions = hyDropdownPositions();
  protected readonly selection = computed(() => (this.value() === null ? [] : [this.value() as T]));
  protected readonly selected = computed(() =>
    this.knownOptions().filter((option) => this.selection().includes(option.value)),
  );
  protected readonly selectedLabel = computed(() => this.selected()[0]?.label ?? '');
  protected choose(values: readonly T[]): void {
    if (this.blocked()) return;
    const selectable = values.filter(
      (value) => !this.results().find((item) => item.option.value === value)?.disabled,
    );
    this.remember(selectable);
    this.value.set(selectable[selectable.length - 1] ?? null);
    this.dismiss();
    this.query.set('');
    this.focus();
  }
  protected clear(): void {
    if (!this.blocked()) {
      this.value.set(null);
      this.query.set('');
      this.focus();
    }
  }
}
