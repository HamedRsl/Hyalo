export type HyFilterScalar = string | number | boolean;
export type HyDatePreset = '24H' | '7D' | '30D' | '1Y';
export type HyDateRangeValue =
  | { readonly kind: 'preset'; readonly preset: HyDatePreset; readonly timeZone: string }
  | {
      readonly kind: 'absolute';
      readonly start: string;
      readonly end: string;
      readonly timeZone: string;
    };
export type HyFilterRule =
  | { readonly operator: 'eq'; readonly value: HyFilterScalar }
  | { readonly operator: 'in'; readonly value: readonly HyFilterScalar[] }
  | { readonly operator: 'contains'; readonly value: string }
  | { readonly operator: 'between'; readonly value: readonly [number, number] | HyDateRangeValue };
export type HyFilterClause<S> = {
  [K in keyof S]: { readonly id: string; readonly field: K } & S[K];
}[keyof S];
export type HyFilterToken = { readonly id: string; readonly field: string } & HyFilterRule;
export interface HyFilterCodec<C extends HyFilterToken> {
  readonly accepts: (value: unknown) => value is C;
}
export function encodeFilters<C extends HyFilterToken>(clauses: readonly C[]): string {
  return JSON.stringify({ version: 1, clauses });
}
export function decodeFilters<C extends HyFilterToken>(
  text: string,
  codec: HyFilterCodec<C>,
): readonly C[] {
  const payload: unknown = JSON.parse(text);
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('version' in payload) ||
    payload.version !== 1 ||
    !('clauses' in payload) ||
    !Array.isArray(payload.clauses)
  )
    throw new Error('Unsupported filter state');
  const ids = new Set<string>();
  return payload.clauses.map((value: unknown) => {
    if (!isFilterToken(value) || !codec.accepts(value) || ids.has(value.id))
      throw new Error('Invalid or unsupported filter clause');
    ids.add(value.id);
    return value;
  });
}
export function isFilterToken(value: unknown): value is HyFilterToken {
  if (
    !value ||
    typeof value !== 'object' ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !value.id ||
    !('field' in value) ||
    typeof value.field !== 'string' ||
    !value.field ||
    !('operator' in value) ||
    !('value' in value)
  )
    return false;
  const data = value.value;
  const scalar = (v: unknown): v is HyFilterScalar =>
    typeof v === 'string' ||
    typeof v === 'boolean' ||
    (typeof v === 'number' && Number.isFinite(v));
  if (value.operator === 'eq') return scalar(data);
  if (value.operator === 'contains') return typeof data === 'string';
  if (value.operator === 'in') return Array.isArray(data) && data.every(scalar);
  if (value.operator !== 'between') return false;
  if (Array.isArray(data))
    return (
      data.length === 2 &&
      data.every((v) => typeof v === 'number' && Number.isFinite(v)) &&
      data[0] <= data[1]
    );
  if (
    !data ||
    typeof data !== 'object' ||
    !('timeZone' in data) ||
    typeof data.timeZone !== 'string' ||
    !('kind' in data)
  )
    return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: data.timeZone });
  } catch {
    return false;
  }
  if (data.kind === 'preset')
    return 'preset' in data && ['24H', '7D', '30D', '1Y'].includes(String(data.preset));
  const instant = (v: unknown): v is string =>
    typeof v === 'string' &&
    /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(v) &&
    Number.isFinite(Date.parse(v));
  return (
    data.kind === 'absolute' &&
    'start' in data &&
    'end' in data &&
    instant(data.start) &&
    instant(data.end) &&
    Date.parse(data.start) < Date.parse(data.end)
  );
}

/** Presets are rolling elapsed intervals; both editors use start-inclusive/end-exclusive instants. */
export function resolveDateRange(
  value: HyDateRangeValue,
  now: Date,
): { readonly start: string; readonly end: string } {
  if (
    !isFilterToken({ id: 'range', field: 'time', operator: 'between', value }) ||
    !Number.isFinite(now.getTime())
  )
    throw new Error('Invalid date range');
  if (value.kind === 'absolute') return { start: value.start, end: value.end };
  const hours = { '24H': 24, '7D': 168, '30D': 720, '1Y': 8760 }[value.preset];
  return { start: new Date(now.getTime() - hours * 3600000).toISOString(), end: now.toISOString() };
}
