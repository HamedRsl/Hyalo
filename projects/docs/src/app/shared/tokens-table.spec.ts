import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { DocsTokens } from './tokens-table';

describe('DocsTokens keyboard scrolling', () => {
  it('makes the overflow code example keyboard reachable', async () => {
    TestBed.configureTestingModule({ imports: [DocsTokens], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(DocsTokens);
    fixture.componentRef.setInput('groups', []);
    await fixture.whenStable();
    const pre = fixture.nativeElement.querySelector('pre') as HTMLElement;
    expect(pre.tabIndex).toBe(0);
    fixture.destroy();
  });
});
