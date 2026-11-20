import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HY_CAROUSEL, HyCarousel } from './carousel';

@Component({
  imports: [HY_CAROUSEL],

  template: `<hy-carousel [visibleSlides]="visibleSlides()" [pageStep]="pageStep()" [loop]="loop()">
    <hy-slide label="One">One</hy-slide>
    <hy-slide label="Two">Two</hy-slide>
    <hy-slide label="Three">Three</hy-slide>
    <hy-slide label="Four">Four</hy-slide>
    <hy-slide label="Five">Five</hy-slide>
  </hy-carousel>`,
})
class Host {
  readonly visibleSlides = signal(1);
  readonly pageStep = signal(1);
  readonly loop = signal(false);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const debug = fixture.debugElement.query(By.directive(HyCarousel));
  const carousel = debug.componentInstance as HyCarousel;
  const element = debug.nativeElement as HTMLElement;
  const viewport = element.querySelector<HTMLElement>('.viewport')!;
  const next = element.querySelector<HTMLButtonElement>('.nav-next')!;
  return { fixture, carousel, element, viewport, next };
}

describe('HyCarousel audit', () => {
  it('advances by the page step and stops at the final full viewport', async () => {
    const { fixture, carousel, element, next } = await setup();
    fixture.componentInstance.visibleSlides.set(2);
    fixture.componentInstance.pageStep.set(2);
    await fixture.whenStable();
    expect(element.style.getPropertyValue('--hy-carousel-visible')).toBe('2');
    next.click();
    await fixture.whenStable();
    expect(carousel.index()).toBe(2);
    next.click();
    await fixture.whenStable();
    expect(carousel.index()).toBe(3);
    expect(next.disabled).toBe(true);
    expect(element.querySelectorAll('.dots button')).toHaveLength(4);
  });

  it('clamps the model when more slides become visible', async () => {
    const { fixture, carousel } = await setup();
    carousel.goTo(4, false);
    await fixture.whenStable();
    fixture.componentInstance.visibleSlides.set(3);
    await fixture.whenStable();
    expect(carousel.current()).toBe(2);
    expect(carousel.index()).toBe(2);
  });

  it('uses page steps for keyboard navigation and wraps only at a boundary', async () => {
    const { fixture, carousel, viewport } = await setup();
    fixture.componentInstance.visibleSlides.set(2);
    fixture.componentInstance.pageStep.set(2);
    fixture.componentInstance.loop.set(true);
    await fixture.whenStable();
    for (const expected of [2, 3, 0]) {
      viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await fixture.whenStable();
      expect(carousel.index()).toBe(expected);
    }
    viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await fixture.whenStable();
    expect(carousel.index()).toBe(3);
  });

  it('normalizes invalid dimensions and disables navigation when everything fits', async () => {
    const { fixture, carousel, element, next } = await setup();
    fixture.componentInstance.visibleSlides.set(Number.NaN);
    fixture.componentInstance.pageStep.set(-2);
    await fixture.whenStable();
    expect(element.style.getPropertyValue('--hy-carousel-visible')).toBe('1');
    next.click();
    await fixture.whenStable();
    expect(carousel.index()).toBe(1);
    fixture.componentInstance.visibleSlides.set(10);
    await fixture.whenStable();
    expect(carousel.index()).toBe(0);
    expect(next.disabled).toBe(true);
    expect(element.querySelectorAll('.dots button')).toHaveLength(1);
  });
});
