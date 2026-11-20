import { TestBed } from '@angular/core/testing';
import { HyMotion } from '@hyalo/angular';
import { HyProgress, HySpinner } from './progress';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyProgress', () => {
  it('renders success progress, segments and a contextual value label', async () => {
    const fixture = TestBed.createComponent(HyProgress);
    for (const [key, value] of Object.entries({
      label: 'Upload',
      value: 60,
      success: 20,
      segments: 5,
      showLabel: true,
    }))
      fixture.componentRef.setInput(key, value);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.success').style.inlineSize).toBe('20%');
    expect(fixture.nativeElement.querySelector('.track').getAttribute('data-segments')).toBe('5');
    expect(fixture.nativeElement.querySelector('.value-label').textContent.trim()).toBe('60%');
  });
  it('normalizes custom bounds and applies circle geometry to the rendered SVG', async () => {
    const fixture = TestBed.createComponent(HyProgress);
    for (const [key, value] of Object.entries({
      label: 'Upload',
      value: 30,
      min: 20,
      max: 60,
      variant: 'circle',
      size: '5rem',
      thickness: 8,
      linecap: 'butt',
    }))
      fixture.componentRef.setInput(key, value);
    await fixture.whenStable();
    expect(fixture.nativeElement.getAttribute('aria-valuemin')).toBe('20');
    expect(fixture.nativeElement.getAttribute('aria-valuemax')).toBe('60');
    expect(fixture.nativeElement.getAttribute('aria-valuenow')).toBe('30');
    const fill = fixture.nativeElement.querySelector('circle.fill');
    expect(fill.getAttribute('stroke-dashoffset')).toBe('75');
    expect(fill.getAttribute('r')).toBe('16');
    expect(fill.getAttribute('stroke-width')).toBe('8');
    expect(fill.getAttribute('stroke-linecap')).toBe('butt');
    expect(fixture.nativeElement.style.inlineSize).toBe('5rem');
    fixture.componentRef.setInput('value', 90);
    await fixture.whenStable();
    expect(fixture.nativeElement.getAttribute('aria-valuenow')).toBe('60');
    fixture.componentRef.setInput('max', 10);
    await fixture.whenStable();
    expect(Number.isFinite(fixture.componentInstance.amount())).toBe(true);
  });
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
  it('forwards spinner geometry and timing to the actual animated progress', async () => {
    const fixture = TestBed.createComponent(HySpinner);
    fixture.componentRef.setInput('size', '4rem');
    fixture.componentRef.setInput('thickness', 6);
    fixture.componentRef.setInput('duration', 2400);
    await fixture.whenStable();
    expect(fixture.nativeElement.style.inlineSize).toBe('4rem');
    expect(fixture.nativeElement.querySelector('circle.fill').getAttribute('stroke-width')).toBe(
      '6',
    );
    expect(
      fixture.nativeElement
        .querySelector('hy-progress')
        .style.getPropertyValue('--hy-progress-duration'),
    ).toBe('2400ms');
  });
});
