import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { HY_DIALOG_DATA } from '@hyalo/angular/dialog';
import { HyMotion } from '@hyalo/angular/motion';
import { HyBottomSheet, HyBottomSheetHost } from './bottom-sheet';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({ template: '<p>{{ data }}</p><button type="button">Content action</button>' })
class Body {
  readonly data = inject(HY_DIALOG_DATA);
}
@Component({
  imports: [HyBottomSheetHost],
  template:
    '<button type="button">Open</button><hy-bottom-sheet #sheet label="Details" [(open)]="open" (breakpointChange)="point.set($event)"><p>Projected content</p></hy-bottom-sheet>',
})
class Host {
  readonly open = signal(false);
  readonly point = signal(0);
}
describe('HyBottomSheet', () => {
  beforeEach(() => TestBed.inject(HyMotion).setReduced(true));
  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
    TestBed.inject(HyMotion).setReduced(null);
  });
  it('passes data, exposes snap state, rejects invalid stops, and resolves its result', async () => {
    const ref = TestBed.inject(HyBottomSheet).open<string>(Body, {
      label: 'Details',
      data: 'Delivery address',
      breakpoints: [0.3, 0.7],
      initialBreakpoint: 0.3,
    });
    TestBed.tick();
    await new Promise((r) => setTimeout(r));
    const panel = document.querySelector<HTMLElement>('.cdk-dialog-container')!;
    expect(panel.textContent).toContain('Delivery address');
    expect(ref.breakpoint()).toBe(0.3);
    ref.snapTo(1);
    expect(ref.breakpoint()).toBe(1);
    expect(() => ref.snapTo(0.9)).toThrow(RangeError);
    await expectNoAxeViolations(panel);
    ref.close('done');
    expect(await ref.closed).toBe('done');
  });
  it('keeps a non-dismissible sheet open at zero and supports keyboard resizing', async () => {
    const ref = TestBed.inject(HyBottomSheet).open(Body, {
      label: 'Details',
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.5,
      dismissible: false,
    });
    TestBed.tick();
    await new Promise((r) => setTimeout(r));
    ref.snapTo(0);
    expect(ref.breakpoint()).toBe(0.5);
    document
      .querySelector('[data-hy-sheet-handle]')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(ref.breakpoint()).toBe(1);
    ref.close();
    await ref.closed;
  });
  it('reopens projected content and continues reporting breakpoints', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    for (let i = 0; i < 2; i++) {
      f.componentInstance.open.set(true);
      await f.whenStable();
      expect(document.querySelector('.cdk-dialog-container')?.textContent).toContain(
        'Projected content',
      );
      expect(f.componentInstance.point()).toBe(0.5);
      document.querySelector<HTMLButtonElement>('[data-hy-sheet-handle]')!.click();
      await f.whenStable();
      expect(f.componentInstance.point()).toBe(1);
      f.componentInstance.open.set(false);
      await f.whenStable();
      await new Promise((r) => setTimeout(r));
    }
  });
});

it('releases a sheet even when the animation finished promise is suspended', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate');
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value: () => ({ cancel: vi.fn(), finished: new Promise<void>(() => {}) }),
  });
  try {
    const ref = TestBed.inject(HyBottomSheet).open<string>(Body, { label: 'Details' });
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    ref.close('done');
    expect(await ref.closed).toBe('done');
    expect(document.querySelector('.cdk-dialog-container')).toBeNull();
  } finally {
    TestBed.inject(Dialog).closeAll();
    if (descriptor) Object.defineProperty(HTMLElement.prototype, 'animate', descriptor);
    else Reflect.deleteProperty(HTMLElement.prototype, 'animate');
  }
});
