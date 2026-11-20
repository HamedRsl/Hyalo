import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expectNoAxeViolations } from '../src/testing/axe';
import { HyMotion } from '@hyalo/angular';

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
  it('vetoes every event route without losing the surface or focus', async () => {
    const attempts: string[] = [];
    const ref = TestBed.inject(HyDialog).open(EditAddress, {
      data: { street: '' }, closeOnNavigation: true, closeOnScroll: true,
      closeGuard: attempt => { attempts.push(attempt.reason); return false; },
    });
    TestBed.tick();
    await flush();
    const panel = ref.containerElement!;
    const input = panel.querySelector('input')!;
    input.focus();
    ref.close();
    panel.querySelector('button')!.click();
    panel.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click();
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.dispatchEvent(new Event('scroll'));
    await flush();
    expect(attempts).toEqual(['programmatic', 'action', 'escape', 'backdrop', 'navigation', 'scroll']);
    expect(ref.containerElement).toBe(panel);
    expect(document.activeElement).toBe(input);
    expect(panel.isConnected).toBe(true);
  });

  it('serializes pending guards and ignores approval after external disposal', async () => {
    let resolve!: (allowed: boolean) => void;
    const guard = vi.fn(() => new Promise<boolean>(done => resolve = done));
    const ref = TestBed.inject(HyDialog).open(EditAddress, {data: {street: ''}, closeGuard: guard});
    TestBed.tick();
    const pending = ref.requestClose(undefined, 'gesture');
    expect(await ref.requestClose()).toBe(false);
    expect(guard).toHaveBeenCalledOnce();
    TestBed.inject(Dialog).closeAll();
    resolve(true);
    expect(await pending).toBe(false);
    expect(await ref.closed).toBeUndefined();
  });

  it('keeps the surface open when guards reject and permits a later approved attempt', async () => {
    let allow = false;
    const ref = TestBed.inject(HyDialog).open(EditAddress, {
      data: {street: ''}, closeGuard: async () => { if (!allow) throw new Error('offline'); return true; },
    });
    TestBed.tick();
    const errors: unknown[] = [];
    ref.guardError.subscribe(error => errors.push(error));
    expect(await ref.requestClose()).toBe(false);
    expect(errors).toEqual([new Error('offline')]);
    expect(ref.containerElement?.isConnected).toBe(true);
    allow = true;
    expect(await ref.requestClose('saved')).toBe(true);
    expect(await ref.closed).toBe('saved');
  });
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

  it('closes with undefined from a bare hyDialogClose', async () => {
    const ref = TestBed.inject(HyDialog).open(EditAddress, { data: { street: '' } });
    TestBed.tick();
    document.querySelectorAll<HTMLButtonElement>('.cdk-dialog-container button')[0]!.click();
    expect(await ref.closed).toBeUndefined();
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
    pane
      .querySelector('.cdk-dialog-container')!
      .dispatchEvent(new Event('animationend', { bubbles: true }));
    await ref.closed;
    expect(document.querySelector('.hy-dialog-pane')).toBeNull();
  });

  it('ignores animations that end inside the content while closing', async () => {
    TestBed.inject(HyMotion).setReduced(false);
    const ref = TestBed.inject(HyDialog).open(EditAddress, { data: { street: '' } });
    TestBed.tick();
    ref.close();
    document
      .querySelector('.cdk-dialog-container button')!
      .dispatchEvent(new Event('animationend', { bubbles: true }));
    await flush();
    expect(document.querySelector('.hy-dialog-pane')).not.toBeNull();
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

  it.each(['normal', 'external'])('disposes bottom-sheet resources on %s closure', async (mode) => {
    TestBed.inject(HyMotion).setReduced(false);
    const frames = new Map<number, FrameRequestCallback>();
    let id = 0;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (handle: number) => frames.delete(handle));
    const observers: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] =
      [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        readonly observe = vi.fn();
        readonly disconnect = vi.fn();
        constructor() {
          observers.push(this);
        }
      },
    );
    try {
      for (let cycle = 0; cycle < 5; cycle++) {
        const ref = TestBed.inject(HyDrawer).open(EditAddress, {
          side: 'bottom',
          data: { street: '' },
        });
        TestBed.tick();
        const panel = ref.containerElement!;
        const observer = observers.find((item) =>
          item.observe.mock.calls.some(([target]) => target === panel),
        )!;
        expect(observer).toBeDefined();
        if (mode === 'external') TestBed.inject(Dialog).closeAll();
        else ref.close();
        for (let frame = 0; frames.size && frame < 600; frame++) {
          const callbacks = [...frames.values()];
          frames.clear();
          callbacks.forEach((callback) => callback((frame * 1000) / 60));
        }
        await ref.closed;
        expect(observer.disconnect).toHaveBeenCalledOnce();
        expect(frames.size).toBe(0);
        expect(panel.isConnected).toBe(false);
      }
    } finally {
      vi.unstubAllGlobals();
      TestBed.inject(HyMotion).setReduced(null);
    }
  });
});
