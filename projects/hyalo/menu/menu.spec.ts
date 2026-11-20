import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_MENU, HyMenuTrigger } from './menu';
import { By } from '@angular/platform-browser';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HY_MENU],
  template:
    '<button type="button" [hyMenuTriggerFor]="items">Actions</button><ng-template #items><hy-menu aria-label="Project actions"><button hyMenuItem (triggered)="chosen.set(true)">Open</button><button hyMenuItem disabled>Unavailable</button></hy-menu></ng-template>',
})
class Host {
  readonly chosen = signal(false);
}
describe('HyMenu', () => {
  it('opens, closes, and toggles imperatively without stealing focus on close', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const controller = fixture.debugElement
      .query(By.directive(HyMenuTrigger))
      .injector.get(HyMenuTrigger);
    controller.open();
    await fixture.whenStable();
    expect(controller.isOpen()).toBe(true);
    expect(document.querySelector('hy-menu')).not.toBeNull();
    controller.close();
    await fixture.whenStable();
    expect(controller.isOpen()).toBe(false);
    controller.toggle();
    await fixture.whenStable();
    expect(controller.isOpen()).toBe(true);
    fixture.destroy();
    expect(document.querySelector('hy-menu')).toBeNull();
    controller.open();
    expect(document.querySelector('hy-menu')).toBeNull();
  });
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove()));
  it('supports keyboard activation and restores trigger focus on Escape', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    trigger.click();
    await fixture.whenStable();
    const menu = document.querySelector('hy-menu')!;
    await expectNoAxeViolations(menu);
    const item = menu.querySelector('button')!;
    item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.chosen()).toBe(true);
    trigger.click();
    await fixture.whenStable();
    document
      .querySelector('hy-menu button')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    await fixture.whenStable();
    expect(document.querySelector('hy-menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
