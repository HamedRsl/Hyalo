import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HY_CAROUSEL, HyCarousel } from './carousel';

@Component({
  imports: [HY_CAROUSEL],
  template: `<hy-carousel [autoplayInterval]="100" [orientation]="orientation()" [mode]="mode()"
    ><hy-slide label="One">One</hy-slide><hy-slide label="Two">Two</hy-slide
    ><hy-slide label="Three">Three</hy-slide></hy-carousel
  >`,
})
class Host {
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly mode = signal<'slide' | 'fade'>('slide');
}

@Component({
  imports: [HY_CAROUSEL],
  template: `<hy-carousel [responsive]="widths()"
    ><hy-slide label="One">One</hy-slide><hy-slide label="Two">Two</hy-slide
    ><hy-slide label="Three">Three</hy-slide></hy-carousel
  >`,
})
class ResponsiveHost {
  readonly widths = signal<readonly { minWidth: number; visibleSlides: number }[]>([
    { minWidth: 600, visibleSlides: 2 },
  ]);
}
async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const debug = fixture.debugElement.query(By.directive(HyCarousel));
  return {
    fixture,
    carousel: debug.componentInstance as HyCarousel,
    debug,
    viewport: debug.nativeElement.querySelector('.viewport') as HTMLElement,
  };
}
describe('carousel autoplay policy', () => {
  it('uses container breakpoints and clamps index when a larger page fits', async () => {
    let resize!: ResizeObserverCallback;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    try {
      const fixture = TestBed.createComponent(ResponsiveHost);
      await fixture.whenStable();
      const debug = fixture.debugElement.query(By.directive(HyCarousel));
      const carousel = debug.componentInstance as HyCarousel;
      carousel.goTo(2, false);
      resize([{ contentRect: { width: 700 } } as ResizeObserverEntry], {} as ResizeObserver);
      await fixture.whenStable();
      expect(debug.nativeElement.style.getPropertyValue('--hy-carousel-visible')).toBe('2');
      expect(carousel.index()).toBe(1);
      resize([{ contentRect: { width: 400 } } as ResizeObserverEntry], {} as ResizeObserver);
      await fixture.whenStable();
      expect(debug.nativeElement.style.getPropertyValue('--hy-carousel-visible')).toBe('1');
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it('uses vertical scroll geometry and ArrowDown navigation', async () => {
    const { fixture, carousel, debug, viewport } = await setup();
    fixture.componentInstance.orientation.set('vertical');
    await fixture.whenStable();
    expect(debug.nativeElement.getAttribute('data-orientation')).toBe('vertical');
    const scroll = vi.fn();
    viewport.scrollBy = scroll;
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      right: 300,
    } as DOMRect);
    vi.spyOn(viewport.children[1]!, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 200,
      right: 300,
    } as DOMRect);
    viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(carousel.current()).toBe(1);
    expect(scroll).toHaveBeenLastCalledWith({ top: 200, behavior: 'instant' });
  });
  it('emits completion only when the requested scroll actually settles', async () => {
    const { carousel, viewport } = await setup();
    const completed = vi.fn();
    carousel.transitionCompleted.subscribe(completed);
    viewport.scrollBy = vi.fn();
    let offset = 200;
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0 } as DOMRect);
    vi.spyOn(viewport.children[1]!, 'getBoundingClientRect').mockImplementation(
      () => ({ x: offset, y: 0 }) as DOMRect,
    );
    carousel.goTo(1);
    expect(completed).not.toHaveBeenCalled();
    viewport.dispatchEvent(new Event('scrollend'));
    expect(completed).not.toHaveBeenCalled();
    offset = 0;
    viewport.dispatchEvent(new Event('scrollend'));
    expect(completed).toHaveBeenCalledExactlyOnceWith(1);
    viewport.dispatchEvent(new Event('scrollend'));
    expect(completed).toHaveBeenCalledTimes(1);
  });
  it('preserves pending completion when an animated target is requested again', async () => {
    const { carousel, viewport } = await setup();
    const completed = vi.fn();
    carousel.transitionCompleted.subscribe(completed);
    viewport.scrollBy = vi.fn();
    let offset = 200;
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0 } as DOMRect);
    vi.spyOn(viewport.children[1]!, 'getBoundingClientRect').mockImplementation(
      () => ({ x: offset, y: 0 }) as DOMRect,
    );
    carousel.goTo(1);
    carousel.goTo(1);
    expect(completed).not.toHaveBeenCalled();
    offset = 0;
    viewport.dispatchEvent(new Event('scrollend'));
    expect(completed).toHaveBeenCalledExactlyOnceWith(1);
    carousel.goTo(1);
    viewport.dispatchEvent(new Event('scrollend'));
    expect(completed).toHaveBeenCalledTimes(1);
  });
  it('completes fade only at the active slide opacity boundary', async () => {
    const { fixture, carousel, viewport } = await setup();
    fixture.componentInstance.mode.set('fade');
    await fixture.whenStable();
    const completed = vi.fn();
    carousel.transitionCompleted.subscribe(completed);
    carousel.goTo(1);
    carousel.goTo(1);
    await fixture.whenStable();
    expect(completed).not.toHaveBeenCalled();
    const end = new Event('transitionend', { bubbles: true });
    Object.defineProperty(end, 'propertyName', { value: 'opacity' });
    viewport.children[1]!.dispatchEvent(end);
    expect(completed).toHaveBeenCalledExactlyOnceWith(1);
  });
  it('completes non-animated changes after rendering rather than model mutation', async () => {
    const { fixture, carousel } = await setup();
    const completed = vi.fn();
    carousel.transitionCompleted.subscribe(completed);
    carousel.goTo(1, false);
    expect(completed).not.toHaveBeenCalled();
    await fixture.whenStable();
    expect(completed).toHaveBeenCalledExactlyOnceWith(1);
  });
  it('plays, pauses for focus, resumes explicitly, stops at the edge and cleans up', async () => {
    const { fixture, carousel, viewport } = await setup();
    vi.useFakeTimers();
    try {
      carousel.play();
      vi.advanceTimersByTime(100);
      expect(carousel.current()).toBe(1);
      viewport.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      vi.advanceTimersByTime(300);
      expect(carousel.current()).toBe(1);
      expect(carousel.playing()).toBe(false);
      carousel.play();
      vi.advanceTimersByTime(100);
      expect(carousel.current()).toBe(2);
      expect(carousel.playing()).toBe(false);
      fixture.destroy();
      carousel.play();
      expect(carousel.playing()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
