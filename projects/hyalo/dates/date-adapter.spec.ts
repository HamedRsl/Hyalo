import { describe, expect, it } from 'vitest';
import { toGregorian, isLeapJalaaliYear } from 'jalaali-js';
import { HyGregorianDateAdapter, HyJalaliDateAdapter, dateEpoch } from './date-adapter';
describe('date-only calendar arithmetic', () => {
  const gregorian = new HyGregorianDateAdapter(),
    jalali = new HyJalaliDateAdapter();
  it('rejects invalid and noncanonical serialized dates', () => {
    for (const date of ['2025-02-29', '2024-13-01', '2024-1-01', '2024-01-01T00:00:00Z', '']) {
      expect(gregorian.deserialize(date)).toBeUndefined();
      expect(() => dateEpoch(date)).toThrow();
    }
    expect(gregorian.deserialize('2024-02-29')).toBe('2024-02-29');
  });
  it('matches published jalaali-js examples and leap boundaries', () => {
    expect(jalali.create(1395, 1, 23)).toBe('2016-04-11');
    expect(jalali.parts('2016-04-11')).toEqual({ year: 1395, month: 1, day: 23 });
    expect(jalali.create(1395, 12, 30)).toBe('2017-03-20');
    expect(jalali.create(1399, 12, 30)).toBe('2021-03-20');
    expect(jalali.create(1400, 12, 30)).toBeUndefined();
    expect(jalali.create(1403, 12, 30)).toBe('2025-03-20');
    expect(jalali.create(1404, 1, 1)).toBe('2025-03-21');
  });
  it('normalizes Persian and Eastern Arabic input without accepting overflow', () => {
    expect(jalali.parse('۱۴۰۳/۱۲/۳۰')).toBe('2025-03-20');
    expect(jalali.parse('١٤٠٤/٠١/٠١')).toBe('2025-03-21');
    expect(jalali.parse('۱۴۰۰/۱۲/۳۰')).toBeUndefined();
    expect(gregorian.parse('2024/02/30')).toBeUndefined();
  });
  it('clamps end-of-month arithmetic and crosses years in each calendar', () => {
    expect(gregorian.addMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(gregorian.addMonths('2024-02-29', 12)).toBe('2025-02-28');
    expect(jalali.addDays('2025-03-20', 1)).toBe('2025-03-21');
    expect(jalali.daysInMonth('2025-03-01')).toBe(30);
    expect(jalali.daysInMonth('2024-03-01')).toBe(29);
    expect(jalali.parts(jalali.addMonths(jalali.create(1403, 6, 31)!, 1))).toEqual({
      year: 1403,
      month: 7,
      day: 30,
    });
  });
  it('round trips every month and end day across representative Jalali years', () => {
    for (let year = 1200; year <= 1600; year++)
      for (let month = 1; month <= 12; month++) {
        const first = jalali.create(year, month, 1)!;
        expect(
          jalali.create(...(Object.values(jalali.parts(first)) as [number, number, number])),
        ).toBe(first);
        const last = jalali.daysInMonth(first),
          date = jalali.create(year, month, last)!;
        const trusted = toGregorian(year, month, last);
        expect(date).toBe(
          String(trusted.gy).padStart(4, '0') +
            '-' +
            String(trusted.gm).padStart(2, '0') +
            '-' +
            String(trusted.gd).padStart(2, '0'),
        );
        if (month === 12) expect(last === 30).toBe(isLeapJalaaliYear(year));
        expect(jalali.parts(date)).toEqual({ year, month, day: last });
        expect(jalali.create(year, month, last + 1)).toBeUndefined();
      }
  });
  it('keeps timezone changes out of date-only values', () => {
    const futureLeap = jalali.create(1502, 12, 30)!;
    expect(jalali.parts(futureLeap)).toEqual({ year: 1502, month: 12, day: 30 });
    expect(
      jalali.format(futureLeap, 'en', { year: 'numeric', month: 'numeric', day: 'numeric' }),
    ).toContain('1502');
    expect(
      jalali.format('2025-03-21', 'en', { year: 'numeric', month: 'numeric', day: 'numeric' }),
    ).toContain('1404');
    expect(jalali.serialize(jalali.parse('1404/01/01')!)).toBe('2025-03-21');
    expect(jalali.create(1199, 12, 1)).toBeUndefined();
    expect(jalali.create(1601, 1, 1)).toBeUndefined();
  });
});
