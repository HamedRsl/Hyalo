import { TestBed } from '@angular/core/testing';
import { HyMotion } from '@hyalo/angular';
import { HyStat } from './stat';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyStat', () => {
  it('formats the initial value and settles updates directly under reduced motion', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const fixture = TestBed.createComponent(HyStat);
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', 1200);
    fixture.componentRef.setInput('animate', true);
    fixture.componentRef.setInput('format', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
    TestBed.inject(HyMotion).setReduced(true);
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('$1,200');
    fixture.componentRef.setInput('value', 2400);
    await fixture.whenStable();
    expect(fixture.componentInstance.formatted()).toBe('$2,400');
    expect(fixture.nativeElement.querySelector('.sr').textContent).toBe('$2,400');
    await expectNoAxeViolations(fixture.nativeElement);
    fixture.destroy();
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-hy-motion');
  });
});
