import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyPagination } from './pagination';
@Component({ imports: [HyPagination], template: `<ng-template #report let-first="first" let-last="last" let-total="total"><output>{{first}}–{{last}}/{{total}}</output></ng-template><hy-pagination [total]="95" [page]="5" [showFirstLast]="false" [siblingCount]="0" [reportTemplate]="report"><b hyPaginationStart>Start</b><i hyPaginationEnd>End</i></hy-pagination>` })
class Host {}
describe('pagination composition', () => {
  it('renders report context and projected slots with a current-only page layout', async () => {
    const f = TestBed.createComponent(Host); await f.whenStable();
    expect(f.nativeElement.querySelector('output').textContent).toBe('41–50/95');
    expect(f.nativeElement.querySelector('b').textContent).toBe('Start'); expect(f.nativeElement.querySelector('i').textContent).toBe('End');
    expect(f.nativeElement.querySelectorAll('button').length).toBe(3);
    expect(f.nativeElement.querySelector('[aria-current]').textContent.trim()).toBe('5');
  });
});
