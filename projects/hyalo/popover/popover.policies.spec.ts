import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HyPopover } from './popover';

@Component({
  imports: [HyPopover],
  template: `<button
      [hyPopover]="panel"
      [popoverContext]="{ $implicit: name() }"
      popoverTrigger="manual"
      [popoverAutoClose]="false"
      [popoverShowDelay]="40"
      [popoverHideDelay]="60"
    >
      Open</button
    ><ng-template #panel let-name
      ><b>{{ name }}</b></ng-template
    >`,
})
class Host {
  readonly name = signal('Consumer context');
}
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function attached() {
  for (let i = 0; i < 80; i++) {
    const pane = document.querySelector<HTMLElement>('.hy-popover');
    if (pane) return pane;
    await wait(10);
  }
  throw new Error('Popover did not attach');
}
describe('popover configurable contracts', () => {
  afterEach(() =>
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()),
  );
  it('supports manual trigger, contextual rich content and independent auto-close policy', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const popover = fixture.debugElement.query(By.directive(HyPopover)).injector.get(HyPopover);
    button.click();
    await fixture.whenStable();
    expect(popover.open()).toBe(false);
    popover.show();
    await wait(10);
    expect(popover.open()).toBe(false);
    await wait(50);
    await fixture.whenStable();
    const pane = await attached();
    expect(pane.textContent).toBe('Consumer context');
    await wait(10);
    pane.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(popover.open()).toBe(true);
    popover.hide();
    await wait(20);
    expect(popover.open()).toBe(true);
    popover.show();
    await wait(80);
    expect(popover.open()).toBe(true);
    popover.hide();
    await wait(80);
    await fixture.whenStable();
    expect(popover.open()).toBe(false);
    popover.show();
    fixture.destroy();
    await wait(80);
    expect(document.querySelector('.hy-popover')).toBeNull();
  });
});
