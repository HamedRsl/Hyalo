import { TestBed } from '@angular/core/testing';
import { HyMotion } from '@hyalo/angular';
import { HyProgress, HySpinner } from './progress';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyProgress', () => {
  it('pauses outside the viewport and in background tabs, then disconnects', async () => {
    let callback: IntersectionObserverCallback | undefined;
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb;
        }
        observe(): void {}
        disconnect = disconnect;
      },
    );
    const fixture = TestBed.createComponent(HyProgress);
    fixture.componentRef.setInput('label', 'Preparing report');
    await fixture.whenStable();
    callback?.(
      [{ isIntersecting: false }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(false);
    callback?.(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );
    await fixture.whenStable();
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(false);
    fixture.destroy();
    expect(disconnect).toHaveBeenCalledOnce();
    hidden.mockRestore();
    vi.unstubAllGlobals();
  });
  it('clamps values and omits aria-valuenow for indeterminate progress', async () => {
    const fixture = TestBed.createComponent(HyProgress);
    fixture.componentRef.setInput('label', 'Upload');
    fixture.componentRef.setInput('value', 150);
    await fixture.whenStable();
    expect(fixture.nativeElement.getAttribute('aria-valuenow')).toBe('100');
    fixture.componentRef.setInput('value', null);
    await fixture.whenStable();
    expect(fixture.nativeElement.hasAttribute('aria-valuenow')).toBe(false);
    TestBed.inject(HyMotion).setReduced(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('moving')).toBe(false);
    await expectNoAxeViolations(fixture.nativeElement);
    document.documentElement.removeAttribute('data-hy-motion');
  });
  it('gives the spinner a named progressbar', async () => {
    const fixture = TestBed.createComponent(HySpinner);
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[role=progressbar]').getAttribute('aria-label'),
    ).toBe('Loading');
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
