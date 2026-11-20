import type { ChartConfiguration } from 'chart.js';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_CHART_LOADER, HyChart } from '@hyalo/angular/chart';
import { HySparkline } from './sparkline';
@Component({
  imports: [HySparkline, HyChart],
  template: `@if(expanded()) { <hy-chart label="Trend detail" [type]="type()" [data]="chartData" [options]="options" /> }
    @else { <hy-sparkline label="Trend" [data]="values" /> }
    <button (click)="expanded.set(!expanded())">Toggle detail</button>`,
})
class Trend {
  readonly expanded = signal(false);
  readonly type = signal<'area' | 'bar'>('area');
  readonly values = [2, 7];
  readonly chartData = { labels: ['A', 'B'], series: [{ label: 'Trend', values: this.values }] };
  readonly options = { scales: { y: { min: 0, max: 10 } }, plugins: { tooltip: { enabled: true } } };
}
describe('API-260 sparkline chart mapping', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('keeps SVG lightweight until opting into chart area/bar and axis/tooltip options', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('matchMedia', () => ({ addEventListener() {}, removeEventListener() {} }));
    const configs: ChartConfiguration[] = [], destroy = vi.fn(), load = vi.fn(async () => ({ Chart: class {
      constructor(_canvas: unknown, config: ChartConfiguration) { configs.push(config); }
      destroy = destroy;
    } }));
    TestBed.configureTestingModule({ providers: [{ provide: HY_CHART_LOADER, useValue: load }] });
    const f = TestBed.createComponent(Trend);
    await f.whenStable();
    expect(f.nativeElement.querySelector('hy-sparkline svg')).toBeTruthy();
    expect(load).not.toHaveBeenCalled();
    f.nativeElement.querySelector('button').click(); await f.whenStable();
    expect(configs.at(-1)!.type).toBe('line');
    expect(configs.at(-1)!.data.datasets[0]).toMatchObject({ fill: true });
    expect(configs.at(-1)!.options).toMatchObject({ scales: { y: { max: 10 } }, plugins: { tooltip: { enabled: true } } });
    f.componentInstance.type.set('bar'); await f.whenStable();
    expect(configs.at(-1)!.type).toBe('bar');
    expect(f.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
    f.nativeElement.querySelector('button').click(); await f.whenStable();
    expect(f.nativeElement.querySelector('hy-sparkline')).toBeTruthy();
    expect(destroy).toHaveBeenCalledTimes(configs.length);
    f.destroy();
  });
});
