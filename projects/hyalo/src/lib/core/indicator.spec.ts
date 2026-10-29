import { Component, ElementRef, signal, viewChild, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { trackIndicator } from './indicator';

@Component({
  template: `
    <div #row>
      @for (item of items; track item) {
        <span #item>{{ item }}</span>
      }
    </div>
  `,
})
class Host {
  readonly items = ['a', 'b', 'c'];
  readonly selected = signal(1);
  private readonly row = viewChild<ElementRef<HTMLElement>>('row');
  private readonly spans = viewChildren('item', { read: ElementRef<HTMLElement> });
  readonly ready = trackIndicator(
    this.row,
    () => this.spans()[this.selected()]?.nativeElement ?? null,
  );
}

/** jsdom has no layout, so each item reports a 50px box at 50px * index. */
function stubLayout(): void {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const index = this.tagName === 'SPAN' ? [...this.parentElement!.children].indexOf(this) : 0;
    const left = this.tagName === 'SPAN' ? 10 + index * 50 : 10;
    return { left, width: this.tagName === 'SPAN' ? 50 : 150 } as DOMRect;
  });
}

describe('trackIndicator', () => {
  beforeEach(() => {
    stubLayout();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(0)));
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('places the indicator under the selected item and turns ready', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const row: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(row.style.getPropertyValue('--hy-ind-x')).toBe('50px');
    expect(row.style.getPropertyValue('--hy-ind-size')).toBe('50px');
    expect(fixture.componentInstance.ready()).toBe(false);
    await new Promise((resolve) => setTimeout(resolve));
    expect(fixture.componentInstance.ready()).toBe(true);
  });

  it('follows the selection', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    fixture.componentInstance.selected.set(2);
    await fixture.whenStable();
    const row: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(row.style.getPropertyValue('--hy-ind-x')).toBe('100px');
  });

  it('stays unplaced while nothing is selected', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.selected.set(-1);
    await fixture.whenStable();
    const row: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(row.style.getPropertyValue('--hy-ind-x')).toBe('');
    expect(fixture.componentInstance.ready()).toBe(false);
  });
});
