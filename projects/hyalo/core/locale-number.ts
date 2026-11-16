import { normalizeDigits } from './digits';

/** Parsing is strict: malformed grouping and partial numbers never become a different amount. */
export function parseLocaleNumber(text: string, locale = 'en'): number | undefined {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const group = parts.find((p) => p.type === 'group')?.value ?? ',';
  const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.';
  let value = normalizeDigits(text)
    .replace(/[\u200e\u200f\u061c]/gu, '')
    .trim();
  if (!value) return undefined;
  value = value.replace(/\u2212/gu, '-');
  const [integer = '', fraction, ...extra] = value.split(decimal);
  if (extra.length || (fraction !== undefined && !/^\d*$/u.test(fraction))) return undefined;
  if (integer.includes(group)) {
    const groups = integer.replace(/^[+-]/u, '').split(group);
    if (!/^\d{1,3}$/u.test(groups[0] ?? '') || groups.slice(1).some((g) => !/^\d{3}$/u.test(g)))
      return undefined;
  }
  value = integer.split(group).join('') + (fraction === undefined ? '' : '.' + fraction);
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/u.test(value)) return undefined;
  const result = Number(value);
  return Number.isFinite(result) ? result : undefined;
}
export function normalizeIdentifier(text: string): string {
  return normalizeDigits(text).replace(/[^0-9]/gu, '');
}
