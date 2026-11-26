import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyTable, type HyTableColumn } from './table';
interface Row { id: number; team: string; name: string; }
@Component({
  imports: [HyTable],
  template: `<hy-table [data]="rows" [columns]="columns" [rowKey]="key" caption="Teams"
    [groupBy]="group" [groupTemplate]="heading" [rowTemplate]="details" [headerRows]="headers" [footerTemplate]="footer">
    <ng-template #details let-row><span class="details">Details {{row.name}}</span></ng-template>
    <ng-template #footer let-rows><span class="summary">Total {{rows.length}}</span></ng-template>
    <ng-template #heading let-team let-rows="rows"><span class="group-summary">{{team}}:{{rows.length}}</span></ng-template>
  </hy-table>`,
})
class Host {
  readonly headers = [[{label:'People',colspan:2}]];
  readonly table = viewChild.required(HyTable<Row>);
  readonly rows: readonly Row[] = Object.freeze([{id:1,team:'A',name:'One'}, {id:2,team:'A',name:'Two'}, {id:3,team:'B',name:'Three'}]);
  readonly columns: readonly HyTableColumn<Row>[] = [{id:'name',header:'Name',cell:row=>row.name,sortable:true}];
  readonly key = (row: Row): number => row.id;
  readonly group = (row: Row): string => row.team;
}
describe('table workflow contracts', () => {
  it('snapshots query collections without sharing mutable caller references', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const table = fixture.componentInstance.table();
    table.sort.set({column:'name',direction:'asc'});
    table.filters.set({name:'One'});
    const saved = table.saveState();
    (saved.filters as Record<string, unknown>)['name'] = 'Two';
    (saved.sorts[0] as {direction:string}).direction = 'desc';
    expect(table.filters()).toEqual({name:'One'});
    expect(table.sort()).toEqual({column:'name',direction:'asc'});
  });
  it('restores a detached state and drives the rendered query and columns', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const table = fixture.componentInstance.table();
    const state = {...table.saveState(), filters:{name:'Two'}, selected:[2], columnWidths:{name:220}, sorts:[{column:'name',direction:'desc' as const}]};
    table.restoreState(state);
    state.filters.name = 'Three';
    state.selected.push(3);
    state.columnWidths.name = 400;
    state.sorts[0]!.direction = 'asc' as 'desc';
    await fixture.whenStable();
    expect(table.pageRows().map(row => row.id)).toEqual([2]);
    expect(table.selected()).toEqual([2]);
    expect(table.width(table.columns()[0]!)).toBe(220);
    expect(table.sortDirection('name')).toBe('desc');
  });
  it('exports filtered, selected and all rows with ordered columns and CSV escaping', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const table = fixture.componentInstance.table();
    table.selected.set([3]);
    table.setFilter('name','Two');
    expect(table.exportCsv()).toBe('"Name"\r\n"Two"');
    expect(table.exportCsv('selected')).toBe('"Name"\r\n"Three"');
    expect(table.exportCsv('all')).toBe('"Name"\r\n"One"\r\n"Two"\r\n"Three"');
    const standalone = TestBed.createComponent(HyTable<Row>);
    standalone.componentRef.setInput('data',[{id:1,team:'A',name:'A,"B"\nC'}]);
    standalone.componentRef.setInput('columns',[
      {id:'name',header:'Name',cell:(row:Row)=>row.name},
      {id:'team',header:'Team',cell:(row:Row)=>row.team},
    ]);
    standalone.componentRef.setInput('rowKey',(row:Row)=>row.id);
    standalone.componentRef.setInput('caption','CSV');
    await standalone.whenStable();
    standalone.componentInstance.moveColumn('team',0);
    expect(standalone.componentInstance.exportCsv()).toBe('"Team","Name"\r\n"A","A,""B""\nC"');
  });
  it('reorders rows by emitting a new collection without mutating source data', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const table = fixture.componentInstance.table();
    const results: (readonly Row[])[] = [];
    table.rowsReordered.subscribe(rows => results.push(rows));
    table.moveRow(1,2);
    table.moveRow(99,0);
    table.moveRow(1,NaN);
    expect(results.map(rows=>rows.map(row=>row.id))).toEqual([[2,3,1]]);
    expect(fixture.componentInstance.rows.map(row=>row.id)).toEqual([1,2,3]);
  });
  it('emits the edit lifecycle without writing consumer data', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const table = fixture.componentInstance.table(), row = fixture.componentInstance.rows[0]!;
    const started: unknown[] = [], committed: unknown[] = [], cancelled: unknown[] = [];
    table.editStart.subscribe(event=>started.push(event));
    table.editCommit.subscribe(event=>committed.push(event));
    table.editCancel.subscribe(event=>cancelled.push(event));
    table.startEdit(row,'name');
    table.commitEdit('Updated');
    expect(committed).toEqual([{row,column:'name',value:'Updated'}]);
    expect(table.editing()).toBeNull();
    table.startEdit(row);
    table.cancelEdit();
    table.commitEdit('ignored');
    expect(started).toEqual([{row,column:'name'},{row,column:undefined}]);
    expect(cancelled).toEqual([1]);
    expect(row.name).toBe('One');
    expect(committed).toHaveLength(1);
  });
  it('supports conditional range selection, single selection and context events', async () => {
    const fixture = TestBed.createComponent(HyTable<Row>);
    fixture.componentRef.setInput('data',[{id:1,team:'A',name:'One'},{id:2,team:'A',name:'Two'},{id:3,team:'B',name:'Three'}]);
    fixture.componentRef.setInput('columns',[{id:'name',header:'Name',cell:(row:Row)=>row.name}]);
    fixture.componentRef.setInput('rowKey',(row:Row)=>row.id);
    fixture.componentRef.setInput('caption','Selection');
    fixture.componentRef.setInput('rowSelectable',(row:Row)=>row.id !== 2);
    await fixture.whenStable();
    const table = fixture.componentInstance;
    table.toggleRow(1);
    table.toggleRow(3,new MouseEvent('click',{shiftKey:true}));
    expect(table.selected()).toEqual([1,3]);
    table.toggleRow(2);
    expect(table.selected()).toEqual([1,3]);
    fixture.componentRef.setInput('selectionMode','single');
    table.toggleRow(3);
    table.toggleRow(1);
    expect(table.selected()).toEqual([1]);
    const events: unknown[] = [];
    table.rowContext.subscribe(event=>events.push(event));
    const event = new MouseEvent('contextmenu',{bubbles:true});
    fixture.nativeElement.querySelector('tbody tr[aria-rowindex]').dispatchEvent(event);
    expect(table.contextRow()).toBe(1);
    expect(events).toEqual([{row:table.data()[0],event}]);
  });
  it('renders column order, resize limits, frozen offsets and local pagination', async () => {
    const fixture = TestBed.createComponent(HyTable<Row>);
    const rows = [{id:1,team:'A',name:'One'},{id:2,team:'B',name:'Two'}];
    const cols: readonly HyTableColumn<Row>[] = [
      {id:'name',header:'Name',cell:row=>row.name,frozen:'start',width:100,minWidth:80},
      {id:'team',header:'Team',cell:row=>row.team,frozen:'start',width:120},
    ];
    fixture.componentRef.setInput('data',rows);
    fixture.componentRef.setInput('columns',cols);
    fixture.componentRef.setInput('rowKey',(row:Row)=>row.id);
    fixture.componentRef.setInput('caption','Layout');
    fixture.componentRef.setInput('resizableColumns',true);
    fixture.componentRef.setInput('reorderableColumns',true);
    fixture.componentRef.setInput('pageSize',1);
    fixture.componentRef.setInput('page',2);
    fixture.componentRef.setInput('maxHeight','200px');
    fixture.componentRef.setInput('minWidth','500px');
    await fixture.whenStable();
    const table = fixture.componentInstance;
    expect(table.pageRows()).toEqual([rows[1]]);
    expect(fixture.nativeElement.querySelector('.viewport').style.maxBlockSize).toBe('200px');
    expect(fixture.nativeElement.querySelector('table').style.minInlineSize).toBe('500px');
    expect(table.frozenOffset(cols[1]!)).toBe(100);
    const slider = fixture.nativeElement.querySelector('.resizer') as HTMLInputElement;
    slider.value='90'; slider.dispatchEvent(new Event('input'));
    expect(table.width(cols[0]!)).toBe(90);
    table.resizeColumn('name',1);
    expect(table.width(cols[0]!)).toBe(80);
    table.moveColumn('team',0);
    await fixture.whenStable();
    expect([...fixture.nativeElement.querySelectorAll('thead th')].map((node:Element)=>node.textContent?.trim())).toEqual(['Team','Name']);
    expect(table.frozenOffset(cols[0]!)).toBe(120);
    expect(fixture.nativeElement.querySelector('th').getAttribute('draggable')).toBe('true');
    expect(fixture.nativeElement.querySelector('tbody tr[aria-rowindex]').getAttribute('aria-rowindex')).toBe('3');
  });
  it('retains frozen rows and a bounded moving window during virtual scrolling', async () => {
    const fixture = TestBed.createComponent(HyTable<Row>);
    const rows = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1, team: 'A', name: 'Project ' + (index + 1),
    }));
    fixture.componentRef.setInput('data', rows);
    fixture.componentRef.setInput('columns', [{ id: 'name', header: 'Name', cell: (row: Row) => row.name }]);
    fixture.componentRef.setInput('rowKey', (row: Row) => row.id);
    fixture.componentRef.setInput('caption', 'Pinned');
    fixture.componentRef.setInput('virtual', true);
    fixture.componentRef.setInput('frozenRows', 2);
    fixture.componentRef.setInput('initialCount', 3);
    fixture.componentRef.setInput('overscan', 0);
    await fixture.whenStable();

    const viewport = fixture.nativeElement.querySelector('.viewport') as HTMLElement;
    viewport.scrollTop = 960;
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();

    const table = fixture.componentInstance;
    expect(table.view().map((item) => item.key)).toEqual([1, 2, 21, 22, 23]);
    expect(table.rowWindow().before).toBe(18 * 48);
    const spacer = viewport.querySelector('tbody .spacer')?.parentElement;
    expect(spacer?.previousElementSibling?.classList.contains('frozen-row')).toBe(true);
  });

  it('renders expansion transactions and header/footer template contexts', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('tbody button') as HTMLButtonElement;
    expect(fixture.nativeElement.querySelector('.details')).toBeNull();
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('.details').textContent).toBe('Details One');
    expect(fixture.nativeElement.querySelector('th[scope=colgroup]').getAttribute('colspan')).toBe('2');
    expect(fixture.nativeElement.querySelector('.summary').textContent).toBe('Total 3');
    button.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.details')).toBeNull();
  });
  it('supplies only the current group members to a group template', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect([...fixture.nativeElement.querySelectorAll('.group-summary')].map((node: Element) => node.textContent)).toEqual(['A:2','B:1']);
  });
});
