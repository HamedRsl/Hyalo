import {
  decodeFilters,
  encodeFilters,
  isFilterToken,
  resolveDateRange,
  type HyFilterToken,
} from './state';

const codec = { accepts: isFilterToken };

describe('persisted filter state', () => {
  it('round trips scalar, array, empty, numeric and calendar-independent range clauses', () => {
    const clauses: readonly HyFilterToken[] = [
      { id: 'status', field: 'status', operator: 'eq', value: 'active' },
      { id: 'flags', field: 'flags', operator: 'in', value: [true, false, 0, 'pending'] },
      { id: 'empty', field: 'tags', operator: 'in', value: [] },
      { id: 'query', field: 'query', operator: 'contains', value: '' },
      { id: 'amount', field: 'amount', operator: 'between', value: [0, 100] },
      {
        id: 'preset',
        field: 'createdAt',
        operator: 'between',
        value: { kind: 'preset', preset: '7D', timeZone: 'Asia/Tehran' },
      },
      {
        id: 'dates',
        field: 'createdAt',
        operator: 'between',
        value: {
          kind: 'absolute',
          start: '2026-11-01T00:00:00+03:30',
          end: '2026-12-01T00:00:00+03:30',
          timeZone: 'Asia/Tehran',
        },
      },
    ];
    expect(decodeFilters(encodeFilters(clauses), codec)).toEqual(clauses);
    expect(decodeFilters(encodeFilters([]), codec)).toEqual([]);
  });

  it('rejects invalid envelopes, duplicate IDs and unknown host fields without accepting partial state', () => {
    for (const text of [
      'not json',
      '{}',
      '{"version":2,"clauses":[]}',
      '{"version":1,"clauses":null}',
    ]) {
      expect(() => decodeFilters(text, codec)).toThrow();
    }
    const item: HyFilterToken = { id: 'x', field: 'status', operator: 'eq', value: true };
    expect(() => decodeFilters(encodeFilters([item, item]), codec)).toThrow();
    const hostCodec = {
      accepts: (value: unknown): value is HyFilterToken =>
        isFilterToken(value) && value.field === 'query' && value.operator === 'contains',
    };
    expect(() => decodeFilters(encodeFilters([item]), hostCodec)).toThrow();
  });

  it('uses explicit rolling elapsed windows across DST with an exclusive supplied end', () => {
    const now = new Date('2026-11-01T12:00:00Z');
    expect(
      resolveDateRange({ kind: 'preset', preset: '24H', timeZone: 'America/New_York' }, now),
    ).toEqual({ start: '2026-10-31T12:00:00.000Z', end: '2026-11-01T12:00:00.000Z' });
    expect(() =>
      resolveDateRange({ kind: 'preset', preset: '24H', timeZone: 'UTC' }, new Date('invalid')),
    ).toThrow();
  });

  it('rejects impossible calendar instants rather than letting Date.parse normalize them', () => {
    const range = (start: string, end = '2026-04-01T00:00:00Z'): unknown => ({
      id: 'x',
      field: 'created',
      operator: 'between',
      value: { kind: 'absolute', start, end, timeZone: 'UTC' },
    });
    for (const value of [
      '2026-02-30T12:00:00Z',
      '2026-02-29T12:00:00Z',
      '2026-02-28T24:00:00Z',
      '2026-02-28T12:99:00Z',
      '2026-02-28T12:00:00',
    ]) {
      expect(isFilterToken(range(value))).toBe(false);
    }
    expect(isFilterToken(range('2024-02-29T12:00:00Z'))).toBe(true);
    expect(isFilterToken(range('2026-03-01T00:00:00+03:30'))).toBe(true);
    expect(isFilterToken(range('2026-03-01T00:00:00Z', '2026-03-01T00:00:00Z'))).toBe(false);
  });

  it('rejects invalid operators, primitive values, reversed bounds and timezones', () => {
    for (const [operator, value] of [
      ['unknown', 1],
      ['eq', null],
      ['between', [10, 1]],
      ['between', [1]],
      ['in', [null]],
      ['between', { kind: 'preset', preset: '24H', timeZone: 'Not/AZone' }],
    ]) {
      expect(isFilterToken({ id: 'x', field: 'x', operator, value })).toBe(false);
    }
  });
});
