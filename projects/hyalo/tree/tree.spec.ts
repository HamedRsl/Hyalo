
import {TestBed} from '@angular/core/testing';
import {HyTree} from './tree';
describe('HyTree',()=>{
 it('selects checkable rather than selectable nodes in checkbox select-all',async()=>{const f=TestBed.createComponent(HyTree);f.componentRef.setInput('nodes',[{key:'a',label:'A',selectable:false},{key:'b',label:'B',checkable:false}]);f.componentRef.setInput('selectionMode','checkbox');await f.whenStable();f.componentInstance.selectAll();expect(f.componentInstance.checkedKeys()).toEqual(['a']);});
 it('ignores lazy children after collapse or destruction',async()=>{const f=TestBed.createComponent(HyTree);let complete:(nodes:readonly {key:string;label:string}[])=>void=()=>undefined;let aborted=false;f.componentRef.setInput('nodes',[{key:'root',label:'Root',leaf:false}]);f.componentRef.setInput('loadChildren',(_node:unknown,signal:AbortSignal)=>{signal.addEventListener('abort',()=>aborted=true);return new Promise(resolve=>complete=resolve);});await f.whenStable();f.componentInstance.toggle('root',true);f.componentInstance.toggle('root',false);complete([{key:'late',label:'Late'}]);await Promise.resolve();expect(aborted).toBe(true);expect(f.componentInstance.resolved()[0]?.children).toBeUndefined();f.destroy();});
});
