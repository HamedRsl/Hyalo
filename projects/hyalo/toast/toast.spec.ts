import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { Component, viewChild, TemplateRef } from '@angular/core';
import { HyMotion } from '@hyalo/angular';
import { HyToaster, type HyToastContext } from './toaster';

@Component({
  template:
    '<ng-template #body let-toast let-dismiss="dismiss"><button class="custom" (click)="dismiss()">{{ toast.message }} rich</button></ng-template>',
})
class RichToastFixture {
  readonly body = viewChild.required<TemplateRef<HyToastContext>>('body');
}

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

  it('isolates channel limits, duplicates, pauses and dismissal', () => {
    const toaster = TestBed.inject(HyToaster);
    const uploads = toaster.channel('uploads', {
      maxVisible: 1,
      duplicates: 'ignore',
      position: 'top-start',
    });
    expect(toaster.channel('uploads')).toBe(uploads);
    const first = uploads.show({ message: 'One', duration: 1000 });
    expect(uploads.show({ message: 'One', duration: 1000 })).toBe(first);
    toaster.show({ message: 'Default', duration: 1000 });
    uploads.pause('hover');
    vi.advanceTimersByTime(1400);
    expect(toaster.items()).toHaveLength(0);
    expect(uploads.items()).toHaveLength(1);
    uploads.show({ message: 'Two', duration: 0 });
    expect(
      uploads
        .items()
        .filter((item) => !item.leaving)
        .map((item) => item.message),
    ).toEqual(['Two']);
    uploads.dismissAll();
    vi.advanceTimersByTime(300);
    expect(uploads.items()).toHaveLength(0);
  });

  it('renders template context and settles closure only after removal', async () => {
    const fixture = TestBed.createComponent(RichToastFixture);
    fixture.detectChanges();
    const toaster = TestBed.inject(HyToaster);
    const ref = toaster.show({
      message: 'Hello',
      template: fixture.componentInstance.body(),
      announcement: 'off',
    });
    let result: unknown;
    void ref.closed.then((value) => (result = value));
    TestBed.tick();
    const button = document.querySelector<HTMLButtonElement>('.custom')!;
    expect(button.textContent).toBe('Hello rich');
    expect(announce).not.toHaveBeenCalled();
    button.click();
    expect(result).toBeUndefined();
    vi.advanceTimersByTime(300);
    await Promise.resolve();
    expect(result).toBe('dismiss');
  });

  it('settles action and timeout reasons exactly once', async () => {
    const toaster = TestBed.inject(HyToaster);
    const run = vi.fn();
    const action = toaster.show({ message: 'Undo', action: { label: 'Undo', run } });
    const timed = toaster.show({ message: 'Timed', duration: 100 });
    TestBed.tick();
    document.querySelector<HTMLButtonElement>('.hy-toast__action')!.click();
    action.dismiss();
    vi.advanceTimersByTime(500);
    expect(await action.closed).toBe('action');
    expect(await timed.closed).toBe('timeout');
    expect(run).toHaveBeenCalledOnce();
  });
  it('updates the existing stack and chooses the narrowest matching breakpoint', () => {
    const small = Object.assign(new EventTarget(), { matches: true });
    const medium = Object.assign(new EventTarget(), { matches: true });
    vi.stubGlobal('matchMedia', (query: string) => (query.includes('400') ? small : medium));
    try {
      const channel = TestBed.inject(HyToaster).channel('responsive-test', {
        position: 'top-end',
        breakpoints: [
          { maxWidth: 800, position: 'bottom-start', width: '22rem' },
          { maxWidth: 400, position: 'bottom-center', width: '18rem' },
        ],
      });
      channel.show({ message: 'Keep this message', duration: 0 });
      TestBed.tick();
      const stack = document.querySelector<HTMLElement>('.hy-toast-stack')!;
      expect(stack.style.inlineSize).toContain('18rem');
      expect(stack.closest<HTMLElement>('.cdk-global-overlay-wrapper')!.style.justifyContent).toBe(
        'center',
      );
      small.matches = false;
      small.dispatchEvent(new Event('change'));
      TestBed.tick();
      expect(stack.style.inlineSize).toContain('22rem');
      expect(stack.closest<HTMLElement>('.cdk-global-overlay-wrapper')!.style.justifyContent).toBe(
        'flex-start',
      );
      expect(document.querySelector('.hy-toast-stack')).toBe(stack);
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it('uses responsive stack width and opt-in noninteractive content dismissal', async () => {
    const toaster = TestBed.inject(HyToaster).channel('position', {
      position: 'top-start',
      width: '30rem',
    });
    const ref = toaster.show({
      message: 'Click',
      dismissOnClick: true,
      contentClass: 'custom-message',
    });
    TestBed.tick();
    const stack = document.querySelector<HTMLElement>('.hy-toast-stack')!;
    const expected = document.createElement('div');
    expected.style.inlineSize = 'min(30rem, calc(100vw - 2rem))';
    expect(stack.style.inlineSize).toBe(expected.style.inlineSize);
    expect(stack.closest<HTMLElement>('.cdk-global-overlay-wrapper')!.style.alignItems).toBe(
      'flex-start',
    );
    document.querySelector<HTMLElement>('.hy-toast__message')!.click();
    vi.advanceTimersByTime(300);
    expect(await ref.closed).toBe('dismiss');
  });
});
