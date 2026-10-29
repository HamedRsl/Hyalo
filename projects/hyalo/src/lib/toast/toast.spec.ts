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
    toaster.pause();
    vi.advanceTimersByTime(2000);
    expect(toaster.items().length).toBe(1);
    toaster.resume();
    vi.advanceTimersByTime(1000);
    expect(toaster.items().length).toBe(0);
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
    expect(toaster.items().length).toBe(0);
  });

  it('keeps at most four visible', () => {
    const toaster = TestBed.inject(HyToaster);
    for (let i = 0; i < 6; i++) toaster.show({ message: `n${i}` });
    expect(toaster.items().map((t) => t.message)).toEqual(['n2', 'n3', 'n4', 'n5']);
  });
});
