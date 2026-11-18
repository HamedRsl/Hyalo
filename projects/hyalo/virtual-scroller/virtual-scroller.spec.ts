
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {HyVirtualScroller} from './virtual-scroller';
@Component({imports:[HyVirtualScroller],template:'<ng-template #item let-item><span>{{item.label}}</span></ng-template><hy-virtual-scroller [items]="items" [itemTemplate]="item" [itemLabel]="label" [trackBy]="key" label="Activity" />'})
class Host{readonly items=Array.from({length:10000},(_,id)=>({id,label:'Activity '+id}));readonly label=(item:{label:string}):string=>item.label;readonly key=(item:{id:number}):number=>item.id;}
describe('HyVirtualScroller',()=>{
 it('does not create one DOM element per source item',async()=>{const f=TestBed.createComponent(Host);await f.whenStable();expect(f.nativeElement.querySelectorAll('[role="listitem"]').length).toBeLessThan(100);expect(f.nativeElement.querySelector('[role="list"]').getAttribute('aria-label')).toBe('Activity');});
});
