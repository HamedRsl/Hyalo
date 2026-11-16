import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyField, HyValueControl } from '@hyalo/angular/field';
import { HyDatePicker } from './date-picker';
import { HY_DATE_ADAPTER, type HyDate, type HyDateAdapter, type HyDateRange } from './date-adapter';
@Component({
  selector: 'hy-date-range',
  imports: [HyField, HyDatePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './date-range.html',
  styleUrl: './date-range.css',
})
export class HyDateRangePicker
  extends HyValueControl
  implements FormValueControl<HyDateRange | null>
{
  readonly value = model<HyDateRange | null>(null);
  readonly adapter = input<HyDateAdapter<HyDate>>(inject(HY_DATE_ADAPTER));
  readonly locale = input('en');
  readonly minDate = input<HyDate>();
  readonly maxDate = input<HyDate>();
  readonly startLabel = input('Start date');
  readonly endLabel = input('End date');
  readonly referenceDate = input<HyDate>('2026-01-01');
  readonly isDateDisabled = input<(date: HyDate) => boolean>(() => false);
  override readonly labelable = false;
  protected readonly draftStart = linkedSignal<HyDate | null>(() => this.value()?.start ?? null);
  protected readonly start = computed(() => this.value()?.start ?? this.draftStart());
  protected changeStart(date: HyDate | null): void {
    if (this.blocked()) return;
    const end = this.value()?.end;
    this.value.set(date && end && date <= end ? { start: date, end } : null);
    this.draftStart.set(date);
  }
  protected changeEnd(date: HyDate | null): void {
    if (this.blocked()) return;
    const start = this.start();
    this.value.set(start && date && date >= start ? { start, end: date } : null);
    this.draftStart.set(start);
  }
  reset(): void {
    this.draftStart.set(null);
  }
}
