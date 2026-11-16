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
import { HyOptionQuery } from '@hyalo/angular/combobox';
@Component({
  selector: 'hy-multi-select',
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
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.css',
})
export class HyMultiSelect<T> extends HyOptionQuery<T> implements FormValueControl<readonly T[]> {
  constructor() {
    super();
    afterRenderEffect(() => {
      const message = this.required() && !this.value().length ? 'Select at least one option.' : '';
      this.element.querySelector<HTMLInputElement>('input')?.setCustomValidity(message);
    });
  }
  readonly value = model<readonly T[]>([]);
  protected readonly positions = hyDropdownPositions();
  protected readonly selection = computed(() => [...this.value()]);
  protected readonly selected = computed(() =>
    this.knownOptions().filter((option) => this.selection().includes(option.value)),
  );
  protected readonly selectedLabel = computed(() => this.selected()[0]?.label ?? '');
  protected choose(values: readonly T[]): void {
    if (this.blocked()) return;
    const selectable = values.filter(
      (value) =>
        this.value().includes(value) ||
        !this.results().find((item) => item.option.value === value)?.disabled,
    );
    this.remember(selectable);
    this.value.set([...new Set(selectable)]);

    this.query.set('');
    this.focus();
  }
  protected remove(value: T): void {
    if (
      this.blocked() ||
      this.knownOptions().some(
        (option) => option.value === value && (option.disabled || option.group?.disabled),
      )
    )
      return;
    this.value.update((values) => values.filter((item) => item !== value));
    this.focus();
  }
}
