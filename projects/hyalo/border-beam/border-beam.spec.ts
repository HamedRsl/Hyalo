import { TestBed } from '@angular/core/testing';
import { HyMotion } from '@hyalo/angular/motion';
import { provideHyalo } from '@hyalo/angular/core';
import { HyBorderBeam } from './border-beam';

describe('HyBorderBeam', () => {
  let intersect: (visible: boolean) => void;
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHyalo({ fidelity: 'high' })] });
    observe = vi.fn();
    disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        readonly observe = observe;
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

  it('is decorative and static by default, even when visible', async () => {
    const fixture = TestBed.createComponent(HyBorderBeam);
    await fixture.whenStable();
    intersect(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');
    expect(fixture.nativeElement.tabIndex).toBe(-1);
    expect(fixture.nativeElement.classList.contains('moving')).toBe(false);
    expect(observe).toHaveBeenCalledExactlyOnceWith(fixture.nativeElement);
  });

  it('only moves on opt-in while onscreen and the document is visible', async () => {
    const fixture = TestBed.createComponent(HyBorderBeam);
    fixture.componentRef.setInput('animated', '');
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(false);
    intersect(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(true);
    intersect(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(false);
    intersect(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(false);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(true);
    fixture.componentRef.setInput('animated', 'false');
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(false);
  });

  it('responds to reduced-motion changes without changing its decorative semantics', async () => {
    const fixture = TestBed.createComponent(HyBorderBeam);
    fixture.componentRef.setInput('animated', true);
    await fixture.whenStable();
    intersect(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(true);
    TestBed.inject(HyMotion).setReduced(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(false);
    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');
    TestBed.inject(HyMotion).setReduced(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(true);
  });

  it('stays static in low fidelity even with explicit animation', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHyalo({ fidelity: 'low' })] });
    TestBed.inject(HyMotion).setReduced(false);
    const fixture = TestBed.createComponent(HyBorderBeam);
    fixture.componentRef.setInput('animated', true);
    await fixture.whenStable();
    intersect(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(false);
  });

  it('falls back to document visibility when IntersectionObserver is unavailable', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const fixture = TestBed.createComponent(HyBorderBeam);
    fixture.componentRef.setInput('animated', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(false);
  });

  it('disconnects its observer and document listener on destruction', async () => {
    const remove = vi.spyOn(document, 'removeEventListener');
    const fixture = TestBed.createComponent(HyBorderBeam);
    await fixture.whenStable();
    fixture.destroy();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });
});
