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
import { HyOptionQuery } from '@hyalo/angular/combobox';
@Component({
  selector: 'hy-multi-select',
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
  readonly maxSelected = input<number>();
  readonly showSelectAll = input(false);
  readonly selectAllLabel = input('Select all');
  readonly clearAllLabel = input('Clear all');
  readonly maxVisibleChips = input<number>();
  readonly summary = input<(count: number) => string>((count) => `${count} selected`);
  readonly selectionChanged = output<readonly T[]>();
  readonly removed = output<T>();
  protected readonly positions = hyDropdownPositions();
  protected readonly selection = computed(() =>
    this.value().map(
      (value) =>
        this.results().find((item) => this.same(item.option.value, value))?.option.value ?? value,
    ),
  );
  protected readonly selected = computed(() =>
    this.knownOptions().filter((option) =>
      this.selection().some((value) => this.same(value, option.value)),
    ),
  );
  protected readonly selectedLabel = computed(() => this.selected()[0]?.label ?? '');
  protected readonly visibleChips = computed(() => {
    const max = this.maxVisibleChips();
    return this.selected().slice(0, max === undefined ? undefined : Math.max(0, max));
  });
  protected virtualKey(event: KeyboardEvent): void {
    this.virtualKeys(event, (values) => this.choose(values), this.selection());
  }
  selectAll(): void {
    this.choose([
      ...this.value(),
      ...this.results()
        .filter((item) => !item.disabled)
        .map((item) => item.option.value),
    ]);
  }
  clearAll(): void {
    this.choose(
      this.value().filter((value) =>
        this.knownOptions().some(
          (option) => this.same(option.value, value) && (option.disabled || option.group?.disabled),
        ),
      ),
    );
  }
  protected choose(values: readonly T[]): void {
    if (this.blocked()) return;
    const selectable = values.filter(
      (value) =>
        this.value().some((item) => this.same(item, value)) ||
        !this.results().find((item) => this.same(item.option.value, value))?.disabled,
    );
    this.remember(selectable);
    const unique = selectable.filter(
      (value, index) => selectable.findIndex((item) => this.same(item, value)) === index,
    );
    const max = this.maxSelected();
    this.value.set(max === undefined ? unique : unique.slice(0, Math.max(0, max)));
    this.selectionChanged.emit(this.value());

    this.query.set('');
    this.focus();
  }
  protected remove(value: T): void {
    if (
      this.blocked() ||
      this.knownOptions().some(
        (option) => this.same(option.value, value) && (option.disabled || option.group?.disabled),
      )
    )
      return;
    this.value.update((values) => values.filter((item) => !this.same(item, value)));
    this.removed.emit(value);
    this.selectionChanged.emit(this.value());
    this.focus();
  }
}
