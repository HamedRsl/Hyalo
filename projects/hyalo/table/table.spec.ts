import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyTable, type HyTableColumn } from './table';
import { expectNoAxeViolations } from '../src/testing/axe';
interface Project {
  id: string;
  name: string;
  cost: number;
}
const data: readonly Project[] = Object.freeze([
  { id: 'a', name: 'Zebra', cost: 20 },
  { id: 'b', name: 'Alpha', cost: 5 },
]);
const columns: readonly HyTableColumn<Project>[] = [
  { id: 'name', header: 'Project', cell: (row) => row.name, sortable: true },
  { id: 'cost', header: 'Cost', cell: (row) => row.cost, sortable: true },
];
async function setup() {
  const fixture = TestBed.createComponent(HyTable<Project>);
  fixture.componentRef.setInput('data', data);
  fixture.componentRef.setInput('columns', columns);
  fixture.componentRef.setInput('rowKey', (row: Project) => row.id);
  fixture.componentRef.setInput('rowLabel', (row: Project) => 'Select ' + row.name);
  fixture.componentRef.setInput('caption', 'Projects');
  fixture.componentRef.setInput('selectable', true);
  await fixture.whenStable();
  return fixture;
}
describe('HyTable', () => {
  it('cycles stable sorting without mutating caller rows', async () => {
    const fixture = await setup();
    const instance = fixture.componentInstance;
    instance.toggleSort(columns[0]!);
    await fixture.whenStable();
    expect(instance.view().map((row) => row.key)).toEqual(['b', 'a']);
    expect(fixture.nativeElement.querySelector('th[aria-sort]').getAttribute('aria-sort')).toBe(
      'ascending',
    );
    instance.toggleSort(columns[0]!);
    expect(instance.view().map((row) => row.key)).toEqual(['a', 'b']);
    instance.toggleSort(columns[0]!);
    expect(instance.sort()).toBeNull();
    expect(data.map((row) => row.id)).toEqual(['a', 'b']);
    await expectNoAxeViolations(fixture.nativeElement);
  });
  it('keeps off-page selection and exposes mixed selection', async () => {
    const fixture = await setup(),
      instance = fixture.componentInstance;
    instance.selected.set(['other', 'a']);
    await fixture.whenStable();
    const all = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(all.indeterminate).toBe(true);
    instance.toggleAll();
    expect(instance.selected()).toEqual(['other', 'a', 'b']);
    fixture.componentRef.setInput('data', [data[1]]);
    await fixture.whenStable();
    instance.toggleAll();
    expect(instance.selected()).toEqual(['other', 'a']);
  });
  it('renders matching rows after filtering a scrolled virtual table', async () => {
    const fixture = await setup();
    const instance = fixture.componentInstance;
    fixture.componentRef.setInput('data', [
      ...data,
      ...Array.from({ length: 30 }, (_, i) => ({ id: `extra-${i}`, name: 'Other', cost: i })),
    ]);
    fixture.componentRef.setInput('virtual', true);
    fixture.componentRef.setInput('overscan', 0);
    await fixture.whenStable();

    const viewport = fixture.nativeElement.querySelector('.viewport') as HTMLElement;
    Object.defineProperty(viewport, 'clientHeight', { value: 96 });
    viewport.scrollTop = 48 * 20;
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(instance.view().map((row) => row.key)).toEqual(['extra-18', 'extra-19']);

    instance.setFilter('name', 'alpha');
    await fixture.whenStable();
    expect(instance.view().map((row) => row.key)).toEqual(['b']);
    expect(viewport.querySelector('tbody')?.textContent).toContain('Alpha');
    expect(viewport.textContent).not.toContain('No results');
  });
  it('supports native checkboxes and handles empty loading results', async () => {
    const fixture = await setup();
    const box = fixture.nativeElement.querySelectorAll('input')[1] as HTMLInputElement;
    box.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toEqual(['a']);
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[aria-busy]').getAttribute('aria-busy')).toBe(
      'true',
    );
    expect(fixture.nativeElement.textContent).toContain('Loading');
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });
});
