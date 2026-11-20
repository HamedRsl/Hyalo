
import {TestBed} from '@angular/core/testing';
import {HySplitter} from './splitter';
describe('HySplitter',()=>{
 it('rejects collapse that cannot fit and restores bounded sizes',async()=>{const f=TestBed.createComponent(HySplitter);f.componentRef.setInput('panes',[{id:'a',label:'A',size:30,min:20,max:40,collapsible:true},{id:'b',label:'B',size:70,min:60,max:80}]);await f.whenStable();f.componentInstance.togglePane('a');expect(f.componentInstance.collapsed()).toEqual([]);f.componentInstance.setSizes([1,99]);expect(f.componentInstance.effectiveSizes()).toEqual([20,80]);});
 it('allocates zero space for externally collapsed panes',async()=>{const f=TestBed.createComponent(HySplitter);f.componentRef.setInput('panes',[{id:'a',label:'A',collapsible:true},{id:'b',label:'B'}]);f.componentRef.setInput('collapsed',['a']);await f.whenStable();expect(f.componentInstance.effectiveSizes()).toEqual([0,100]);f.componentInstance.togglePane('a');expect(f.componentInstance.effectiveSizes()[0]).toBeGreaterThan(0);});
});
