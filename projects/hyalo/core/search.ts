export function normalizeSearch(value: string, locale?: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/\u064a/gu, '\u06cc')
    .replace(/\u0643/gu, '\u06a9')
    .toLocaleLowerCase(locale);
}
