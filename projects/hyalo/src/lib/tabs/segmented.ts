import {
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
import { injectId } from '../core/ids';
import type { HySize } from '../core/axes';
import { HyIcon } from '../icon/icon';
import { trackIndicator } from './indicator';

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
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-segmented',
    role: 'radiogroup',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.data-size]': 'size()',
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
  /** Emits when focus leaves an option, so forms can mark the field touched. */
  readonly touch = output<void>();

  protected readonly ready = trackIndicator(this.row, () => {
    const index = this.options().findIndex((o) => o.value === this.value());
    return this.items()[index]?.nativeElement ?? null;
  });
}
