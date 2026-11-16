import { rowWindow } from './window';

describe('virtual row windows', () => {
  it('accounts for every pixel and covers partial rows across scroll offsets', () => {
    for (const offset of [0, 1, 19, 20, 50, 999, 20000]) {
      const w = rowWindow(100, 20, offset, 100, 2);
      expect(w.before + (w.last - w.first) * 20 + w.after).toBe(2000);
      expect(w.first).toBeGreaterThanOrEqual(0);
      expect(w.last).toBeLessThanOrEqual(100);
      expect(w.last).toBeGreaterThan(w.first);
    }
    expect(rowWindow(100, 20, 10, 40, 0)).toMatchObject({ first: 0, last: 3 });
    expect(rowWindow(100, 20, -20, 100, 0).first).toBe(0);
  });
  it('uses a bounded initial slice and survives filtering and invalid sizes', () => {
    expect(rowWindow(1000, 20, 0, 0, 2, 10)).toMatchObject({ first: 0, last: 12 });
    expect(rowWindow(3, 20, 10000, 100, 2)).toMatchObject({
      first: 0,
      last: 3,
      before: 0,
      after: 0,
    });
    for (const height of [0, -1, NaN, Infinity])
      expect(rowWindow(100, height, 0, 100).last).toBe(0);
    expect(rowWindow(0, 20, 0, 100)).toEqual({ first: 0, last: 0, before: 0, after: 0 });
  });
});
