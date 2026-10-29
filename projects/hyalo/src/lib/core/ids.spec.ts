import { TestBed } from '@angular/core/testing';
import { injectId } from './ids';

describe('injectId', () => {
  it('returns unique ids with the hy prefix', () => {
    const [a, b] = TestBed.runInInjectionContext(() => [injectId('tab'), injectId('tab')]);
    expect(a).toMatch(/^hy-tab-/);
    expect(b).toMatch(/^hy-tab-/);
    expect(a).not.toBe(b);
  });
});
