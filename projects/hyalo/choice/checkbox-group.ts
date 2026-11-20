import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
import { HyCheckbox } from './checkbox';

export interface HyCheckboxOption<T> { readonly value: T; readonly label: string; readonly disabled?: boolean; }

/** Array-valued selection with stable application-defined value identity. */
@Component({
  selector: 'hy-checkbox-group',
  imports: [HyCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', '[attr.aria-label]': 'label()', '(focusout)': 'leave($event)' },
  template: `@for (option of options(); track option) {
    <hy-checkbox [checked]="contains(option.value)" [disabled]="blocked() || !!option.disabled"
      (checkedChange)="toggle(option.value, $event)">{{ option.label }}</hy-checkbox>
  }`,
})
export class HyCheckboxGroup<T> extends HyValueControl implements FormValueControl<readonly T[]> {
  readonly value = model<readonly T[]>([]);
  readonly options = input.required<readonly HyCheckboxOption<T>[]>();
  readonly compareWith = input<(a: T, b: T) => boolean>(Object.is);
  contains(value: T): boolean { return this.value().some(item => this.compareWith()(item, value)); }
  toggle(value: T, checked: boolean): void {
    if (this.blocked()) return;
    const option = this.options().find(item => this.compareWith()(item.value, value));
    if (!option || option.disabled) return;
    this.value.update(items => checked ? this.contains(value) ? items : [...items, value]
      : items.filter(item => !this.compareWith()(item, value)));
  }
}

/** A checkbox whose checked and unchecked values are application values. */
@Component({
  selector: 'hy-value-checkbox',
  imports: [HyCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  template: `<hy-checkbox [checked]="isChecked()" [disabled]="blocked()" [required]="required()"
    (checkedChange)="choose($event)"><ng-content /></hy-checkbox>`,
})
export class HyValueCheckbox<T> extends HyValueControl implements FormValueControl<T | null> {
  readonly value = model<T | null>(null);
  readonly trueValue = input.required<T>();
  readonly falseValue = input.required<T>();
  readonly compareWith = input<(a: T | null, b: T) => boolean>(Object.is);
  protected readonly isChecked = computed(() => this.compareWith()(this.value(), this.trueValue()));
  protected choose(checked: boolean): void {
    if (!this.blocked()) this.value.set(checked ? this.trueValue() : this.falseValue());
  }
}
