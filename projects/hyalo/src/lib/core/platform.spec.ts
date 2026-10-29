import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectIsBrowser, matchesMedia } from './platform';

describe('injectIsBrowser', () => {
  it('is true in the browser', () => {
    expect(TestBed.runInInjectionContext(injectIsBrowser)).toBe(true);
  });

  it('is false on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    expect(TestBed.runInInjectionContext(injectIsBrowser)).toBe(false);
  });
});

describe('matchesMedia', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads the query', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query === '(hover: hover)' }));
    expect(matchesMedia('(hover: hover)')).toBe(true);
    expect(matchesMedia('(pointer: coarse)')).toBe(false);
  });

  it('is false without matchMedia, as on the server', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(matchesMedia('(hover: hover)')).toBe(false);
  });
});
