import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expectNoAxeViolations } from '../../testing/axe';
import { HyMotion } from '../motion/motion';
import { HY_DIALOG_DATA, HyDialogRef } from './dialog-ref';
import { HY_DIALOG_PARTS } from './dialog-parts';
import { HyDialog } from './dialog';
import { HyDrawer } from './drawer';

@Component({
  imports: [HY_DIALOG_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 hyDialogTitle>Edit address</h2>
    <div hyDialogContent><input aria-label="Street" [value]="data.street" /></div>
    <div hyDialogActions>
      <button hyDialogClose>Cancel</button>
      <button (click)="ref.close('saved')">Save</button>
    </div>
  `,
})
class EditAddress {
  readonly ref = inject(HyDialogRef);
  readonly data = inject(HY_DIALOG_DATA) as { street: string };
}

const flush = () => new Promise((r) => setTimeout(r));

describe('HyDialog', () => {
  beforeEach(() => TestBed.inject(HyMotion).setReduced(true));
  afterEach(() => {
    TestBed.inject(HyMotion).setReduced(null);
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('opens a labelled modal dialog with data and focuses inside', async () => {
    TestBed.inject(HyDialog).open(EditAddress, { data: { street: 'Valiasr 12' } });
    TestBed.tick();
    await flush();
    const container = document.querySelector<HTMLElement>('.cdk-dialog-container')!;
    expect(container.getAttribute('role')).toBe('dialog');
    expect(container.getAttribute('aria-modal')).toBe('true');
    expect(container.getAttribute('aria-labelledby')).toBe(container.querySelector('h2')!.id);
    expect(container.querySelector('input')!.value).toBe('Valiasr 12');
    expect(container.classList).toContain('hy-glass');
    await expectNoAxeViolations(container);
  });

  it('sets the size as an inline max width', () => {
    TestBed.inject(HyDialog).open(EditAddress, { data: { street: '' }, size: 'sm' });
    TestBed.tick();
    expect(document.querySelector<HTMLElement>('.hy-dialog-pane')!.style.maxWidth).toBe('26rem');
  });

  it('resolves closed with the result', async () => {
    const ref = TestBed.inject(HyDialog).open<string>(EditAddress, { data: { street: '' } });
    TestBed.tick();
    document.querySelectorAll<HTMLButtonElement>('.cdk-dialog-container button')[1]!.click();
    expect(await ref.closed).toBe('saved');
  });

  it('closes on Escape when dismissible', async () => {
    const ref = TestBed.inject(HyDialog).open(EditAddress, { data: { street: '' } });
    TestBed.tick();
    document
      .querySelector('.cdk-dialog-container')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(await ref.closed).toBeUndefined();
    expect(document.querySelector('.cdk-dialog-container')).toBeNull();
  });

  it('stays open on Escape when not dismissible', async () => {
    TestBed.inject(HyDialog).open(EditAddress, { data: { street: '' }, dismissible: false });
    TestBed.tick();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await flush();
    expect(document.querySelector('.cdk-dialog-container')).not.toBeNull();
  });

  it('confirm resolves true only when confirmed', async () => {
    const answer = TestBed.inject(HyDialog).confirm({ title: 'Delete draft?', tone: 'danger' });
    TestBed.tick();
    await flush();
    const container = document.querySelector('.cdk-dialog-container')!;
    expect(container.getAttribute('role')).toBe('alertdialog');
    container.querySelectorAll<HTMLButtonElement>('button')[1]!.click();
    expect(await answer).toBe(true);
  });

  it('plays the exit animation before closing', async () => {
    TestBed.inject(HyMotion).setReduced(false);
    const ref = TestBed.inject(HyDialog).open(EditAddress, { data: { street: '' } });
    TestBed.tick();
    ref.close();
    const pane = document.querySelector<HTMLElement>('.hy-dialog-pane')!;
    expect(pane.dataset['state']).toBe('closing');
    pane.dispatchEvent(new Event('animationend'));
    await ref.closed;
    expect(document.querySelector('.hy-dialog-pane')).toBeNull();
  });
});

describe('HyDrawer', () => {
  beforeEach(() => TestBed.inject(HyMotion).setReduced(true));
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove()));

  it('opens from the requested side', async () => {
    const ref = TestBed.inject(HyDrawer).open(EditAddress, { side: 'start', data: { street: '' } });
    TestBed.tick();
    expect(document.querySelector('.hy-drawer-pane')!.classList).toContain('hy-drawer--start');
    ref.close();
    await ref.closed;
  });
});
