import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HY_BENTO, HyBento } from './bento';

@Component({
  imports: [HY_BENTO],
  template: `<hy-bento [(order)]="order" [reorderable]="enabled()">
    <section hyBentoTile tileId="a">A</section>
    <section hyBentoTile tileId="b">B</section>
    <section hyBentoTile tileId="c">C</section>
  </hy-bento>`,
})
class Host {
  readonly order = signal<readonly string[]>(['b']);
  readonly enabled = signal(true);
}

describe('bento reordering', () => {
  it('routes drag events through the same normalized DOM ordering and blocks disabled drops', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const a: HTMLElement = f.nativeElement.querySelector('[tileId=a]');
    const b: HTMLElement = f.nativeElement.querySelector('[tileId=b]');
    a.dispatchEvent(new Event('dragstart', { bubbles: true }));
    b.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
    await f.whenStable();
    expect(f.componentInstance.order()).toEqual(['a', 'b', 'c']);
    expect(
      [...f.nativeElement.querySelectorAll('.grid > section')].map((el: Element) => el.textContent),
    ).toEqual(['A', 'B', 'C']);
    f.componentInstance.enabled.set(false);
    await f.whenStable();
    b.dispatchEvent(new Event('dragstart', { bubbles: true }));
    a.dispatchEvent(new Event('drop', { bubbles: true }));
    expect(f.componentInstance.order()).toEqual(['a', 'b', 'c']);
  });
  it('includes unlisted tiles when a partial order is moved and preserves DOM reading order', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const bento: HyBento = f.debugElement.query(By.directive(HyBento)).componentInstance;
    const reordered = vi.fn();
    bento.reordered.subscribe(reordered);
    const a: HTMLElement = f.nativeElement.querySelector('[tileId=a]');
    a.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        altKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await f.whenStable();
    expect(f.componentInstance.order()).toEqual(['b', 'c', 'a']);
    expect(
      [...f.nativeElement.querySelectorAll('.grid > section')].map(
        (tile: unknown) => (tile as HTMLElement).textContent,
      ),
    ).toEqual(['B', 'C', 'A']);
    expect(reordered).toHaveBeenCalledTimes(1);
    f.componentInstance.enabled.set(false);
    await f.whenStable();
    a.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }),
    );
    expect(f.componentInstance.order()).toEqual(['b', 'c', 'a']);
    expect(a.hasAttribute('tabindex')).toBe(false);
  });
});
