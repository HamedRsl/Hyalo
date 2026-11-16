import { TestBed } from '@angular/core/testing';
import { HySparkline } from './sparkline';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HySparkline', () => {
  it('bounds output while preserving extreme values and avoiding non-finite coordinates', async () => {
    const fixture = TestBed.createComponent(HySparkline);
    const values = Array.from({ length: 10000 }, (_, i) => (i === 1234 ? 100000 : i % 10));
    fixture.componentRef.setInput('data', values);
    fixture.componentRef.setInput('label', 'Activity increased, with one large spike');
    await fixture.whenStable();
    const points = fixture.componentInstance.points();
    expect(points.split(' ').length).toBeLessThanOrEqual(162);
    expect(points).toContain(',4.00');
    fixture.componentRef.setInput('data', [NaN, Infinity, -1e308, 1e308]);
    await fixture.whenStable();
    expect(fixture.componentInstance.points()).not.toMatch(/NaN|Infinity/);
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
