import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
} from '@angular/core';
import { HY_DATE_ADAPTER, type HyDate, type HyDateAdapter } from './date-adapter';
@Component({
  selector: 'hy-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class HyCalendar {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
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
  protected readonly firstDay = computed(() => (this.adapter().calendar === 'persian' ? 6 : 0));
  protected readonly weekdays = computed(() =>
    Array.from({ length: 7 }, (_, index) => {
      const date = '2026-01-' + String(4 + ((this.firstDay() + index) % 7)).padStart(2, '0');
      return {
        key: index,
        label: this.adapter().format(date, this.locale(), { weekday: 'short' }),
      };
    }),
  );
  protected readonly weeks = computed(() => {
    const adapter = this.adapter(),
      month = this.month();
    const start = adapter.addDays(month, -((adapter.weekday(month) - this.firstDay() + 7) % 7));
    const number = new Intl.NumberFormat(this.locale());
    const range = this.selectedRange();
    const days = Array.from({ length: 42 }, (_, index) => {
      const date = adapter.addDays(start, index),
        parts = adapter.parts(date);
      return {
        date,
        text: number.format(parts.day),
        label: adapter.format(date, this.locale()),
        outside: parts.month !== adapter.parts(month).month,
        disabled: this.unavailable(date),
        active: date === this.active(),
        selected: date === this.value() || !!(range && date >= range[0] && date <= range[1]),
      };
    });
    return Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7));
  });
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
    this.value.set(date);
    this.selected.emit(date);
  }
  protected moveMonth(direction: number): void {
    if (this.disabled() || (direction < 0 ? this.previousDisabled() : this.nextDisabled())) return;
    const next = this.adapter().addMonths(this.month(), direction);
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
    queueMicrotask(() =>
      this.element.querySelector<HTMLElement>('[data-date="' + next + '"]')?.focus(),
    );
  }
  focusActive(): void {
    this.element.querySelector<HTMLElement>('button[data-date][tabindex="0"]')?.focus();
  }
}
