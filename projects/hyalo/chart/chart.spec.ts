import { TestBed } from '@angular/core/testing';
import { HY_CHART_LOADER, HyChart } from './chart';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyChart', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('keeps a readable data table and destroys instances on replacement and teardown', async () => {
    const configs: unknown[] = [],
      destroy = vi.fn();
    class FakeChart {
      constructor(_canvas: unknown, config: unknown) {
        configs.push(config);
      }
      destroy = destroy;
    }
    TestBed.configureTestingModule({
      providers: [
        { provide: HY_CHART_LOADER, useValue: () => Promise.resolve({ Chart: FakeChart }) },
      ],
    });
    vi.stubGlobal('IntersectionObserver', undefined);
    const fixture = TestBed.createComponent(HyChart);
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('summary', 'Revenue increased');
    fixture.componentRef.setInput('data', {
      labels: ['Jan', 'Feb'],
      series: [{ label: 'Revenue', values: [20, NaN] }],
    });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
    expect(configs.length).toBeGreaterThan(0);
    await expectNoAxeViolations(fixture.nativeElement);
    fixture.componentRef.setInput('type', 'bar');
    await fixture.whenStable();
    expect(destroy).toHaveBeenCalled();
    const before = destroy.mock.calls.length;
    fixture.destroy();
    expect(destroy.mock.calls.length).toBe(before + 1);
  });
  it('ignores a late engine load after destruction', async () => {
    let resolve: ((value: unknown) => void) | undefined;
    const engine = new Promise((r) => (resolve = r)),
      construct = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: HY_CHART_LOADER, useValue: () => engine }],
    });
    vi.stubGlobal('IntersectionObserver', undefined);
    const fixture = TestBed.createComponent(HyChart);
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('data', {
      labels: ['Jan'],
      series: [{ label: 'Revenue', values: [20] }],
    });
    fixture.detectChanges();
    TestBed.tick();
    fixture.destroy();
    resolve?.({ Chart: construct });
    await Promise.resolve();
    expect(construct).not.toHaveBeenCalled();
  });
});
