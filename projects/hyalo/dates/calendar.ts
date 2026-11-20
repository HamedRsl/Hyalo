import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  Injector,
  ElementRef,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import {
  HY_DATE_ADAPTER,
  dateEpoch,
  type HyDate,
  type HyDateAdapter,
  type HyDateRange,
} from './date-adapter';
export type HyCalendarView = 'month' | 'year' | 'multi-year';
export interface HyCalendarLabels {
  readonly previous: string;
  readonly next: string;
  readonly chooseMonth: string;
  readonly chooseYear: string;
  readonly week: string;
}
export interface HyCalendarCellContext {
  readonly $implicit: HyDate;
  readonly selected: boolean;
  readonly preview: boolean;
  readonly comparison: boolean;
  readonly outside: boolean;
}
export type HyRangeStrategy = (
  date: HyDate,
  current: HyDateRange | null,
  phase: 'select' | 'preview',
) => HyDateRange | null;
export interface HyCalendarOptions {
  readonly view?: HyCalendarView;
  readonly months?: number;
  readonly firstDayOfWeek?: number;
  readonly showWeekNumbers?: boolean;
  readonly outsideDays?: 'visible' | 'hidden' | 'disabled';
  readonly labels?: HyCalendarLabels;
  readonly cellClass?: (date: HyDate) => string | string[];
  readonly cellTemplate?: TemplateRef<HyCalendarCellContext>;
  readonly headerTemplate?: TemplateRef<{ $implicit: HyCalendar; heading: string }>;
  readonly comparisonRange?: HyDateRange;
}
interface CalendarDay {
  readonly date: HyDate;
  readonly text: string;
  readonly label: string;
  readonly outside: boolean;
  readonly disabled: boolean;
  readonly active: boolean;
  readonly selected: boolean;
  readonly preview: boolean;
  readonly comparison: boolean;
  readonly classes: string | string[];
}
interface CalendarWeek {
  readonly days: readonly CalendarDay[];
  readonly number: number;
}
@Component({
  selector: 'hy-calendar',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class HyCalendar {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  readonly adapter = input<HyDateAdapter<HyDate>>(inject(HY_DATE_ADAPTER));
  readonly locale = input('en');
  readonly value = model<HyDate | undefined>(undefined);
  /** Supply a deterministic reference date from the host for SSR and hydration. */
  readonly referenceDate = input<HyDate>('2026-01-01');
  readonly min = input<HyDate>();
  readonly max = input<HyDate>();
  readonly disabled = input(false);
  readonly isDateDisabled = input<(date: HyDate) => boolean>(() => false);
  readonly selectedRange = input<readonly [HyDate, HyDate]>();
  readonly selected = output<HyDate>();
  readonly view = model<HyCalendarView>('month');
  readonly months = input(1);
  readonly firstDayOfWeek = input<number>();
  readonly showWeekNumbers = input(false);
  readonly weekNumber = input<(date: HyDate) => number>();
  readonly outsideDays = input<'visible' | 'hidden' | 'disabled'>('visible');
  readonly selectedDates = model<readonly HyDate[]>([]);
  readonly multiple = input(false);
  readonly comparisonRange = input<HyDateRange>();
  readonly rangeMode = input(false);
  readonly range = model<HyDateRange | null>(null);
  readonly minRangeDays = input(1);
  readonly maxRangeDays = input<number>();
  readonly rangeStrategy = input<HyRangeStrategy>();
  readonly rangeStarted = output<HyDate>();
  readonly rangePreview = output<HyDateRange | null>();
  readonly cellClass = input<(date: HyDate) => string | string[]>(() => '');
  readonly cellTemplate = input<TemplateRef<HyCalendarCellContext>>();
  readonly headerTemplate = input<TemplateRef<{ $implicit: HyCalendar; heading: string }>>();
  readonly labels = input<HyCalendarLabels>({
    previous: 'Previous month',
    next: 'Next month',
    chooseMonth: 'Choose month',
    chooseYear: 'Choose year',
    week: 'Week',
  });
  private readonly rangeStart = signal<HyDate | null>(null);
  protected readonly preview = signal<HyDateRange | null>(null);
  protected readonly active = linkedSignal(() => {
    const adapter = this.adapter(),
      min = this.min() ?? adapter.min,
      max = this.max() ?? adapter.max;
    const candidate =
      adapter.deserialize(this.value() ?? '') ?? adapter.deserialize(this.referenceDate()) ?? min;
    return candidate < min ? min : candidate > max ? max : candidate;
  });
  protected readonly month = linkedSignal(() => this.adapter().startOfMonth(this.active()));
  protected readonly heading = computed(() =>
    this.adapter().format(this.month(), this.locale(), { month: 'long', year: 'numeric' }),
  );
  protected readonly firstDay = computed(() => {
    const first = this.firstDayOfWeek();
    if (first === undefined) return this.adapter().calendar === 'persian' ? 6 : 0;
    return ((Math.floor(first) % 7) + 7) % 7;
  });
  protected readonly weekdays = computed(() =>
    Array.from({ length: 7 }, (_, index) => {
      const date = '2026-01-' + String(4 + ((this.firstDay() + index) % 7)).padStart(2, '0');
      return {
        key: index,
        label: this.adapter().format(date, this.locale(), { weekday: 'short' }),
      };
    }),
  );
  protected readonly weeks = computed(() => this.monthWeeks(this.month()));
  protected readonly monthViews = computed(() =>
    Array.from({ length: Math.min(12, Math.max(1, Math.floor(this.months()))) }, (_, index) => {
      const month = this.adapter().addMonths(this.month(), index);
      return {
        month,
        heading: this.adapter().format(month, this.locale(), { month: 'long', year: 'numeric' }),
        weeks: this.monthWeeks(month),
      };
    }),
  );
  protected readonly monthChoices = computed(() => {
    const adapter = this.adapter(),
      year = adapter.parts(this.month()).year;
    return Array.from({ length: 12 }, (_, index) => {
      const date = adapter.create(year, index + 1, 1);
      return date
        ? {
            date,
            label: adapter.format(date, this.locale(), { month: 'short' }),
            disabled:
              adapter.addDays(date, adapter.daysInMonth(date) - 1) < (this.min() ?? adapter.min) ||
              date > (this.max() ?? adapter.max),
          }
        : null;
    }).filter((item) => item !== null);
  });
  protected readonly yearChoices = computed(() => {
    const adapter = this.adapter(),
      year = adapter.parts(this.month()).year,
      start = Math.floor(year / 24) * 24;
    return Array.from({ length: 24 }, (_, index) => {
      const date = adapter.create(start + index, 1, 1);
      return {
        year: start + index,
        date,
        label: new Intl.NumberFormat(this.locale(), { useGrouping: false }).format(start + index),
        disabled:
          !date ||
          start + index < adapter.parts(this.min() ?? adapter.min).year ||
          start + index > adapter.parts(this.max() ?? adapter.max).year,
      };
    });
  });
  private monthWeeks(month: HyDate): CalendarWeek[] {
    const adapter = this.adapter(),
      visibleMonth = adapter.parts(month).month;
    const start = adapter.addDays(month, -((adapter.weekday(month) - this.firstDay() + 7) % 7));
    const number = new Intl.NumberFormat(this.locale());
    const selection = this.range();
    const range =
      this.selectedRange() ?? (selection ? [selection.start, selection.end] : undefined);
    const preview = this.preview(),
      comparison = this.comparisonRange();
    return Array.from({ length: 6 }, (_, week) => {
      const weekStart = adapter.addDays(start, week * 7);
      return {
        days: Array.from({ length: 7 }, (_, index) => {
          const date = index === 0 ? weekStart : adapter.addDays(start, week * 7 + index),
            parts = adapter.parts(date),
            outside = parts.month !== visibleMonth;
          return {
            date,
            text: number.format(parts.day),
            label: adapter.format(date, this.locale()),
            outside,
            disabled: this.unavailable(date) || (outside && this.outsideDays() === 'disabled'),
            active: date === this.active() && !outside,
            selected:
              date === this.value() ||
              this.selectedDates().includes(date) ||
              !!(range && date >= range[0] && date <= range[1]),
            preview: !!(preview && date >= preview.start && date <= preview.end),
            comparison: !!(comparison && date >= comparison.start && date <= comparison.end),
            classes: this.cellClass()(date),
          };
        }),
        number: this.weekNumber()?.(weekStart) ?? this.isoWeek(weekStart),
      };
    });
  }
  private isoWeek(date: HyDate): number {
    const value = new Date(dateEpoch(date));
    value.setUTCDate(value.getUTCDate() + 4 - (value.getUTCDay() || 7));
    const start = new Date(0);
    start.setUTCFullYear(value.getUTCFullYear(), 0, 1);
    start.setUTCHours(0, 0, 0, 0);
    return Math.ceil(((value.getTime() - start.getTime()) / 86400000 + 1) / 7);
  }
  protected readonly previousDisabled = computed(
    () => this.month() <= this.adapter().startOfMonth(this.min() ?? this.adapter().min),
  );
  protected readonly nextDisabled = computed(
    () => this.month() >= this.adapter().startOfMonth(this.max() ?? this.adapter().max),
  );
  protected unavailable(date: HyDate): boolean {
    return (
      this.disabled() ||
      date < (this.min() ?? this.adapter().min) ||
      date > (this.max() ?? this.adapter().max) ||
      this.isDateDisabled()(date)
    );
  }
  protected pick(date: HyDate): void {
    if (this.unavailable(date)) return;
    this.active.set(date);
    if (this.rangeMode()) {
      const start = this.rangeStart();
      const strategy = this.rangeStrategy();
      if (strategy) {
        const next = strategy(date, start ? { start, end: start } : this.range(), 'select');
        if (next && this.validRange(next)) {
          this.range.set(next);
          this.rangeStart.set(null);
          this.preview.set(null);
        }
      } else if (!start) {
        this.rangeStart.set(date);
        this.range.set(null);
        this.preview.set({ start: date, end: date });
        this.rangeStarted.emit(date);
      } else {
        const next = { start: date < start ? date : start, end: date < start ? start : date };
        if (this.validRange(next)) {
          this.range.set(next);
          this.rangeStart.set(null);
          this.preview.set(null);
        }
      }
      this.selected.emit(date);
      return;
    }
    if (this.multiple()) {
      this.selectedDates.update((dates) =>
        dates.includes(date) ? dates.filter((item) => item !== date) : [...dates, date],
      );
      this.selected.emit(date);
      return;
    }
    this.value.set(date);
    this.selected.emit(date);
  }
  private validRange(range: HyDateRange): boolean {
    if (
      !this.adapter().deserialize(range.start) ||
      !this.adapter().deserialize(range.end) ||
      range.start > range.end ||
      this.unavailable(range.start) ||
      this.unavailable(range.end)
    )
      return false;
    const days = (dateEpoch(range.end) - dateEpoch(range.start)) / 86400000 + 1,
      max = this.maxRangeDays();
    return days >= Math.max(1, this.minRangeDays()) && (max === undefined || days <= max);
  }
  protected previewDate(date: HyDate): void {
    if (!this.rangeMode()) return;
    const start = this.rangeStart();
    if (!start) return;
    if (this.unavailable(date)) {
      this.preview.set(null);
      this.rangePreview.emit(null);
      return;
    }
    const strategy = this.rangeStrategy();
    const range = strategy
      ? strategy(date, { start, end: start }, 'preview')
      : {
          start: date < start ? date : start,
          end: date < start ? start : date,
        };
    const next = range && this.validRange(range) ? range : null;
    this.preview.set(next);
    this.rangePreview.emit(next);
  }
  protected choiceKeys(event: KeyboardEvent): void {
    const buttons = [
      ...this.element.querySelectorAll<HTMLButtonElement>(
        '.calendar-choices button:not(:disabled)',
      ),
    ];
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    const rtl = this.element.closest('[dir="rtl"]') !== null;
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = index + (rtl ? -1 : 1);
        break;
      case 'ArrowLeft':
        next = index + (rtl ? 1 : -1);
        break;
      case 'ArrowDown':
        next = index + 4;
        break;
      case 'ArrowUp':
        next = index - 4;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = buttons.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    buttons[Math.max(0, Math.min(buttons.length - 1, next))]?.focus();
  }
  private focusChoices(): void {
    afterNextRender(
      () =>
        this.element
          .querySelector<HTMLButtonElement>('.calendar-choices button:not(:disabled)')
          ?.focus(),
      { injector: this.injector },
    );
  }
  showView(view: HyCalendarView): void {
    if (!this.disabled()) {
      this.view.set(view);
      if (view === 'month') afterNextRender(() => this.focusActive(), { injector: this.injector });
      else this.focusChoices();
    }
  }
  protected chooseMonth(date: HyDate): void {
    if (this.disabled()) return;
    const min = this.min() ?? this.adapter().min;
    const max = this.max() ?? this.adapter().max;
    const active = date < min ? min : date > max ? max : date;
    this.active.set(active);
    this.month.set(this.adapter().startOfMonth(active));
    this.view.set('month');
    afterNextRender(() => this.focusActive(), { injector: this.injector });
  }
  protected chooseYear(date: HyDate | undefined): void {
    if (!date || this.disabled()) return;
    this.month.set(date);
    this.active.set(date);
    this.view.set('year');
    this.focusChoices();
  }
  moveMonth(direction: number): void {
    if (this.disabled() || (direction < 0 ? this.previousDisabled() : this.nextDisabled())) return;
    const next = this.adapter().addMonths(
      this.month(),
      direction * (this.view() === 'multi-year' ? 288 : this.view() === 'year' ? 12 : 1),
    );
    this.month.set(next);
    this.active.set(next);
  }
  protected keys(event: KeyboardEvent, date: HyDate): void {
    const adapter = this.adapter(),
      rtl = this.element.closest('[dir="rtl"]') !== null;
    let next: HyDate;
    switch (event.key) {
      case 'ArrowRight':
        next = adapter.addDays(date, rtl ? -1 : 1);
        break;
      case 'ArrowLeft':
        next = adapter.addDays(date, rtl ? 1 : -1);
        break;
      case 'ArrowUp':
        next = adapter.addDays(date, -7);
        break;
      case 'ArrowDown':
        next = adapter.addDays(date, 7);
        break;
      case 'Home':
        next = adapter.addDays(date, -((adapter.weekday(date) - this.firstDay() + 7) % 7));
        break;
      case 'End':
        next = adapter.addDays(date, 6 - ((adapter.weekday(date) - this.firstDay() + 7) % 7));
        break;
      case 'PageUp':
        next = adapter.addMonths(date, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = adapter.addMonths(date, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next < (this.min() ?? adapter.min) || next > (this.max() ?? adapter.max)) return;
    this.active.set(next);
    this.month.set(adapter.startOfMonth(next));
    afterNextRender(() => this.focusActive(), { injector: this.injector });
  }
  focusActive(): void {
    this.element.querySelector<HTMLElement>('button[data-date][tabindex="0"]')?.focus();
  }
}
