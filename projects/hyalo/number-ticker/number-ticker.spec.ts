import { TestBed } from '@angular/core/testing';
import { HyLocale, provideHyalo } from '@hyalo/angular/core';
import { HyMotion } from '@hyalo/angular/motion';
import { HyNumberTicker } from './number-ticker';

describe('HyNumberTicker', () => {
  let frames: Map<number, FrameRequestCallback>;
  let nextFrame: number;
  let intersect: (visible: boolean) => void;
  let disconnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHyalo({ fidelity: 'high', locale: 'en-US' })],
    });
    frames = new Map();
    nextFrame = 0;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
    disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        readonly observe = vi.fn();
        readonly disconnect = disconnect;
        constructor(callback: IntersectionObserverCallback) {
          intersect = (visible) =>
            callback(
              [{ isIntersecting: visible } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            );
        }
      },
    );
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    TestBed.inject(HyMotion).setReduced(false);
  });

  afterEach(() => {
    TestBed.inject(HyMotion).setReduced(null);
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function advance(timestamp = 0): void {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(timestamp));
  }

  it('renders the final static number, with affixes and accessible text, without scheduling frames', async () => {
    const fixture = TestBed.createComponent(HyNumberTicker);
    fixture.componentRef.setInput('value', -1234.5);
    fixture.componentRef.setInput('prefix', '$');
    fixture.componentRef.setInput('suffix', ' USD');
    fixture.componentRef.setInput('format', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    await fixture.whenStable();
    intersect(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[aria-hidden="true"]').textContent).toBe(
      '$-1,234.50 USD',
    );
    expect(fixture.nativeElement.querySelector('.sr').textContent).toBe('$-1,234.50 USD');
    fixture.componentRef.setInput('value', 42.25);
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('$42.25 USD');
    expect(frames.size).toBe(0);
  });

  it('uses Persian digits and localized minus/group/decimal separators from the shared locale', async () => {
    TestBed.inject(HyLocale).setLocale('fa-IR');
    const fixture = TestBed.createComponent(HyNumberTicker);
    fixture.componentRef.setInput('value', -1234.5);
    fixture.componentRef.setInput('format', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('\u200e−۱٬۲۳۴٫۵۰');
    expect(fixture.componentInstance.accessible()).toBe('\u200e−۱٬۲۳۴٫۵۰');
    TestBed.inject(HyLocale).setLocale('de-DE');
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('-1.234,50');
  });

  it('lets a local locale override the shared locale and clears the override reactively', async () => {
    const fixture = TestBed.createComponent(HyNumberTicker);
    fixture.componentRef.setInput('value', 1234.5);
    fixture.componentRef.setInput('format', { minimumFractionDigits: 1 });
    fixture.componentRef.setInput('locale', 'de-DE');
    await fixture.whenStable();
    TestBed.inject(HyLocale).setLocale('fa-IR');
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('1.234,5');
    fixture.componentRef.setInput('locale', undefined);
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('۱٬۲۳۴٫۵');
  });

  it.each([NaN, Infinity, -Infinity])(
    'normalizes non-finite %s to a finite accessible zero',
    async (value) => {
      const fixture = TestBed.createComponent(HyNumberTicker);
      fixture.componentRef.setInput('value', value);
      await fixture.whenStable();
      expect(fixture.componentInstance.formatted()).toBe('0');
      expect(fixture.componentInstance.accessible()).toBe('0');
      expect(frames.size).toBe(0);
    },
  );

  it('animates visual digits while exposing only the final target to assistive technology', async () => {
    const fixture = TestBed.createComponent(HyNumberTicker);
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('animate', '');
    await fixture.whenStable();
    intersect(true);
    await fixture.whenStable();
    advance();
    fixture.componentRef.setInput('value', -100);
    await fixture.whenStable();
    expect(frames.size).toBe(1);
    expect(fixture.nativeElement.querySelector('.sr').textContent).toBe('-100');
    expect(fixture.nativeElement.querySelector('[aria-hidden="true"]').textContent).toBe('0');
    advance(16);
    await fixture.whenStable();
    const intermediate = Number(fixture.componentInstance.formatted());
    expect(intermediate).toBeLessThan(0);
    expect(intermediate).toBeGreaterThan(-100);
    expect(fixture.componentInstance.accessible()).toBe('-100');
    for (let i = 2; frames.size && i < 300; i++) advance(i * 16);
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('-100');
    expect(frames.size).toBe(0);
  });

  it('snaps to the target and cancels running motion when reduced motion is requested', async () => {
    const fixture = TestBed.createComponent(HyNumberTicker);
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('animate', true);
    await fixture.whenStable();
    intersect(true);
    await fixture.whenStable();
    fixture.componentRef.setInput('value', 100);
    await fixture.whenStable();
    expect(frames.size).toBe(1);
    TestBed.inject(HyMotion).setReduced(true);
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('100');
    expect(frames.size).toBe(0);
    fixture.componentRef.setInput('value', -20);
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('-20');
    expect(frames.size).toBe(0);
  });

  it('snaps offscreen updates and resumes from the current value on return', async () => {
    const fixture = TestBed.createComponent(HyNumberTicker);
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('animate', true);
    await fixture.whenStable();
    intersect(true);
    await fixture.whenStable();
    fixture.componentRef.setInput('value', 100);
    await fixture.whenStable();
    intersect(false);
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('100');
    expect(frames.size).toBe(0);
    fixture.componentRef.setInput('value', 200);
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('200');
    expect(frames.size).toBe(0);
    intersect(true);
    await fixture.whenStable();
    advance();
    fixture.componentRef.setInput('value', 300);
    await fixture.whenStable();
    advance(16);
    await fixture.whenStable();
    expect(Number(fixture.componentInstance.formatted())).toBeGreaterThan(200);
    expect(Number(fixture.componentInstance.formatted())).toBeLessThan(300);
  });

  it('formats animated negative decimals with Persian digits and settles exactly on the target', async () => {
    const fixture = TestBed.createComponent(HyNumberTicker);
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('locale', 'fa-IR');
    fixture.componentRef.setInput('format', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    fixture.componentRef.setInput('animate', true);
    await fixture.whenStable();
    intersect(true);
    await fixture.whenStable();
    advance();
    fixture.componentRef.setInput('value', -12.5);
    await fixture.whenStable();
    advance(16);
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toMatch(/[۰-۹]٫[۰-۹]{2}/);
    expect(fixture.componentInstance.formatted()).not.toBe('\u200e−۱۲٫۵۰');
    expect(fixture.componentInstance.accessible()).toBe('\u200e−۱۲٫۵۰');
    for (let i = 2; frames.size && i < 300; i++) advance(i * 16);
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('\u200e−۱۲٫۵۰');
    expect(frames.size).toBe(0);
  });

  it('cancels running animation when the document is hidden or opt-in is removed', async () => {
    const fixture = TestBed.createComponent(HyNumberTicker);
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('animate', true);
    await fixture.whenStable();
    intersect(true);
    await fixture.whenStable();
    fixture.componentRef.setInput('value', 100);
    await fixture.whenStable();
    expect(frames.size).toBe(1);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('100');
    expect(frames.size).toBe(0);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await fixture.whenStable();
    fixture.componentRef.setInput('value', 200);
    await fixture.whenStable();
    expect(frames.size).toBe(1);
    fixture.componentRef.setInput('animate', 'false');
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('200');
    expect(frames.size).toBe(0);
  });

  it('cancels pending frames and disconnects visibility resources on destroy', async () => {
    const remove = vi.spyOn(document, 'removeEventListener');
    const fixture = TestBed.createComponent(HyNumberTicker);
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('animate', true);
    await fixture.whenStable();
    intersect(true);
    await fixture.whenStable();
    fixture.componentRef.setInput('value', 100);
    await fixture.whenStable();
    expect(frames.size).toBe(1);
    fixture.destroy();
    expect(frames.size).toBe(0);
    expect(disconnect).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });
});
