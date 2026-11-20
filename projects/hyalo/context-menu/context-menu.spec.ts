
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {HyContextMenu,HyContextMenuTrigger} from './context-menu';
@Component({imports:[HyContextMenu,HyContextMenuTrigger],template:'<ng-template #menu><hy-context-menu [items]="items" (activated)="last=$event.action.id" /></ng-template><button [hyContextMenuTriggerFor]="menu" #trigger="hyContextMenuTrigger" (click)="trigger.open()">Actions</button>'})
class Host{readonly items=[{id:'open',label:'Open'},{id:'locked',label:'Locked',disabled:true}];last='';}
describe('HyContextMenu',()=>{
 afterEach(()=>document.querySelectorAll('.cdk-overlay-container').forEach(element=>element.remove()));
 it('opens by keyboard, blocks disabled actions, and dismisses on Escape',async()=>{
  const f=TestBed.createComponent(Host);document.body.appendChild(f.nativeElement);await f.whenStable();const button=f.nativeElement.querySelector('button') as HTMLButtonElement;button.focus();button.dispatchEvent(new KeyboardEvent('keydown',{key:'F10',shiftKey:true,bubbles:true}));await f.whenStable();
  const items=document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');expect(items).toHaveLength(2);items[1]!.click();expect(f.componentInstance.last).toBe('');items[0]!.click();await f.whenStable();expect(f.componentInstance.last).toBe('open');expect(document.querySelector('[role="menu"]')).toBeNull();
  button.click();await f.whenStable();document.querySelector('[role="menuitem"]')!.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27,bubbles:true}));await f.whenStable();expect(document.querySelector('[role="menu"]')).toBeNull();
 });
});
