import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HyFidelity, HyMotion } from '@hyalo/angular';
import { HY_CAROUSEL, HyCarousel, type HyCarouselMode } from './carousel';
import { expectNoAxeViolations } from '../src/testing/axe';

@Component({
  imports: [HY_CAROUSEL],
  template: ` <hy-carousel [mode]="mode()" [loop]="loop()" [(index)]="index">
    <hy-slide label="Steel"><a href="#steel">Steel details</a></hy-slide>
    <hy-slide label="Gold"><a href="#gold">Gold details</a></hy-slide>
  </hy-carousel>`,
})
class Host {
  readonly mode = signal<HyCarouselMode>('fade');
  readonly loop = signal(true);
  readonly index = signal(0);
}

describe('HyCarousel modes', () => {
  it('does not publish intermediate scroll positions during a commanded smooth navigation', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.mode.set('slide');
    await fixture.whenStable();
    const carousel = fixture.debugElement.query(By.directive(HyCarousel))
      .componentInstance as HyCarousel;
    const viewport: HTMLElement = fixture.nativeElement.querySelector('.viewport');
    Object.defineProperty(viewport, 'clientWidth', { value: 300 });
    viewport.scrollBy = vi.fn();
    const slides = viewport.querySelectorAll('hy-slide');
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({ x: 0 } as DOMRect);
    vi.spyOn(slides[1]!, 'getBoundingClientRect').mockReturnValue({ x: 300 } as DOMRect);
    carousel.goTo(1);
    await fixture.whenStable();
    viewport.scrollLeft = 20;
    viewport.dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => setTimeout(resolve, 30));
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(1);
    vi.mocked(slides[1]!.getBoundingClientRect).mockReturnValue({ x: 0 } as DOMRect);
    viewport.scrollLeft = 300;
    viewport.dispatchEvent(new Event('scrollend'));
    carousel.goTo(2);
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(0);
    vi.restoreAllMocks();
  });
  it('tracks native RTL scrolling and ignores leftover scroll events in fade mode', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.mode.set('slide');
    await fixture.whenStable();
    const viewport: HTMLElement = fixture.nativeElement.querySelector('.viewport');
    Object.defineProperty(viewport, 'clientWidth', { value: 300 });
    viewport.style.direction = 'rtl';
    viewport.scrollLeft = -300;
    viewport.dispatchEvent(new Event('scroll'));
    await vi.waitFor(() => expect(fixture.componentInstance.index()).toBe(1));
    fixture.componentInstance.mode.set('fade');
    await fixture.whenStable();
    viewport.scrollLeft = 0;
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(1);
  });

  it('supports horizontal touch gestures in fade mode', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const viewport: HTMLElement = fixture.nativeElement.querySelector('.viewport');
    Object.defineProperty(viewport, 'clientWidth', { value: 300 });
    const pointer = (type: string, x: number, time: number): void => {
      const event = new MouseEvent(type, {
        clientX: x,
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperties(event, {
        pointerType: { value: 'touch' },
        pointerId: { value: 1 },
        timeStamp: { value: time },
      });
      viewport.dispatchEvent(event);
    };
    pointer('pointerdown', 200, 0);
    pointer('pointermove', 100, 80);
    pointer('pointerup', 100, 100);
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(1);
  });
  it('keeps inactive fade slides inert and supports looped navigation', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const carousel = fixture.debugElement.query(By.directive(HyCarousel))
      .componentInstance as HyCarousel;
    const slides = fixture.nativeElement.querySelectorAll('hy-slide') as NodeListOf<HTMLElement>;
    expect(slides[1]!.getAttribute('aria-hidden')).toBe('true');
    expect(slides[1]!.hasAttribute('inert')).toBe(true);
    carousel.goTo(1);
    await fixture.whenStable();
    expect(slides[0]!.hasAttribute('inert')).toBe(true);
    expect(slides[1]!.hasAttribute('inert')).toBe(false);
    carousel.goTo(2);
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(0);
    carousel.goTo(-1);
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(1);
    await expectNoAxeViolations(fixture.nativeElement);
    fixture.componentInstance.mode.set('slide');
    await fixture.whenStable();
    expect(slides[0]!.hasAttribute('inert')).toBe(false);
  });

  it('renders named dot controls and disables motion on low fidelity or reduced motion', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const dots = fixture.nativeElement.querySelectorAll(
      '.dots button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(dots[1]!.getAttribute('aria-label')).toBe('Gold');
    dots[1]!.click();
    await fixture.whenStable();
    expect(dots[1]!.getAttribute('aria-current')).toBe('true');
    const host: HTMLElement = fixture.nativeElement.querySelector('hy-carousel');
    TestBed.inject(HyFidelity).setTier('low');
    await fixture.whenStable();
    expect(host.style.getPropertyValue('--hy-carousel-duration')).toBe('0ms');
    TestBed.inject(HyFidelity).setTier('high');
    TestBed.inject(HyMotion).setReduced(true);
    await fixture.whenStable();
    expect(host.style.getPropertyValue('--hy-carousel-duration')).toBe('0ms');
    TestBed.inject(HyMotion).setReduced(null);
  });
});

@Component({
  imports: [HY_CAROUSEL],
  template: ` <hy-carousel navigation="icons" navPosition="inside-bottom" pagination="none">
    <hy-slide label="First">One</hy-slide><hy-slide label="Second">Two</hy-slide>
    <ng-template hyCarouselNavigation
      ><button hyCarouselPrevious>Back</button><button hyCarouselNext>Forward</button></ng-template
    >
  </hy-carousel>`,
})
class CustomHost {}
describe('HyCarousel custom navigation', () => {
  it('renders supplied buttons outside the slide track with automatic boundary states', async () => {
    const fixture = TestBed.createComponent(CustomHost);
    await fixture.whenStable();
    const viewport: HTMLElement = fixture.nativeElement.querySelector('.viewport');
    expect(viewport.children).toHaveLength(2);
    const buttons = fixture.nativeElement.querySelectorAll(
      '.controls button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons[0]!.textContent).toBe('Back');
    expect(buttons[0]!.disabled).toBe(true);
    buttons[1]!.click();
    await fixture.whenStable();
    expect(buttons[0]!.disabled).toBe(false);
    expect(buttons[1]!.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.dots')).toBeNull();
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
