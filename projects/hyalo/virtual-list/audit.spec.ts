import { describe, it, expect, vi } from 'vitest';
import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HY_VIRTUAL_LIST, HyVirtualList, type HyVirtualRange } from './virtual-list';

@Component({
  imports: [HY_VIRTUAL_LIST],
  template: `<hy-virtual-list #list label="Records" [items]="items()" [itemKey]="key"
    [rowHeight]="20" [columnWidth]="40" [columnCount]="100" [orientation]="orientation"
    [loadRange]="loader" [overscan]="1">
    <ng-template [hyVirtualItem]="list" let-item>{{item}}</ng-template>
  </hy-virtual-list>`,
})
class Host {
  readonly items = signal(Array.from({length: 10000}, (_, index) => index));
  readonly key = (item: number): number => item;
  orientation: 'vertical' | 'horizontal' | 'grid' = 'vertical';
  loader: ((range: HyVirtualRange, signal: AbortSignal) => Promise<void>) | undefined;
}

describe('virtual viewport audit', () => {
  it('does not start consumer loading during server rendering', async () => {
    TestBed.overrideProvider(PLATFORM_ID, {useValue: 'server'});
    const fixture = TestBed.createComponent(Host);
    const loader = vi.fn(async () => undefined);
    fixture.componentInstance.loader = loader;
    await fixture.whenStable();
    expect(loader).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('[role=listitem]').length).toBeLessThanOrEqual(12);
  });

  it.each(['horizontal', 'grid'] as const)('bounds %s DOM and reaches the final item', async orientation => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.orientation = orientation;
    await fixture.whenStable();
    const list = fixture.debugElement.query(By.directive(HyVirtualList)).componentInstance as HyVirtualList<number>;
    list.scrollToIndex(9999, {align: 'start'});
    await fixture.whenStable();
    const rows = fixture.nativeElement.querySelectorAll('[role=listitem]') as NodeListOf<HTMLElement>;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThanOrEqual(36);
    expect([...rows].some(row => row.getAttribute('aria-posinset') === '10000')).toBe(true);
  });

  it('does not invoke a deferred loader after the list is destroyed', async () => {
    const fixture = TestBed.createComponent(Host);
    const loader = vi.fn(async () => undefined);
    fixture.componentInstance.loader = loader;
    fixture.detectChanges();
    fixture.destroy();
    await Promise.resolve();
    expect(loader).not.toHaveBeenCalled();
  });

  it('does not invoke a retry queued immediately before destruction', async () => {
    const fixture = TestBed.createComponent(Host);
    const loader = vi.fn(async () => undefined);
    fixture.componentInstance.loader = loader;
    await fixture.whenStable();
    const list = fixture.debugElement.query(By.directive(HyVirtualList)).componentInstance as HyVirtualList<number>;
    loader.mockClear();
    list.retry();
    fixture.destroy();
    await Promise.resolve();
    expect(loader).not.toHaveBeenCalled();
  });

  it('aborts replaced requests, ignores stale failures and retries the current range', async () => {
    const fixture = TestBed.createComponent(Host);
    const requests: {signal: AbortSignal; range: HyVirtualRange; resolve: () => void; reject: (error: unknown) => void}[] = [];
    fixture.componentInstance.loader = (range, signal) => new Promise<void>((resolve, reject) => requests.push({range, signal, resolve, reject}));
    await fixture.whenStable();
    const list = fixture.debugElement.query(By.directive(HyVirtualList)).componentInstance as HyVirtualList<number>;
    list.scrollToIndex(500, {align: 'start'});
    await fixture.whenStable();
    expect(requests[0]!.signal.aborted).toBe(true);
    requests[0]!.reject(new Error('stale'));
    await fixture.whenStable();
    expect(list.error()).toBeNull();
    expect(list.loading()).toBe(true);
    requests.at(-1)!.reject(new Error('current'));
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();
    expect(list.error()).toEqual(new Error('current'));
    list.retry();
    await fixture.whenStable();
    expect(list.error()).toBeNull();
    requests.at(-1)!.resolve();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();
    expect(list.loading()).toBe(false);
    list.retry();
    await fixture.whenStable();
    fixture.destroy();
    expect(requests.at(-1)!.signal.aborted).toBe(true);
  });
});
