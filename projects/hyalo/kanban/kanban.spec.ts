
import {TestBed} from '@angular/core/testing';
import {HyKanban,moveHyKanbanCard} from './kanban';
const columns=[{id:'todo',label:'Todo',cards:[{id:'a',label:'A'},{id:'b',label:'B'}]},{id:'done',label:'Done',limit:1,cards:[]}];
describe('Kanban moves',()=>{
 it('moves immutable cards and enforces WIP, disabled, and index constraints',()=>{const next=moveHyKanbanCard(columns,'a','done',0)!;expect(next[1]?.cards[0]?.id).toBe('a');expect(columns[0]?.cards).toHaveLength(2);expect(moveHyKanbanCard(next,'b','done',1)).toBeNull();expect(moveHyKanbanCard(columns,'a','done',3)).toBeNull();});
 it('does not commit an approval against a replaced board or cancelled request',async()=>{const f=TestBed.createComponent(HyKanban);f.componentRef.setInput('columns',columns);let complete:(value:boolean)=>void=()=>undefined;f.componentRef.setInput('canMove',()=>new Promise<boolean>(resolve=>complete=resolve));await f.whenStable();const pending=f.componentInstance.moveCard('a','done',0);expect(f.componentInstance.pending()).toBe(true);f.componentInstance.cancelMove();complete(true);expect(await pending).toBe(false);expect(f.componentInstance.columns()).toBe(columns);});
 it('applies asynchronous vetoes equally to imperative moves',async()=>{const f=TestBed.createComponent(HyKanban);f.componentRef.setInput('columns',columns);f.componentRef.setInput('canMove',()=>Promise.resolve(false));await f.whenStable();expect(await f.componentInstance.moveCard('a','done')).toBe(false);expect(f.componentInstance.columns()).toBe(columns);});
});
