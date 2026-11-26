
import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {HyContextMenu,HyContextMenuTrigger} from './context-menu';
@Component({
  imports: [HyContextMenu, HyContextMenuTrigger],
  template: `
    <ng-template #menu><hy-context-menu [items]="items" (activated)="last=$event.action.id" /></ng-template>
    <button [hyContextMenuTriggerFor]="menu" [longPressDelay]="10"
      [restoreFocus]="customFocus() ? fallback : true" #trigger="hyContextMenuTrigger"
      (click)="trigger.open()">Actions</button>
    <button #fallback type="button">Action fallback</button>
  `,
})
class Host {
  readonly items = [
    { id: 'open', label: 'Open' },
    { id: 'locked', label: 'Locked', disabled: true },
    { id: 'assign', label: 'Assign', children: [{ id: 'team', label: 'Design team' }] },
  ];
  readonly customFocus = signal(false);
  last = '';
}
describe('HyContextMenu',()=>{
 afterEach(()=>document.querySelectorAll('.cdk-overlay-container').forEach(element=>element.remove()));
 it('opens by keyboard, blocks disabled actions, and dismisses on Escape',async()=>{
  const f=TestBed.createComponent(Host);document.body.appendChild(f.nativeElement);await f.whenStable();const button=f.nativeElement.querySelector('button') as HTMLButtonElement;button.focus();button.dispatchEvent(new KeyboardEvent('keydown',{key:'F10',shiftKey:true,bubbles:true}));await f.whenStable();
  const items=document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');expect(items).toHaveLength(3);items[1]!.click();expect(f.componentInstance.last).toBe('');items[0]!.click();await f.whenStable();expect(f.componentInstance.last).toBe('open');expect(document.querySelector('[role="menu"]')).toBeNull();
  button.click();await f.whenStable();document.querySelector('[role="menuitem"]')!.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27,bubbles:true}));await f.whenStable();expect(document.querySelector('[role="menu"]')).toBeNull();
 });
  it('opens after a touch hold, cancels motion and restores the chosen focus target', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    fixture.componentInstance.customFocus.set(true);
    await fixture.whenStable();
    const [trigger, fallback] = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const pointer = (type: string, x: number): void => {
      trigger!.dispatchEvent(new PointerEvent(type, { bubbles: true, isPrimary: true, pointerType: 'touch', clientX: x }));
    };
    pointer('pointerdown', 10);
    pointer('pointermove', 24);
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    pointer('pointerdown', 10);
    await vi.waitFor(() => expect(document.querySelector('[role="menu"]')).not.toBeNull());
    pointer('pointerup', 10);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 });
    expect(trigger!.dispatchEvent(click)).toBe(false);
    document.querySelector('[role="menuitem"]')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }),
    );
    await fixture.whenStable();
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(fallback);
  });

  it('renders recursive actions and emits a leaf after traversing its submenu', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    const assign = [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
      .find((item) => item.textContent?.includes('Assign'))!;
    assign.click();
    await fixture.whenStable();
    const team = [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
      .find((item) => item.textContent?.includes('Design team'))!;
    team.click();
    expect(fixture.componentInstance.last).toBe('team');
  });
});
