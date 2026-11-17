import { TestBed } from '@angular/core/testing';
import { HySlideConfirm } from './slide-confirm';
import { pointer } from '../src/testing/pointer';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HySlideConfirm', () => {
  it('confirms once through its native button and supports controlled reset', async () => {
    const f = TestBed.createComponent(HySlideConfirm);
    f.componentRef.setInput('label', 'Confirm transfer');
    const confirmed = vi.fn();
    f.componentInstance.confirmed.subscribe(confirmed);
    await f.whenStable();
    const button = f.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    button.click();
    await f.whenStable();
    expect(confirmed).toHaveBeenCalledTimes(1);
    expect(f.componentInstance.value()).toBe(true);
    f.componentRef.setInput('value', false);
    await f.whenStable();
    button.click();
    expect(confirmed).toHaveBeenCalledTimes(2);
    await expectNoAxeViolations(f.nativeElement);
  });
  it('requires real distance and never confirms a cancelled or blocked gesture', async () => {
    const f = TestBed.createComponent(HySlideConfirm);
    await f.whenStable();
    const track = f.nativeElement.querySelector('.track'),
      button = f.nativeElement.querySelector('button');
    Object.defineProperty(track, 'clientWidth', { value: 300 });
    Object.defineProperty(button, 'offsetWidth', { value: 50 });
    pointer(button, 'pointerdown', 0, 0);
    pointer(track, 'pointermove', 15, 0);
    pointer(track, 'pointerup', 15, 0);
    expect(f.componentInstance.value()).toBe(false);
    pointer(button, 'pointerdown', 0, 0);
    pointer(track, 'pointermove', 240, 0);
    pointer(track, 'pointercancel', 240, 0);
    expect(f.componentInstance.value()).toBe(false);
    for (const option of ['readonly', 'loading', 'disabled']) {
      f.componentRef.setInput(option, true);
      await f.whenStable();
      button.click();
      expect(f.componentInstance.value()).toBe(false);
      f.componentRef.setInput(option, false);
    }
  });
});
