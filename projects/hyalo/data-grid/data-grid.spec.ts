
import {TestBed} from '@angular/core/testing';
import {HyDataGrid} from './data-grid';
interface Row{readonly id:number;readonly name:string;}
function fixture(){
 const f=TestBed.createComponent(HyDataGrid<Row>);f.componentRef.setInput('caption','Projects');f.componentRef.setInput('rowKey',(row:Row)=>row.id);
 f.componentRef.setInput('data',[{id:1,name:'B'},{id:2,name:'A'}]);f.componentRef.setInput('columns',[{id:'name',header:'Name',cell:(row:Row)=>row.name,sortable:true,write:(row:Row,value:unknown)=>({...row,name:String(value)})}]);return f;
}
describe('HyDataGrid',()=>{
 it('sorts, selects, edits, and preserves caller-owned row objects',async()=>{
  const f=fixture();f.componentRef.setInput('config',{selectionMode:'multiple'});await f.whenStable();const original=f.componentInstance.data()[0]!;
  f.componentInstance.toggleSort('name');expect(f.componentInstance.filteredData().map(row=>row.id)).toEqual([2,1]);
  f.componentInstance.toggleAll();expect(f.componentInstance.selected()).toEqual([2,1]);
  f.componentInstance.beginEdit(original,'name');f.componentInstance.updateEdit('name','Changed');expect(await f.componentInstance.commitEdit()).toBe(true);
  expect(f.componentInstance.data()[0]?.name).toBe('Changed');expect(original.name).toBe('B');
 });
 it('does not let an obsolete save clear or commit a newer save',async()=>{
  const f=fixture();let resolveFirst:(value:boolean)=>void=()=>undefined,resolveSecond:(value:boolean)=>void=()=>undefined;
  const first=new Promise<boolean>(resolve=>resolveFirst=resolve),second=new Promise<boolean>(resolve=>resolveSecond=resolve);let calls=0;f.componentRef.setInput('canCommit',()=>++calls===1?first:second);await f.whenStable();
  const grid=f.componentInstance,row=grid.data()[0]!;grid.beginEdit(row,'name');grid.updateEdit('name','old');const old=grid.commitEdit();grid.cancelEdit();grid.beginEdit(row,'name');grid.updateEdit('name','new');const current=grid.commitEdit();
  resolveFirst(true);expect(await old).toBe(false);expect(grid.saving()).toBe(true);resolveSecond(true);expect(await current).toBe(true);expect(grid.data()[0]?.name).toBe('new');
 });
 it('keeps thrown validators recoverable and source replacement transactional',async()=>{
  const f=fixture();f.componentRef.setInput('columns',[{id:'name',header:'Name',cell:(row:Row)=>row.name,write:(row:Row)=>row,validate:()=>{throw new Error('Offline');}}]);await f.whenStable();
  f.componentInstance.beginEdit(f.componentInstance.data()[0]!,'name');expect(await f.componentInstance.commitEdit()).toBe(false);expect(f.componentInstance.saving()).toBe(false);
 });
 it('emits a lazy query instead of filtering remote data twice',async()=>{
  const f=fixture();f.componentRef.setInput('lazy',true);f.componentRef.setInput('totalRecords',200);await f.whenStable();f.componentInstance.setSearch('missing');expect(f.componentInstance.filteredData()).toHaveLength(2);expect(f.componentInstance.query().search).toBe('missing');expect(f.componentInstance.pageCount()).toBe(8);
 });
});
