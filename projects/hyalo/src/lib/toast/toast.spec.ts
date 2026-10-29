import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { HyMotion } from '../motion/motion';
import { HyToaster } from './toaster';

describe('HyToaster', () => {
  let announce: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    announce = vi.fn(() => Promise.resolve());
    TestBed.configureTestingModule({
      providers: [{ provide: LiveAnnouncer, useValue: { announce } }],
    });
    TestBed.inject(HyMotion).setReduced(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.inject(HyMotion).setReduced(null);
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('renders a toast in a labelled region and announces it', () => {
    TestBed.inject(HyToaster).show({ title: 'Saved', message: 'Address updated', tone: 'success' });
    TestBed.tick();
    const region = document.querySelector('[role="region"]')!;
    expect(region.getAttribute('aria-label')).toBe('Notifications');
    expect(region.querySelector('.hy-toast__message')!.textContent).toBe('Address updated');
    expect(announce).toHaveBeenCalledWith('Saved. Address updated', 'polite');
  });

  it('announces danger toasts assertively', () => {
    TestBed.inject(HyToaster).error('Payment failed');
    expect(announce).toHaveBeenCalledWith('Payment failed', 'assertive');
  });

  it('hides after the duration and pauses while hovered', () => {
    const toaster = TestBed.inject(HyToaster);
    toaster.show({ message: 'Hello', duration: 1000 });
    toaster.pause('hover');
    vi.advanceTimersByTime(2000);
    expect(toaster.items().length).toBe(1);
    toaster.resume('hover');
    // The timer starts the fade; the toast is gone once it ends.
    vi.advanceTimersByTime(1300);
    expect(toaster.items().length).toBe(0);
  });

  it('stays paused while focus is inside after the pointer leaves', () => {
    const toaster = TestBed.inject(HyToaster);
    toaster.show({ message: 'Hello', duration: 1000 });
    TestBed.tick();
    const stack = document.querySelector('.hy-toast-stack')!;
    document.querySelector<HTMLButtonElement>('.hy-toast__close')!.focus();
    stack.dispatchEvent(new PointerEvent('pointerenter'));
    stack.dispatchEvent(new PointerEvent('pointerleave'));
    vi.advanceTimersByTime(2000);
    expect(toaster.items().length).toBe(1);
    (document.activeElement as HTMLElement).blur();
    vi.advanceTimersByTime(1300);
    expect(toaster.items().length).toBe(0);
  });

  it('resumes when the focused toast is removed', () => {
    const toaster = TestBed.inject(HyToaster);
    toaster.show({ message: 'Keep', duration: 1000 });
    toaster.show({ message: 'Close me', duration: 0 });
    TestBed.tick();
    const close = document.querySelectorAll<HTMLButtonElement>('.hy-toast__close')[1]!;
    close.focus();
    expect(document.activeElement).toBe(close);
    close.click();
    TestBed.tick();
    // Focus stays on the fading toast until it is removed and rendered away.
    vi.advanceTimersByTime(300);
    TestBed.tick();
    vi.advanceTimersByTime(1300);
    expect(toaster.items().map((t) => t.message)).toEqual([]);
  });

  it('keeps toasts with an action until dismissed', () => {
    const toaster = TestBed.inject(HyToaster);
    const run = vi.fn();
    toaster.show({ message: 'Draft deleted', action: { label: 'Undo', run } });
    TestBed.tick();
    vi.advanceTimersByTime(60_000);
    expect(toaster.items().length).toBe(1);
    document.querySelector<HTMLButtonElement>('.hy-toast__action')!.click();
    expect(run).toHaveBeenCalled();
    expect(toaster.items()[0]!.leaving).toBe(true);
    vi.advanceTimersByTime(300);
    expect(toaster.items().length).toBe(0);
  });

  it('keeps at most four visible', () => {
    const toaster = TestBed.inject(HyToaster);
    for (let i = 0; i < 6; i++) toaster.show({ message: `n${i}` });
    const visible = toaster.items().filter((t) => !t.leaving);
    expect(visible.map((t) => t.message)).toEqual(['n2', 'n3', 'n4', 'n5']);
    vi.advanceTimersByTime(300);
    expect(toaster.items().length).toBe(4);
  });
});
