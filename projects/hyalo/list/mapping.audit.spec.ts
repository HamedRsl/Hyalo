import { Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyList, HyListItem } from './list';
import { HyPagination } from '@hyalo/angular/pagination';

@Component({
  imports: [HyList, HyListItem, HyPagination],
  template: `<hy-list label="Results">@for(item of visible(); track item){<li hyListItem [heading]="item"></li>}</hy-list>
    <hy-pagination label="Result pages" [total]="items().length" [pageSize]="2" [(page)]="page" />`,
})
class PagedList {
  readonly page = signal(1);
  readonly items = signal(['A', 'B', 'C', 'D', 'E']);
  readonly visible = computed(() => this.items().slice((this.page() - 1) * 2, this.page() * 2));
}

describe('API-147 list paging composition', () => {
  it('updates semantic list rows from actual pagination interactions', async () => {
    const f = TestBed.createComponent(PagedList);
    await f.whenStable();
    const rows = () => [...f.nativeElement.querySelectorAll('li[hyListItem]')].map((li: Element) => li.textContent);
    const next = () => f.nativeElement.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;
    expect(rows()).toEqual(['A', 'B']);
    expect(f.nativeElement.querySelector('ul').getAttribute('aria-label')).toBe('Results');
    expect(f.nativeElement.querySelector('[role="listbox"]')).toBeNull();
    next().click(); await f.whenStable();
    expect(f.componentInstance.page()).toBe(2);
    expect(rows()).toEqual(['C', 'D']);
    next().click(); await f.whenStable();
    expect(rows()).toEqual(['E']);
    expect(next().disabled).toBe(true);
    f.destroy();
  });
});
