import { TestBed } from '@angular/core/testing';
import { HY_CHART_LOADER, HyChart } from './chart';
import type { ChartConfiguration, ChartEvent, ActiveElement } from 'chart.js';

describe('chart API audit', () => {
  const instances: Engine[] = [];
  class Engine {
    readonly update = vi.fn();
    readonly destroy = vi.fn();
    readonly toBase64Image = vi.fn(() => 'data:image/png;base64,test');
    constructor(readonly canvas: HTMLCanvasElement, readonly config: ChartConfiguration) {
      instances.push(this);
    }
  }
  beforeEach(() => {
    instances.length = 0;
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('matchMedia', () => ({ addEventListener() {}, removeEventListener() {} }));
    TestBed.configureTestingModule({
      providers: [{ provide: HY_CHART_LOADER, useValue: async () => ({ Chart: Engine }) }],
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  function create() {
    const f = TestBed.createComponent(HyChart);
    f.componentRef.setInput('label', 'Revenue');
    f.componentRef.setInput('data', { labels: ['Jan'], series: [{ label: 'Sales', values: [12] }] });
    return f;
  }
  it('releases export and refresh access on destruction', async () => {
    const f = create();
    expect(f.componentInstance.toBase64Image()).toBeUndefined();
    f.componentInstance.refresh();
    await f.whenStable();
    const engine = instances.at(-1)!;
    expect(f.componentInstance.getCanvas()).toBe(engine.canvas);
    expect(f.componentInstance.toBase64Image('image/jpeg', .7)).toContain('data:image/png');
    expect(engine.toBase64Image).toHaveBeenCalledWith('image/jpeg', .7);
    f.destroy();
    expect(engine.destroy).toHaveBeenCalledOnce();
    expect(f.componentInstance.toBase64Image()).toBeUndefined();
    expect(f.componentInstance.getCanvas()).toBeNull();
    f.componentInstance.refresh();
    expect(engine.update).not.toHaveBeenCalled();
  });
  it('only constructs the latest pending render when loader resolutions arrive out of order', async () => {
    const pending: ((value: unknown) => void)[] = [];
    TestBed.overrideProvider(HY_CHART_LOADER, { useValue: () => new Promise(resolve => pending.push(resolve)) });
    const f = create();
    f.detectChanges(); TestBed.tick();
    expect(pending.length).toBe(1);
    f.componentRef.setInput('type', 'bar');
    f.detectChanges(); TestBed.tick();
    expect(pending.length).toBe(2);
    pending[1]!({ Chart: Engine });
    await Promise.resolve();
    pending[0]!({ Chart: Engine });
    await Promise.resolve();
    expect(instances).toHaveLength(1);
    expect(instances[0]!.config.type).toBe('bar');
    f.destroy();
  });
  it('composes selected point output with consumer clicks and replaces options and plugins', async () => {
    const f = create(), callback = vi.fn(), replacement = vi.fn(), selected = vi.fn();
    f.componentInstance.dataPointSelected.subscribe(selected);
    const plugin = { id: 'consumer' };
    f.componentRef.setInput('plugins', [plugin]);
    f.componentRef.setInput('options', { onClick: callback, scales: { y: { max: 100 } } });
    await f.whenStable();
    const first = instances.at(-1)!;
    const event = { type: 'click' } as ChartEvent;
    const elements = [{ datasetIndex: 0, index: 0 }] as ActiveElement[];
    first.config.options!.onClick!.call(first as never, event, elements, first as never);
    expect(selected).toHaveBeenCalledWith({ event, elements });
    expect(callback).toHaveBeenCalledWith(event, elements, first);
    first.config.options!.onClick!.call(first as never, event, [], first as never);
    expect(selected).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledTimes(2);
    expect(first.config.plugins).toEqual([plugin]);
    f.componentRef.setInput('options', { onClick: replacement });
    f.componentRef.setInput('plugins', []);
    await f.whenStable();
    const second = instances.at(-1)!;
    expect(first.destroy).toHaveBeenCalledOnce();
    expect(second.config.plugins).toEqual([]);
    expect(second.config.options!.scales!['y']!['max']).toBeUndefined();
    second.config.options!.onClick!.call(second as never, event, [], second as never);
    expect(replacement).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledTimes(2);
    f.componentInstance.refresh();
    expect(second.update).toHaveBeenCalledOnce();
    const count = instances.length;
    f.componentInstance.reinitialize();
    await f.whenStable();
    expect(instances.length).toBe(count + 1);
    expect(second.destroy).toHaveBeenCalledOnce();
    f.destroy();
  });
});
