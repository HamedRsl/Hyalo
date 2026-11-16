import { describe, expect, it } from 'vitest';
import { parseLocaleNumber, normalizeIdentifier } from './locale-number';
describe('localized input', () => {
  it('parses both Arabic digit sets, decimal/group separators, and negative signs', () => {
    expect(parseLocaleNumber('۱۲۳٬۴۵۶٫۷', 'fa-IR')).toBe(123456.7);
    expect(parseLocaleNumber('−١٢٣٫٤', 'fa-IR')).toBe(-123.4);
    expect(parseLocaleNumber('1,234.5', 'en')).toBe(1234.5);
    expect(parseLocaleNumber('1.234,5', 'de')).toBe(1234.5);
  });
  it('rejects malformed grouping, partial drafts, and non-finite values', () => {
    for (const value of ['1,23', '12abc', '-', '1.2.3', 'Infinity', '1e999'])
      expect(parseLocaleNumber(value)).toBeUndefined();
    expect(parseLocaleNumber('')).toBeUndefined();
  });
  it('keeps leading zeros in identifiers', () => {
    expect(normalizeIdentifier('۰۰۱٢٣')).toBe('00123');
  });
});
