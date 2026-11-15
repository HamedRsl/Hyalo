import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyFilterBar, type HyFilterField } from './filter';
import type { HyFilterClause } from './state';

type Clause = HyFilterClause<{ query: { operator: 'contains'; value: string } }>;
@Component({
  imports: [HyFilterBar],
  template: '<hy-filter-bar [fields]="fields" [(clauses)]="clauses" />',
})
class Host {
  readonly clauses = signal<readonly Clause[]>([]);
  readonly fields: readonly HyFilterField<Clause>[] = [
    {
      field: 'query',
      label: 'Search',
      create: (id, value) => ({ id, field: 'query', operator: 'contains', value }),
    },
  ];
}
describe('HyFilterBar search', () => {
  it('updates and removes its host-owned clause without replacing the focused editor', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.focus();
    input.value = 'design';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.clauses()).toEqual([
      { id: 'filter-query', field: 'query', operator: 'contains', value: 'design' },
    ]);
    input.value = 'design system';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.clauses()[0]?.id).toBe('filter-query');
    expect(document.activeElement).toBe(input);
    expect(fixture.nativeElement.querySelector('input')).toBe(input);
    const clear = fixture.nativeElement.querySelector('.editors button') as HTMLButtonElement;
    clear.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.clauses()).toEqual([]);
    expect(input.value).toBe('');
  });
});
