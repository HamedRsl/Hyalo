import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyField, HyValueControl } from '@hyalo/angular/field';
import { HyDatePicker } from './date-picker';
import { HyCalendar, type HyCalendarOptions, type HyRangeStrategy } from './calendar';
import {
  HY_DATE_ADAPTER,
  dateEpoch,
  type HyDate,
  type HyDateAdapter,
  type HyDateRange,
} from './date-adapter';
export interface HyDateRangePreset {
  readonly label: string;
  readonly range: HyDateRange;
}
@Component({
  selector: 'hy-date-range',
  imports: [HyField, HyDatePicker, HyCalendar],
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
  readonly presets = input<readonly HyDateRangePreset[]>([]);
  protected presetDisabled(range: HyDateRange): boolean {
    return (
      this.blocked() ||
      !this.validRange(range) ||
      !this.adapter().deserialize(range.start) ||
      !this.adapter().deserialize(range.end) ||
      range.start < (this.minDate() ?? this.adapter().min) ||
      range.end > (this.maxDate() ?? this.adapter().max) ||
      this.isDateDisabled()(range.start) ||
      this.isDateDisabled()(range.end)
    );
  }
  protected applyPreset(range: HyDateRange): void {
    if (!this.presetDisabled(range)) {
      this.value.set(range);
      this.touch.emit();
    }
  }
  readonly sharedCalendar = input(false);
  readonly calendarOptions = input<HyCalendarOptions>({});
  protected readonly defaultCellClass = (): string => '';
  protected readonly defaultCalendarLabels = {
    previous: 'Previous month',
    next: 'Next month',
    chooseMonth: 'Choose month',
    chooseYear: 'Choose year',
    week: 'Week',
  };
  readonly minRangeDays = input(1);
  readonly maxRangeDays = input<number>();
  readonly rangeStrategy = input<HyRangeStrategy>();
  readonly rangePreview = output<HyDateRange | null>();
  override readonly labelable = false;
  protected readonly draftStart = linkedSignal<HyDate | null>(() => this.value()?.start ?? null);
  protected readonly start = computed(() => this.value()?.start ?? this.draftStart());
  protected changeStart(date: HyDate | null): void {
    if (this.blocked()) return;
    const end = this.value()?.end;
    this.value.set(
      date && end && this.validRange({ start: date, end }) ? { start: date, end } : null,
    );
    this.draftStart.set(date);
  }
  protected changeEnd(date: HyDate | null): void {
    if (this.blocked()) return;
    const start = this.start();
    this.value.set(
      start && date && this.validRange({ start, end: date }) ? { start, end: date } : null,
    );
    this.draftStart.set(start);
  }
  private validRange(range: HyDateRange): boolean {
    if (range.start > range.end) return false;
    const days = (dateEpoch(range.end) - dateEpoch(range.start)) / 86400000 + 1,
      max = this.maxRangeDays();
    return days >= Math.max(1, this.minRangeDays()) && (max === undefined || days <= max);
  }
  protected changeRange(range: HyDateRange | null): void {
    if (!this.blocked()) this.value.set(range);
  }
  reset(): void {
    this.draftStart.set(null);
  }
}
