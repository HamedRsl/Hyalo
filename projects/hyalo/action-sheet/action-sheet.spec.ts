import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { HyMotion } from '@hyalo/angular/motion';
import { HyActionSheet } from './action-sheet';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyActionSheet', () => {
  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
    TestBed.inject(HyMotion).setReduced(null);
  });
  it('puts cancel last, blocks disabled actions, and emits only a real selection', async () => {
    TestBed.inject(HyMotion).setReduced(true);
    const f = TestBed.createComponent(HyActionSheet);
    f.componentRef.setInput('heading', 'Message actions');
    f.componentRef.setInput('actions', [
      { id: 'cancel', label: 'Cancel', role: 'cancel' },
      { id: 'blocked', label: 'Blocked', disabled: true },
      { id: 'delete', label: 'Delete', role: 'destructive' },
    ]);
    f.componentInstance.open.set(true);
    const selected = vi.fn();
    f.componentInstance.selected.subscribe(selected);
    await f.whenStable();
    const panel = document.querySelector<HTMLElement>('.cdk-dialog-container')!;
    const actions = panel.querySelectorAll<HTMLButtonElement>('.actions button');
    expect(actions[2]?.textContent).toContain('Cancel');
    actions[0]?.click();
    expect(selected).not.toHaveBeenCalled();
    await expectNoAxeViolations(panel);
    actions[1]?.click();
    expect(selected.mock.calls[0]?.[0].id).toBe('delete');
    await f.whenStable();
  });
});
