import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { HyDialogRef } from '@hyalo/angular/dialog';
import { HyMotion } from '@hyalo/angular/motion';
import { HyBottomSheet, HyBottomSheetHost } from './bottom-sheet';

@Component({ template: '<button type="button" (click)="ref.close()">Save</button>' })
class Content {
  readonly ref = inject(HyDialogRef);
}

describe('bottom sheet dismissal contracts', () => {
  beforeEach(() => TestBed.inject(HyMotion).setReduced(true));
  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
    TestBed.inject(HyMotion).setReduced(null);
  });
  it('applies the same veto to backdrop, Escape, close button, and an injected content ref', async () => {
    const guard = vi.fn<(result: unknown, reason: string) => boolean>(() => false);
    const ref = TestBed.inject(HyBottomSheet).open(Content, { label: 'Edit', canDismiss: guard });
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    await ref.opened;
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    document
      .querySelector<HTMLElement>('.cdk-dialog-container')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    document.querySelector<HTMLButtonElement>('.close')!.click();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    document.querySelector<HTMLButtonElement>('hy-bottom-sheet-panel .body button')!.click();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(guard.mock.calls.map((call) => call[1])).toEqual([
      'backdrop',
      'escape',
      'close',
      'programmatic',
    ]);
    expect(document.querySelector('.cdk-dialog-container')).not.toBeNull();
    ref.dispose();
    await ref.closed;
  });
  it('serializes async guards and retains the first dismissal result and reason', async () => {
    let approve!: (value: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          approve = resolve;
        }),
    );
    const ref = TestBed.inject(HyBottomSheet).open<string>(Content, {
      label: 'Edit',
      canDismiss: guard,
    });
    TestBed.tick();
    const first = ref.dismiss('done', 'close');
    expect(ref.dismiss('duplicate', 'escape')).toBe(first);
    await Promise.resolve();
    expect(guard).toHaveBeenCalledTimes(1);
    approve(true);
    expect(await first).toBe(true);
    expect(await ref.dismissed).toEqual({ result: 'done', reason: 'close' });
  });
  it('allows retry after a rejected guard and disposes a vetoed host on destruction', async () => {
    const guard = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(false);
    const ref = TestBed.inject(HyBottomSheet).open(Content, { canDismiss: guard });
    await expect(ref.dismiss()).rejects.toThrow('offline');
    expect(await ref.dismiss()).toBe(false);
    ref.dispose();
    await ref.closed;
    const fixture = TestBed.createComponent(HyBottomSheetHost);
    fixture.componentRef.setInput('label', 'Edit');
    fixture.componentRef.setInput('options', { canDismiss: false });
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    fixture.componentInstance.open.set(false);
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(true);
    fixture.destroy();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(document.querySelector('.cdk-dialog-container')).toBeNull();
  });
});
