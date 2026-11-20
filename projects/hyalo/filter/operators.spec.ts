import { describe, expect, it } from 'vitest';
import { evaluateFilters, type HyFilterGroup, type HyFilterOperatorRegistry } from './operators';

describe('API-124/125 executable filter constraints', () => {
  const registry: HyFilterOperatorRegistry = {
    eq: (actual, expected) => actual === expected,
    starts: (actual, expected) => typeof actual === 'string' && actual.startsWith(String(expected)),
    above: (actual, expected) => typeof actual === 'number' && actual > Number(expected),
  };
  const groups: readonly HyFilterGroup[] = [
    {
      field: 'name',
      operator: 'or',
      constraints: [
        { operator: 'starts', value: 'A' },
        { operator: 'eq', value: 'Bob' },
      ],
    },
    {
      field: 'age',
      operator: 'and',
      constraints: [
        { operator: 'above', value: 17 },
        { operator: 'above', value: 20 },
      ],
    },
  ];
  it('executes custom operators and combines per-field OR and AND constraints', () => {
    expect(evaluateFilters({ name: 'Alice', age: 25 }, groups, registry)).toBe(true);
    expect(evaluateFilters({ name: 'Bob', age: 19 }, groups, registry)).toBe(false);
    expect(evaluateFilters({ name: 'Carol', age: 25 }, groups, registry)).toBe(false);
    expect(evaluateFilters({ name: 'Carol', age: 25 }, groups, registry, 'or')).toBe(true);
    expect(evaluateFilters({}, [], registry)).toBe(true);
  });
  it('fails closed for unknown operators, including inherited object properties', () => {
    for (const operator of ['missing', 'toString', '__proto__']) {
      expect(
        evaluateFilters(
          { name: 'Alice' },
          [{ field: 'name', operator: 'and', constraints: [{ operator, value: 'Alice' }] }],
          registry,
        ),
      ).toBe(false);
    }
  });
});
