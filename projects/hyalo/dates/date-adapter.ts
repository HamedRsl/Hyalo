import { InjectionToken } from '@angular/core';
import { toGregorian, toJalaali, isValidJalaaliDate } from 'jalaali-js';
import { normalizeDigits } from '@hyalo/angular/core';

/** A Gregorian ISO date without a timezone or time of day. */
export type HyDate = string;
export interface HyDateParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}
export interface HyDateRange {
  readonly start: HyDate;
  readonly end: HyDate;
}
const DAY = 86400000;
function utc(year: number, month: number, day: number): number {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}
function iso(epoch: number): HyDate {
  return new Date(epoch).toISOString().slice(0, 10);
}
export function dateEpoch(value: HyDate): number {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) throw new RangeError('Expected YYYY-MM-DD');
  const [year = 0, month = 0, day = 0] = value.split('-').map(Number);
  const epoch = utc(year, month, day);
  if (!Number.isFinite(epoch) || iso(epoch) !== value) throw new RangeError('Invalid date');
  return epoch;
}
/** Calendar arithmetic and parsing are independent of the control and the display locale. */
export abstract class HyDateAdapter<D> {
  abstract readonly calendar: 'gregory' | 'persian';
  abstract readonly min: D;
  abstract readonly max: D;
  abstract parts(value: D): HyDateParts;
  abstract create(year: number, month: number, day: number): D | undefined;
  abstract serialize(value: D): string;
  abstract deserialize(value: string): D | undefined;
  abstract addDays(value: D, days: number): D;
  abstract compare(a: D, b: D): number;
  abstract weekday(value: D): number;
  abstract format(value: D, locale: string, options?: Intl.DateTimeFormatOptions): string;
  parse(text: string): D | undefined {
    const match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/u.exec(normalizeDigits(text).trim());
    return match ? this.create(Number(match[1]), Number(match[2]), Number(match[3])) : undefined;
  }
  startOfMonth(value: D): D {
    const { year, month } = this.parts(value);
    const result = this.create(year, month, 1);
    if (!result) throw new RangeError('Month outside supported calendar');
    return result;
  }
  addMonths(value: D, months: number): D {
    const parts = this.parts(value),
      index = parts.year * 12 + parts.month - 1 + months;
    const year = Math.floor(index / 12),
      month = (((index % 12) + 12) % 12) + 1;
    for (let day = parts.day; day >= 1; day--) {
      const next = this.create(year, month, day);
      if (next) return next;
    }
    return months < 0 ? this.min : this.max;
  }
  daysInMonth(value: D): number {
    const { year, month } = this.parts(value);
    for (let day = 31; day >= 28; day--) if (this.create(year, month, day)) return day;
    throw new RangeError('Invalid month');
  }
  inputText(value: D, locale: string): string {
    const p = this.parts(value),
      number = new Intl.NumberFormat(locale, { useGrouping: false, minimumIntegerDigits: 2 });
    return (
      new Intl.NumberFormat(locale, { useGrouping: false, minimumIntegerDigits: 4 }).format(
        p.year,
      ) +
      '/' +
      number.format(p.month) +
      '/' +
      number.format(p.day)
    );
  }
}
abstract class IsoDateAdapter extends HyDateAdapter<HyDate> {
  abstract override readonly calendar: 'gregory' | 'persian';
  abstract override readonly min: HyDate;
  abstract override readonly max: HyDate;
  serialize(value: HyDate): string {
    dateEpoch(value);
    return value;
  }
  deserialize(value: string): HyDate | undefined {
    try {
      dateEpoch(value);
      return value >= this.min && value <= this.max ? value : undefined;
    } catch {
      return undefined; /* Malformed persisted values must not reach calendar arithmetic. */
    }
  }
  addDays(value: HyDate, days: number): HyDate {
    return iso(dateEpoch(value) + Math.trunc(days) * DAY);
  }
  compare(a: HyDate, b: HyDate): number {
    return dateEpoch(a) - dateEpoch(b);
  }
  weekday(value: HyDate): number {
    return new Date(dateEpoch(value)).getUTCDay();
  }
  format(
    value: HyDate,
    locale: string,
    options: Intl.DateTimeFormatOptions = { dateStyle: 'long' },
  ): string {
    return new Intl.DateTimeFormat(locale, {
      ...options,
      calendar: this.calendar,
      timeZone: 'UTC',
    }).format(new Date(dateEpoch(value)));
  }
}
export class HyGregorianDateAdapter extends IsoDateAdapter {
  readonly calendar = 'gregory' as const;
  readonly min = '1000-01-01';
  readonly max = '2999-12-31';
  parts(value: HyDate): HyDateParts {
    const date = new Date(dateEpoch(value));
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
  }
  create(year: number, month: number, day: number): HyDate | undefined {
    if (
      ![year, month, day].every(Number.isInteger) ||
      year < 1000 ||
      year > 2999 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    )
      return undefined;
    const result = iso(utc(year, month, day)),
      parts = this.parts(result);
    return parts.year === year && parts.month === month && parts.day === day ? result : undefined;
  }
}
/** Calendar conversion stays independent of browser ICU leap-year choices. */
export class HyJalaliDateAdapter extends IsoDateAdapter {
  readonly calendar = 'persian' as const;
  readonly min = '1821-03-21';
  readonly max = '2222-03-20';
  private readonly monthNames = new Map<string, readonly string[]>();
  parts(value: HyDate): HyDateParts {
    const date = new Date(dateEpoch(value));
    const { jy, jm, jd } = toJalaali(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
    );
    return { year: jy, month: jm, day: jd };
  }
  create(year: number, month: number, day: number): HyDate | undefined {
    if (
      ![year, month, day].every(Number.isInteger) ||
      year < 1200 ||
      year > 1600 ||
      !isValidJalaaliDate(year, month, day)
    )
      return undefined;
    const { gy, gm, gd } = toGregorian(year, month, day);
    return iso(utc(gy, gm, gd));
  }
  override format(
    value: HyDate,
    locale: string,
    options: Intl.DateTimeFormatOptions = { dateStyle: 'long' },
  ): string {
    const canonical = this.parts(value);
    const parts = new Intl.DateTimeFormat(locale, {
      ...options,
      calendar: 'persian',
      timeZone: 'UTC',
    }).formatToParts(new Date(dateEpoch(value)));
    const number = (value: number, digits = 1): string =>
      new Intl.NumberFormat(locale, { useGrouping: false, minimumIntegerDigits: digits }).format(
        value,
      );
    return parts
      .map((part) => {
        if (part.type === 'year')
          return number(
            options.year === '2-digit' ? canonical.year % 100 : canonical.year,
            options.year === '2-digit' ? 2 : 1,
          );
        if (part.type === 'day') return number(canonical.day, options.day === '2-digit' ? 2 : 1);
        if (part.type !== 'month') return part.value;
        if (!/\p{Letter}/u.test(part.value))
          return number(canonical.month, options.month === '2-digit' ? 2 : 1);
        const width =
          options.month === 'short' || options.month === 'narrow' ? options.month : 'long';
        const key = locale + ':' + width;
        let names = this.monthNames.get(key);
        if (!names) {
          const formatter = new Intl.DateTimeFormat(locale, {
            calendar: 'persian',
            timeZone: 'UTC',
            month: width,
          });
          names = Array.from({ length: 12 }, (_, index) => {
            const date = toGregorian(1400, index + 1, 15);
            return (
              formatter
                .formatToParts(new Date(utc(date.gy, date.gm, date.gd)))
                .find((part) => part.type === 'month')?.value ?? ''
            );
          });
          this.monthNames.set(key, names);
        }
        return names[canonical.month - 1] ?? '';
      })
      .join('');
  }
}
export const HY_DATE_ADAPTER = new InjectionToken<HyDateAdapter<HyDate>>('HY_DATE_ADAPTER', {
  providedIn: 'root',
  factory: () => new HyGregorianDateAdapter(),
});
