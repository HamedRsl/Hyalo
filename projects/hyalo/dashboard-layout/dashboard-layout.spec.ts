
import {TestBed} from '@angular/core/testing';
import {HyDashboardLayout} from './dashboard-layout';
describe('HyDashboardLayout',()=>{
 it('accepts atomic swaps, retains metadata, and rejects overlapping single moves',async()=>{const f=TestBed.createComponent(HyDashboardLayout);f.componentRef.setInput('tiles',[{id:'a',label:'A',x:0,y:0,width:6,height:2,minWidth:3},{id:'b',label:'B',x:6,y:0,width:6,height:2}]);await f.whenStable();expect(f.componentInstance.moveTile('a',6,0)).toBe(false);f.componentInstance.setLayout([{id:'a',x:6,y:0,width:6,height:2},{id:'b',x:0,y:0,width:6,height:2}]);expect(f.componentInstance.tiles()[0]).toMatchObject({label:'A',x:6,minWidth:3});const saved=f.componentInstance.saveLayout();f.componentInstance.restoreLayout(saved);expect(f.componentInstance.saveLayout()).toBe(saved);expect(()=>f.componentInstance.setLayout([{id:'a',x:0,y:3,width:2,height:2},{id:'b',x:0,y:0,width:6,height:2}])).toThrow();});
});
