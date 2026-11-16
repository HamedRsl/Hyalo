import { TestBed } from '@angular/core/testing';
import { HyGauge } from './gauge';
import { gaugeArc } from './geometry';
import { expectNoAxeViolations } from '../src/testing/axe';

describe('HyGauge', () => {
  it('reports a bounded measurement and selects threshold tones without mutating bands', async () => {
    const f = TestBed.createComponent(HyGauge);
    const bands = Object.freeze([
      { to: 100, tone: 'danger' as const },
      { to: 60, tone: 'success' as const },
    ]);
    f.componentRef.setInput('label', 'Capacity');
    f.componentRef.setInput('value', 40);
    f.componentRef.setInput('unit', '%');
    f.componentRef.setInput('bands', bands);
    f.componentRef.setInput('needle', true);
    await f.whenStable();
    expect(f.nativeElement.getAttribute('data-tone')).toBe('success');
    expect(f.nativeElement.getAttribute('aria-valuetext')).toBe('40 %');
    expect(f.nativeElement.querySelectorAll('.tick')).toHaveLength(6);
    expect(f.nativeElement.querySelector('.needle')).not.toBeNull();
    expect(bands[0]?.to).toBe(100);
    await expectNoAxeViolations(f.nativeElement);
    f.componentRef.setInput('value', 150);
    f.componentRef.setInput('variant', 'semicircle');
    await f.whenStable();
    expect(f.nativeElement.getAttribute('aria-valuenow')).toBe('100');
    expect(f.nativeElement.getAttribute('data-tone')).toBe('danger');
    expect(f.nativeElement.querySelector('.fill').getAttribute('d')).toBe(gaugeArc(-90, 180));
  });
  it('keeps unknown readings distinct and bounds unsafe geometry inputs', async () => {
    const f = TestBed.createComponent(HyGauge);
    f.componentRef.setInput('label', 'Temperature');
    f.componentRef.setInput('value', NaN);
    f.componentRef.setInput('min', 5);
    f.componentRef.setInput('max', 5);
    f.componentRef.setInput('ticks', Infinity);
    f.componentRef.setInput('needle', true);
    await f.whenStable();
    expect(f.nativeElement.getAttribute('role')).toBe('img');
    expect(f.nativeElement.getAttribute('aria-label')).toContain('No reading');
    expect(f.nativeElement.hasAttribute('aria-valuenow')).toBe(false);
    expect(f.nativeElement.querySelector('.needle')).toBeNull();
    expect(f.nativeElement.querySelectorAll('.tick')).toHaveLength(0);
    expect(f.nativeElement.querySelector('.fill').getAttribute('d')).toBe('');
    await expectNoAxeViolations(f.nativeElement);
  });
});
