import { NgTemplateOutlet } from '@angular/common';
import {
  TemplateRef,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  input,
  model,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { type HySize, injectId, ɵtrackIndicator as trackIndicator } from '@hyalo/angular/core';

import { HyIcon } from '@hyalo/angular/icon';

/** One choice in a segmented control. */
export interface HySegmentedOption<T> {
  readonly value: T;
  readonly label: string;
  readonly icon?: string;
  readonly disabled?: boolean;
}

/**
 * A segmented control: a small set of mutually exclusive choices with the
 * same sliding indicator as tabs. Use it to pick a value (billing period, a
 * view mode). Use tabs when each choice shows a different panel.
 *
 * It is a group of native radio buttons, so arrow keys, form submission and
 * screen readers behave as users expect. Works with Signal Forms through
 * `[formField]`, or with `[(value)]`.
 *
 * ```html
 * <hy-segmented label="Billing" [options]="periods" [(value)]="period" />
 * ```
 */
@Component({
  selector: 'hy-segmented',
  imports: [HyIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-segmented',
    '[attr.role]': 'multiple() ? "group" : "radiogroup"',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.data-size]': 'size()',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-block]': 'block() || null',
    '[attr.data-ready]': 'ready() || null',
  },
  templateUrl: './segmented.html',
  styleUrl: './segmented.css',
})
export class HySegmented<T> implements FormValueControl<T | undefined> {
  protected readonly groupName = injectId('segmented');
  private readonly row = viewChild<ElementRef<HTMLElement>>('row');
  private readonly items = viewChildren('item', { read: ElementRef<HTMLElement> });

  /** The choices. */
  readonly options = input.required<readonly HySegmentedOption<T>[]>();
  /** Selected value. Two-way bindable. */
  readonly value = model<T | undefined>(undefined);
  /** Accessible name of the group. */
  readonly label = input<string>();
  /** Name shared by the radio inputs. Generated when not set. */
  readonly name = input<string>('');
  /** Disables every option. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Control size. */
  readonly size = input<HySize>('md');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly shape = input<'pill' | 'rounded'>('pill');
  readonly block = input(false);
  readonly allowEmpty = input(false);
  readonly multiple = input(false);
  /** Multiple-selection model; single-value Signal Forms contract remains unchanged. */
  readonly selectedValues = model<readonly T[]>([]);
  protected selected(option: HySegmentedOption<T>): boolean {
    return this.multiple() ? this.selectedValues().includes(option.value) : this.value() === option.value;
  }
  readonly optionTemplate = input<TemplateRef<{ $implicit: HySegmentedOption<T>; selected: boolean }>>();
  protected choose(option: HySegmentedOption<T>): void {
    if (this.disabled() || option.disabled) return;
    if (this.multiple()) {
      const values = this.selectedValues();
      if (values.includes(option.value)) {
        if (this.allowEmpty() || values.length > 1) this.selectedValues.set(values.filter(value => value !== option.value));
      } else this.selectedValues.set([...values, option.value]);
    } else this.value.set(option.value);
  }
  protected clear(event: MouseEvent, option: HySegmentedOption<T>): void {
    if (this.multiple()) {
      if (this.disabled() || option.disabled || (!this.allowEmpty() && this.selected(option) && this.selectedValues().length === 1)) event.preventDefault();
      return;
    }
    if (this.disabled() || option.disabled || !this.allowEmpty() || this.value() !== option.value) return;
    event.preventDefault(); this.value.set(undefined);
  }
  /** Emits when focus leaves an option, so forms can mark the field touched. */
  readonly touch = output<void>();

  protected readonly ready = trackIndicator(this.row, () => {
    const index = this.options().findIndex((o) => o.value === this.value());
    return this.items()[index]?.nativeElement ?? null;
  });
}
