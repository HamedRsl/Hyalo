import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyAlert } from './alert';

@Component({
  imports: [HyAlert],
  template: `<hy-alert dismissible
    ><span hyAlertIcon>!</span>Message<span hyAlertCloseIcon>Close now</span></hy-alert
  >`,
})
class Host {}

describe('alert audit contracts', () => {
  it('renders banner as a square edge-to-edge strip and restores the card preset', async () => {
    const f = TestBed.createComponent(HyAlert);
    f.componentRef.setInput('banner', true);
    await f.whenStable();
    const section = f.nativeElement.querySelector('section');
    expect(getComputedStyle(section).borderRadius).toBe('0px');
    expect(getComputedStyle(section).borderInlineStartWidth).toBe('0px');
    f.componentRef.setInput('banner', false);
    await f.whenStable();
    expect(getComputedStyle(section).borderRadius).toBe('var(--hy-radius-m)');
  });
  it('projects custom message and close icons into their distinct slots', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    expect(f.nativeElement.querySelector('section > [hyAlertIcon]')?.textContent).toBe('!');
    expect(f.nativeElement.querySelector('button')?.textContent.trim()).toBe('Close now');
    expect(f.nativeElement.querySelector('section > div')?.textContent).toContain('Message');
  });

  it('restarts timed dismissal on duration changes and cancels it on destruction', async () => {
    const f = TestBed.createComponent(HyAlert);
    f.componentRef.setInput('duration', 100);
    const dismissed = vi.fn();
    f.componentInstance.dismissed.subscribe(dismissed);
    await f.whenStable();
    f.componentRef.setInput('duration', 200);
    await f.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(f.componentInstance.visible()).toBe(true);
    await vi.waitFor(() => expect(f.componentInstance.visible()).toBe(false));
    expect(dismissed).toHaveBeenCalledTimes(1);
    f.componentInstance.visible.set(true);
    await f.whenStable();
    f.destroy();
    await new Promise((resolve) => setTimeout(resolve, 220));
    expect(dismissed).toHaveBeenCalledTimes(1);
  });
});
