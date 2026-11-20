import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { injectId } from '@hyalo/angular/core';
import { HyButton } from '@hyalo/angular/button';
import {
  HY_DATE_ADAPTER,
  HyDatePicker,
  type HyDate,
  type HyDateAdapter,
} from '@hyalo/angular/dates';
import { HyField, HyValueControl } from '@hyalo/angular/field';
import { HyTimePicker } from '@hyalo/angular/time-picker';
import { possibleInstants, zonedDateTime } from './time-zone';

export type HyDateTimeDisambiguation = 'earlier' | 'later' | 'reject';
interface Draft {
  readonly date: HyDate | null;
  readonly time: string;
}

@Component({
  selector: 'hy-date-time-picker',
  imports: [HyButton, HyDatePicker, HyField, HyTimePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-time-picker.html',
  styleUrl: './date-time-picker.css',
  host: { '(focusout)': 'leave($event)' },
})
export class HyDateTimePicker extends HyValueControl implements FormValueControl<number | null> {
  readonly value = model<number | null>(null);
  readonly adapter = input<HyDateAdapter<HyDate>>(inject(HY_DATE_ADAPTER));
  readonly locale = input('en');
  /** UTC is deterministic during SSR; supply the reader's IANA zone explicitly. */
  readonly timeZone = input('UTC');
  readonly disambiguation = input<HyDateTimeDisambiguation>('earlier');
  readonly min = input<number>();
  readonly max = input<number>();
  readonly referenceDate = input<HyDate>('2026-01-01');
  readonly isDateDisabled = input<(date: HyDate) => boolean>(() => false);
  readonly panelMode = input<'both' | 'date' | 'time'>('both');
  readonly defaultTime = input('00:00');
  readonly hourFormat = input<'auto' | '12' | '24'>('auto');
  readonly showSeconds = input(false);
  readonly timeStep = input(60);
  readonly hourStep = input(1);
  readonly minuteStep = input(1);
  readonly secondStep = input(1);
  readonly isTimeDisabled = input<(date: HyDate, time: string) => boolean>(() => false);
  readonly isHourDisabled = input<(hour: number) => boolean>(() => false);
  readonly isMinuteDisabled = input<(hour: number, minute: number) => boolean>(() => false);
  readonly isSecondDisabled = input<(hour: number, minute: number, second: number) => boolean>(
    () => false,
  );
  readonly dateLabel = input('Date');
  readonly calendarLabel = input('Calendar');
  readonly timeLabel = input('Time');
  readonly applyLabel = input('Apply');
  readonly cancelLabel = input('Cancel');
  readonly clearLabel = input('Clear');
  readonly validationMessage = input('Choose an available date and time in this time zone.');
  readonly applied = output<number>();
  readonly cancelled = output<void>();
  readonly validationChange = output<string | null>();
  override readonly labelable = false;
  protected readonly errorId = injectId('date-time-error');
  protected readonly draft = linkedSignal<Draft>(() => this.initialDraft());
  protected readonly candidate = computed(() => {
    const { date, time } = this.draft();
    const [hour = 0, minute = 0, second = 0] = time.split(':').map(Number);
    if (
      !date ||
      !time ||
      !this.adapter().deserialize(date) ||
      this.isDateDisabled()(date) ||
      this.isTimeDisabled()(date, time) ||
      this.isHourDisabled()(hour) ||
      this.isMinuteDisabled()(hour, minute) ||
      this.isSecondDisabled()(hour, minute, second)
    )
      return null;
    const instants = possibleInstants(date, time, this.timeZone());
    if (instants.length > 1 && this.disambiguation() === 'reject') return null;
    return (this.disambiguation() === 'later' ? instants.at(-1) : instants[0]) ?? null;
  });
  readonly validationError = computed(() => {
    const { date, time } = this.draft();
    if (!date && !time && !this.required()) return null;
    const candidate = this.candidate(),
      min = this.min(),
      max = this.max();
    return candidate === null ||
      (min !== undefined && (!Number.isFinite(min) || candidate < min)) ||
      (max !== undefined && (!Number.isFinite(max) || candidate > max))
      ? this.validationMessage()
      : null;
  });
  protected readonly descriptions = computed(
    () =>
      [this.describedBy(), this.validationError() ? this.errorId : null]
        .filter(Boolean)
        .join(' ') || null,
  );
  protected readonly minDate = computed(() => {
    const min = this.min();
    return min === undefined ? undefined : zonedDateTime(min, this.timeZone())?.date;
  });
  protected readonly maxDate = computed(() => {
    const max = this.max();
    return max === undefined ? undefined : zonedDateTime(max, this.timeZone())?.date;
  });

  constructor() {
    super();
    effect(() => this.validationChange.emit(this.validationError()));
  }
  private initialDraft(): Draft {
    const value = this.value();
    this.adapter();
    const wall = value === null ? null : zonedDateTime(value, this.timeZone());
    return {
      date: wall?.date ?? (this.panelMode() === 'time' ? this.referenceDate() : null),
      time: wall
        ? wall.time + (this.showSeconds() ? ':' + String(wall.second ?? 0).padStart(2, '0') : '')
        : this.panelMode() === 'date'
          ? this.defaultTime()
          : '',
    };
  }
  protected editDate(date: HyDate | null): void {
    if (!this.blocked()) this.draft.update((draft) => ({ ...draft, date }));
  }
  protected editTime(time: string): void {
    if (!this.blocked()) this.draft.update((draft) => ({ ...draft, time }));
  }
  protected apply(): void {
    const value = this.candidate();
    if (this.blocked() || this.validationError() || value === null) return;
    this.value.set(value);
    this.applied.emit(value);
    this.touch.emit();
  }
  protected cancel(): void {
    if (this.blocked()) return;
    this.reset();
    this.cancelled.emit();
    this.touch.emit();
  }
  protected clear(): void {
    if (this.blocked()) return;
    this.value.set(null);
    this.reset();
    this.touch.emit();
  }
  reset(): void {
    this.draft.set(this.initialDraft());
  }
}
