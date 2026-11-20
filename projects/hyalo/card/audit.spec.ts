import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_CARD } from './card';
import { HySkeleton } from '@hyalo/angular/skeleton';
import { HyStat } from '@hyalo/angular/stat';
@Component({
  imports: [HY_CARD, HySkeleton, HyStat],
  template: `<section [attr.aria-busy]="loading()">
    <hy-card>
      @if (loading()) {
        <hy-skeleton shape="rect" height="6rem" radius="8px" />
      } @else {
        <hy-stat label="Revenue" [value]="120" />
      }
      <div hyCardFooter style="display:flex;justify-content:end"><button>Open</button></div>
    </hy-card>
  </section>`,
})
class Host {
  readonly loading = signal(true);
}
describe('card/stat loading composition', () => {
  it('keeps busy state on the region, supports skeleton radius and consumer-aligned footer actions', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const skeleton: HTMLElement = f.nativeElement.querySelector('.hy-card__body hy-skeleton');
    expect(skeleton.style.borderRadius).toBe('8px');
    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
    expect(f.nativeElement.querySelector('section').getAttribute('aria-busy')).toBe('true');
    const footer = f.nativeElement.querySelector('.hy-card__footer');
    expect(getComputedStyle(footer).justifyContent).toBe('end');
    expect(footer.querySelector('button').textContent).toBe('Open');
    f.componentInstance.loading.set(false);
    await f.whenStable();
    expect(f.nativeElement.querySelector('hy-skeleton')).toBeNull();
    expect(f.nativeElement.querySelector('hy-stat').textContent).toContain('120');
    expect(f.nativeElement.querySelector('section').getAttribute('aria-busy')).toBe('false');
  });
});
