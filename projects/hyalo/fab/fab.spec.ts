import { TestBed } from '@angular/core/testing';
import { HyFab } from './fab';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyFab', () => {
  it('opens with arrows, skips disabled actions, and returns focus after Escape', async () => {
    const f = TestBed.createComponent(HyFab);
    f.componentRef.setInput('label', 'Create');
    f.componentRef.setInput('actions', [
      { id: 'a', label: 'First' },
      { id: 'b', label: 'Unavailable', disabled: true },
      { id: 'c', label: 'Last' },
    ]);
    await f.whenStable();
    const trigger = f.nativeElement.querySelector('button') as HTMLButtonElement;
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await f.whenStable();
    const actions = f.nativeElement.querySelectorAll(
      '.actions button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(document.activeElement).toBe(actions[0]);
    actions[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(actions[2]);
    await expectNoAxeViolations(f.nativeElement);
    actions[2]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.open()).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
  it('emits one activation for a single FAB and closes on outside interaction', async () => {
    const f = TestBed.createComponent(HyFab);
    f.componentRef.setInput('label', 'Add');
    const activate = vi.fn();
    f.componentInstance.activated.subscribe(activate);
    await f.whenStable();
    f.nativeElement.querySelector('button').click();
    expect(activate).toHaveBeenCalledTimes(1);
    f.componentRef.setInput('actions', [{ id: 'a', label: 'Add note' }]);
    f.componentInstance.open.set(true);
    await f.whenStable();
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.open()).toBe(false);
  });
});
