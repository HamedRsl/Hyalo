import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HY_VIRTUAL_LIST, HyVirtualList, type HyVirtualRange } from './virtual-list';
import { expectNoAxeViolations } from '../src/testing/axe';

@Component({
  imports: [HY_VIRTUAL_LIST],
  template: `<hy-virtual-list
    #list
    label="Events"
    [items]="items()"
    [itemKey]="key"
    [rowHeight]="20"
    [overscan]="2"
    [orientation]="orientation()"
    [columnCount]="columns()"
    [columnWidth]="100"
    [virtual]="virtual()"
    [appendOnly]="appendOnly()"
    [loadRange]="loader()"
    (rangeChange)="ranges.push($event)"
  >
    <ng-template [hyVirtualItem]="list" let-item let-index="index"
      >{{ index + 1 }}: {{ item.name }}</ng-template
    >
  </hy-virtual-list>`,
})
class Host {
  readonly items = signal(Array.from({ length: 1000 }, (_, id) => ({ id, name: 'Event ' + id })));
  readonly key = (item: { id: number }): number => item.id;
  readonly orientation = signal<'vertical' | 'horizontal' | 'grid'>('vertical');
  readonly columns = signal(25);
  readonly virtual = signal(true);
  readonly appendOnly = signal(false);
  readonly ranges: HyVirtualRange[] = [];
  readonly loader = signal<
    ((range: HyVirtualRange, signal: AbortSignal) => Promise<void>) | undefined
  >(undefined);
}
describe('HyVirtualList', () => {
  it('renders a bounded slice with item positions and disconnects observers', async () => {
    let resize: ResizeObserverCallback | undefined;
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback;
        }
        observe(): void {}
        disconnect = disconnect;
      },
    );
    try {
      const f = TestBed.createComponent(Host);
      await f.whenStable();
      const list = f.nativeElement.querySelector('hy-virtual-list') as HTMLElement;
      expect(list.querySelectorAll('[role=listitem]')).toHaveLength(12);
      resize?.([{ contentRect: { height: 100 } }] as ResizeObserverEntry[], {} as ResizeObserver);
      await f.whenStable();
      list.scrollTop = 400;
      list.dispatchEvent(new Event('scroll'));
      await f.whenStable();
      const first = list.querySelector('[role=listitem]') as HTMLElement;
      expect(first.getAttribute('aria-posinset')).toBe('19');
      expect(first.getAttribute('aria-setsize')).toBe('1000');
      expect(list.querySelectorAll('[role=listitem]')).toHaveLength(10);
      first.focus();
      list.scrollTop = 1000;
      list.dispatchEvent(new Event('scroll'));
      await f.whenStable();
      expect(document.activeElement).toBe(list);
      await expectNoAxeViolations(f.nativeElement);
      f.destroy();
      expect(disconnect).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it('navigates to unrendered items and retains a focus destination when filtering removes one', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const list = f.nativeElement.querySelector('hy-virtual-list') as HTMLElement;
    list.focus();
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await f.whenStable();
    expect((document.activeElement as HTMLElement).getAttribute('aria-posinset')).toBe('1000');
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    list.dispatchEvent(new Event('scroll'));
    await f.whenStable();
    expect((document.activeElement as HTMLElement).getAttribute('aria-posinset')).toBe('1');
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await f.whenStable();
    f.componentInstance.items.set(f.componentInstance.items().slice(0, 3));
    await f.whenStable();
    expect(document.activeElement).toBe(list);
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await f.whenStable();
    expect((document.activeElement as HTMLElement).getAttribute('aria-posinset')).toBe('1');
    await expectNoAxeViolations(f.nativeElement);
  });

  it('deduplicates rendered ranges and cancels stale loads across scroll, resize and retries', async () => {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    const request = vi.fn<(range: HyVirtualRange, signal: AbortSignal) => Promise<void>>();
    const completions: { finish(): void; fail(reason: unknown): void }[] = [];
    request.mockImplementation(
      () =>
        new Promise<void>((resolve, reject) => {
          completions.push({ finish: resolve, fail: reject });
        }),
    );
    host.loader.set(request);
    await fixture.whenStable();
    const target = fixture.debugElement.query(By.directive(HyVirtualList));
    const list = target.componentInstance as HyVirtualList<unknown>;
    const node = target.nativeElement as HTMLElement;
    expect(request).toHaveBeenCalledOnce();
    expect(host.ranges).toEqual([{ start: 0, end: 12 }]);
    list.scrollTo({ top: 1 });
    await fixture.whenStable();
    expect(request).toHaveBeenCalledOnce();
    list.scrollTo({ top: 400 });
    await fixture.whenStable();
    expect(host.ranges.at(-1)).toEqual({ start: 18, end: 32 });
    expect(request.mock.calls[0]![1].aborted).toBe(true);
    completions[0]?.finish();
    await fixture.whenStable();
    expect(list.loading()).toBe(true);
    completions[1]?.fail(new Error('offline'));
    await vi.waitFor(() => expect(list.error()).toEqual(new Error('offline')));
    list.retry();
    await fixture.whenStable();
    completions[2]?.finish();
    await vi.waitFor(() => expect(list.loading()).toBe(false));
    expect(list.error()).toBeNull();
    Object.defineProperty(node, 'clientHeight', { value: 40 });
    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();
    expect(host.ranges.at(-1)).toEqual({ start: 18, end: 25 });
    host.items.set(host.items().slice(0, 3));
    await fixture.whenStable();
    expect(host.ranges.at(-1)).toEqual({ start: 0, end: 3 });
    const last = request.mock.calls.at(-1);
    fixture.destroy();
    expect(last?.[1].aborted).toBe(true);
  });

  it('bounds both grid axes and resets retained rows after bypass or replacement', async () => {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    host.orientation.set('grid');
    host.appendOnly.set(true);
    await fixture.whenStable();
    const target = fixture.debugElement.query(By.directive(HyVirtualList));
    const list = target.componentInstance as HyVirtualList<unknown>;
    const node = target.nativeElement as HTMLElement;
    Object.defineProperties(node, { clientWidth: { value: 200 }, clientHeight: { value: 40 } });
    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();
    expect(node.querySelectorAll('[role=listitem]')).toHaveLength(60);
    list.scrollToIndex(255, { align: 'center' });
    await fixture.whenStable();
    expect(node.scrollTop).toBe(190);
    expect(node.scrollLeft).toBe(450);
    expect(node.querySelector('[data-hy-virtual-index="255"]')).not.toBeNull();
    expect(list.renderedRange().start).toBe(0);
    host.virtual.set(false);
    await fixture.whenStable();
    expect(node.querySelectorAll('[role=listitem]')).toHaveLength(1000);
    host.virtual.set(true);
    await fixture.whenStable();
    expect(list.renderedRange().start).toBe(175);
    host.items.set(host.items().slice(0, 12));
    await fixture.whenStable();
    expect(list.renderedRange()).toEqual({ start: 0, end: 12 });
  });
});
