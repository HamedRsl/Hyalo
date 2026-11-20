import { TestBed } from '@angular/core/testing';
import { HyMeter } from './meter';
import { expectNoAxeViolations } from '../src/testing/axe';

describe('HyMeter', () => {
  it('normalizes semantic thresholds and derives accessible quality text', async () => {
    const f = TestBed.createComponent(HyMeter);
    for (const [key, value] of Object.entries({
      label: 'CPU',
      value: 85,
      low: 20,
      high: 80,
      optimum: 10,
    }))
      f.componentRef.setInput(key, value);
    await f.whenStable();
    expect(f.nativeElement.getAttribute('data-quality')).toBe('worst');
    expect(f.nativeElement.getAttribute('aria-valuetext')).toBe('85: Suboptimal');
    f.componentRef.setInput('value', 10);
    await f.whenStable();
    expect(f.nativeElement.getAttribute('data-quality')).toBe('optimum');
    f.componentRef.setInput('valueText', 'Custom reading');
    await f.whenStable();
    expect(f.nativeElement.getAttribute('aria-valuetext')).toBe('Custom reading');
  });
  it('reports a measurement in its own range and clamps the reading', async () => {
    const f = TestBed.createComponent(HyMeter);
    f.componentRef.setInput('label', 'Memory');
    f.componentRef.setInput('min', 2);
    f.componentRef.setInput('max', 16);
    f.componentRef.setInput('value', 25);
    f.componentRef.setInput('valueText', '16 of 16 gigabytes');
    await f.whenStable();
    expect(f.nativeElement.getAttribute('role')).toBe('meter');
    expect(f.nativeElement.getAttribute('aria-valuenow')).toBe('16');
    expect(f.nativeElement.getAttribute('aria-valuemin')).toBe('2');
    expect(f.nativeElement.getAttribute('aria-valuetext')).toBe('16 of 16 gigabytes');
    expect(f.nativeElement.querySelector('.fill').style.inlineSize).toBe('100%');
    await expectNoAxeViolations(f.nativeElement);
  });
  it('uses valid bounds and never presents missing data as zero', async () => {
    const f = TestBed.createComponent(HyMeter);
    f.componentRef.setInput('label', 'CPU');
    f.componentRef.setInput('value', 40);
    for (const bounds of [
      [10, 10],
      [100, -1],
      [NaN, Infinity],
      [-Number.MAX_VALUE, Number.MAX_VALUE],
    ]) {
      f.componentRef.setInput('min', bounds[0]);
      f.componentRef.setInput('max', bounds[1]);
      await f.whenStable();
      expect(f.nativeElement.getAttribute('aria-valuemin')).toBe('0');
      expect(f.nativeElement.getAttribute('aria-valuemax')).toBe('100');
    }
    for (const value of [null, NaN, Infinity]) {
      f.componentRef.setInput('value', value);
      await f.whenStable();
      expect(f.nativeElement.getAttribute('role')).toBe('img');
      expect(f.nativeElement.hasAttribute('aria-valuenow')).toBe(false);
      expect(f.nativeElement.getAttribute('aria-label')).toBe('CPU: No reading');
      await expectNoAxeViolations(f.nativeElement);
    }
  });
});
