import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_VIRTUAL_LIST } from './virtual-list';
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
  >
    <ng-template [hyVirtualItem]="list" let-item let-index="index"
      >{{ index + 1 }}: {{ item.name }}</ng-template
    >
  </hy-virtual-list>`,
})
class Host {
  readonly items = signal(Array.from({ length: 1000 }, (_, id) => ({ id, name: 'Event ' + id })));
  readonly key = (item: { id: number }): number => item.id;
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
});
