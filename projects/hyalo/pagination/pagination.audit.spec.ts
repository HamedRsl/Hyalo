import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyPagination } from './pagination';

describe('pagination audit characterization', () => {
  it('preserves the first visible record on page-size changes and blocks every navigation path when disabled', async () => {
    const fixture = TestBed.createComponent(HyPagination);
    fixture.componentRef.setInput('total', 100);
    fixture.componentRef.setInput('page', 4);
    fixture.componentRef.setInput('pageSizes', [10, 20]);
    fixture.componentRef.setInput('showJump', true);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const select = root.querySelector('select')!;
    select.value = '20';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.pageSize()).toBe(20);
    expect(fixture.componentInstance.page()).toBe(2);
    expect(fixture.componentInstance.report()).toEqual({
      $implicit: 2,
      page: 2,
      pageCount: 5,
      first: 21,
      last: 40,
      total: 100,
    });
    const jump = root.querySelector('input')!;
    jump.value = '5';
    jump.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.page()).toBe(5);
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    expect(
      [...root.querySelectorAll('button,input,select')].every(
        (element) => (element as HTMLInputElement).disabled,
      ),
    ).toBe(true);
    fixture.componentInstance.go(1);
    fixture.componentInstance.changePageSize(10);
    expect(fixture.componentInstance.page()).toBe(5);
    expect(fixture.componentInstance.pageSize()).toBe(20);
  });
});
