import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HyFidelity, HyMotion } from '@hyalo/angular';
import { HyAspectRatio } from '@hyalo/angular/aspect-ratio';
import { HY_AVATAR } from '@hyalo/angular/avatar';
import { HyBadge } from '@hyalo/angular/badge';
import { HyButtonGroup } from '@hyalo/angular/button-group';
import { HY_CAROUSEL, HyCarousel } from '@hyalo/angular/carousel';
import { HyChapterNav } from '@hyalo/angular/chapter-nav';
import { HyDivider } from '@hyalo/angular/divider';
import { HyHotspot } from '@hyalo/angular/hotspot';
import { HyImageCompare } from '@hyalo/angular/image-compare';
import { HyGallery, HyLightbox } from '@hyalo/angular/lightbox';
import { HyLink } from '@hyalo/angular/link';
import { HY_MARQUEE } from '@hyalo/angular/marquee';
import { HyMesh } from '@hyalo/angular/mesh';
import { HyRefraction, HyRefractionRenderer } from '@hyalo/angular/refraction';
import { HyScrollToTop } from '@hyalo/angular/scroll-to-top';
import { HySkeleton } from '@hyalo/angular/skeleton';
import { HySplitText } from '@hyalo/angular/split-text';
import { HY_STEPPER, HyStepper } from '@hyalo/angular/stepper';
import { HY_TIMELINE } from '@hyalo/angular/timeline';
import { expectNoAxeViolations } from '../src/testing/axe';

@Component({
  imports: [HY_CAROUSEL],
  template: ` <hy-carousel label="Collection" [(index)]="index">
    <hy-slide label="Steel"><a href="#steel">Steel details</a></hy-slide>
    <hy-slide label="Gold">Gold details</hy-slide>
    <hy-slide label="Ceramic">Ceramic details</hy-slide>
  </hy-carousel>`,
})
class CarouselHost {
  readonly index = signal(0);
}

@Component({
  imports: [HY_STEPPER],
  template: ` <hy-stepper [(selected)]="selected" [linear]="linear()">
    <hy-step label="Details" [completed]="completed()"><input aria-label="Name" /></hy-step>
    <hy-step label="Review" [disabled]="disabled()"><p>Review details</p></hy-step>
  </hy-stepper>`,
})
class StepperHost {
  readonly selected = signal(0);
  readonly completed = signal(false);
  readonly disabled = signal(false);
  readonly linear = signal(true);
}

describe('phase 2 navigation', () => {
  it('projects mouse release velocity and restores snapping on cancellation', async () => {
    const fixture = TestBed.createComponent(CarouselHost);
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
        pointerType: { value: 'mouse' },
        pointerId: { value: 1 },
        timeStamp: { value: time },
      });
      viewport.dispatchEvent(event);
    };
    pointer('pointerdown', 200, 0);
    pointer('pointermove', 100, 80);
    expect(viewport.style.scrollSnapType).toBe('none');
    expect(viewport.scrollLeft).toBe(100);
    pointer('pointerup', 100, 100);
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(1);
    expect(viewport.style.scrollSnapType).toBe('');
    pointer('pointerdown', 200, 200);
    pointer('pointermove', 150, 250);
    viewport.dispatchEvent(new Event('pointercancel'));
    await fixture.whenStable();
    expect(viewport.style.scrollSnapType).toBe('');
    expect(fixture.componentInstance.index()).toBe(1);
  });

  it('clamps carousel navigation, publishes changes and ignores keys from interactive children', async () => {
    const fixture = TestBed.createComponent(CarouselHost);
    await fixture.whenStable();
    const carousel = fixture.debugElement.query(By.directive(HyCarousel))
      .componentInstance as HyCarousel;
    carousel.goTo(99, false);
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(2);
    const viewport: HTMLElement = fixture.nativeElement.querySelector('.viewport');
    viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(0);
    const link: HTMLElement = fixture.nativeElement.querySelector('a');
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(0);
    viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(1);
    await expectNoAxeViolations(fixture.nativeElement);
  });

  it('scrolls to externally selected slides and reverses arrow navigation in RTL', async () => {
    const fixture = TestBed.createComponent(CarouselHost);
    await fixture.whenStable();
    const viewport: HTMLElement = fixture.nativeElement.querySelector('.viewport');
    const scroll = vi.fn();
    viewport.scrollBy = scroll;
    fixture.componentInstance.index.set(2);
    await fixture.whenStable();
    expect(scroll).toHaveBeenCalled();
    viewport.style.direction = 'rtl';
    viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(1);
    viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(2);
  });

  it('gates incomplete steps and preserves form DOM when moving back', async () => {
    const fixture = TestBed.createComponent(StepperHost);
    await fixture.whenStable();
    const stepper = fixture.debugElement.query(By.directive(HyStepper))
      .componentInstance as HyStepper;
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'Sara';
    stepper.next();
    await fixture.whenStable();
    expect(stepper.activeIndex()).toBe(0);
    fixture.componentInstance.completed.set(true);
    await fixture.whenStable();
    stepper.next();
    await fixture.whenStable();
    expect(stepper.activeIndex()).toBe(1);
    expect(input.closest('[role="group"]')?.hasAttribute('inert')).toBe(true);
    stepper.previous();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('input')).toBe(input);
    expect(input.value).toBe('Sara');
    expect(input.closest('[role="group"]')?.hasAttribute('inert')).toBe(false);
    await expectNoAxeViolations(fixture.nativeElement);
  });

  it('handles disabled and invalid step requests and moves focus with the keyboard', async () => {
    const fixture = TestBed.createComponent(StepperHost);
    await fixture.whenStable();
    const stepper = fixture.debugElement.query(By.directive(HyStepper))
      .componentInstance as HyStepper;
    fixture.componentInstance.linear.set(false);
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll(
      'nav button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(buttons[1]);
    buttons[1]!.click();
    await fixture.whenStable();
    expect(stepper.activeIndex()).toBe(1);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    expect(stepper.activeIndex()).toBe(0);
    fixture.componentInstance.selected.set(-20);
    await fixture.whenStable();
    expect(stepper.activeIndex()).toBe(0);
  });
});

@Component({
  imports: [HyImageCompare, HY_AVATAR, HyBadge, HyHotspot, HyAspectRatio],
  template: ` <hy-image-compare
      before="before.svg"
      after="after.svg"
      beforeAlt="Before restoration"
      afterAlt="After restoration"
      [(value)]="value"
    />
    <hy-avatar name="سارا احمدی" [src]="src()" />
    <hy-badge removable removeLabel="Remove steel" (removed)="removed.set(true)">Steel</hy-badge>
    <hy-hotspot
      label="Dial"
      [position]="{ x: 50, y: 50, visible: visible() }"
      (activated)="activated.set(true)"
    />
    <hy-aspect-ratio [ratio]="ratio()">Media</hy-aspect-ratio>`,
})
class ControlsHost {
  readonly value = signal(50);
  readonly src = signal('portrait.jpg');
  readonly removed = signal(false);
  readonly visible = signal(true);
  readonly activated = signal(false);
  readonly ratio = signal(-1);
}

describe('phase 2 display controls', () => {
  it('labels and clamps image comparison and emits native range changes', async () => {
    const fixture = TestBed.createComponent(ControlsHost);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type=range]');
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);
    input.value = '75';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(75);
    expect(fixture.nativeElement.querySelector('.before').style.clipPath).toBe('inset(0 25% 0 0)');
    fixture.componentInstance.value.set(200);
    await fixture.whenStable();
    expect(input.value).toBe('100');
  });
  it('recovers failed avatars and retries new image sources with Persian initials', async () => {
    const fixture = TestBed.createComponent(ControlsHost);
    await fixture.whenStable();
    const avatar: HTMLElement = fixture.nativeElement.querySelector('hy-avatar');
    avatar.querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(avatar.textContent?.trim()).toBe('سا');
    fixture.componentInstance.src.set('new-portrait.jpg');
    await fixture.whenStable();
    expect(avatar.querySelector('img')?.getAttribute('src')).toBe('new-portrait.jpg');
  });
  it('emits chip removal and hotspot activation, hides occluded points and validates aspect ratios', async () => {
    const fixture = TestBed.createComponent(ControlsHost);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('hy-badge button').click();
    fixture.nativeElement.querySelector('hy-hotspot button').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.removed()).toBe(true);
    expect(fixture.componentInstance.activated()).toBe(true);
    fixture.componentInstance.visible.set(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('hy-hotspot').hidden).toBe(true);
    expect(
      parseFloat(fixture.nativeElement.querySelector('hy-aspect-ratio').style.aspectRatio),
    ).toBeCloseTo(16 / 9);
    await expectNoAxeViolations(fixture.nativeElement);
  });
});

@Component({
  imports: [
    HY_MARQUEE,
    HyMesh,
    HySkeleton,
    HyRefraction,
    HySplitText,
    HY_TIMELINE,
    HyChapterNav,
    HyButtonGroup,
    HyLink,
    HyDivider,
    HyScrollToTop,
  ],
  template: ` <h1>Showcase</h1>
    <hy-marquee
      ><ng-template hyMarqueeItem><a href="#chapter">Partner</a></ng-template
      ><ng-template hyMarqueeItem>Studio</ng-template></hy-marquee
    >
    <hy-mesh animated>Ambient content</hy-mesh><hy-skeleton />
    <hy-refraction src="scene.svg">Refracted content</hy-refraction>
    <h2><hy-split-text text="طراحی برای همه" /></h2>
    <hy-timeline
      ><hy-timeline-item heading="Founded" date="2026" dateTime="2026"
        >Our story</hy-timeline-item
      ></hy-timeline
    >
    <hy-chapter-nav [chapters]="[{ id: 'chapter', label: 'Our story' }]" />
    <section id="chapter"><h2>Our story</h2></section>
    <hy-button-group label="Actions"><button type="button">Save</button></hy-button-group>
    <a hyLink href="#chapter">Story</a><hy-divider /><hy-scroll-to-top />`,
})
class EffectsHost {}

describe('phase 2 effects and fallbacks', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('remeasures changed headline text without exposing duplicate accessible text', async () => {
    const fixture = TestBed.createComponent(HySplitText);
    fixture.componentRef.setInput('text', 'Original headline');
    await fixture.whenStable();
    fixture.componentRef.setInput('text', 'A different headline');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.accessible').textContent).toBe(
      'A different headline',
    );
    expect(fixture.nativeElement.querySelector('.visual').textContent.trim()).toBe(
      'A different headline',
    );
  });

  it('returns focus to the page heading and restores its temporary tabindex', async () => {
    const fixture = TestBed.createComponent(EffectsHost);
    await fixture.whenStable();
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const control = fixture.debugElement.query(By.directive(HyScrollToTop))
      .componentInstance as HyScrollToTop;
    control.scroll();
    const heading: HTMLElement = fixture.nativeElement.querySelector('h1');
    expect(document.activeElement).toBe(heading);
    expect(heading.getAttribute('tabindex')).toBe('-1');
    expect(scroll).toHaveBeenCalledWith({
      top: 0,
      behavior: TestBed.inject(HyMotion).reduced() ? 'instant' : 'smooth',
    });
    heading.blur();
    expect(heading.hasAttribute('tabindex')).toBe(false);
  });
  it('renders repeated marquee templates with an inert duplicate and a pause control', async () => {
    const fixture = TestBed.createComponent(EffectsHost);
    await fixture.whenStable();
    const marquee: HTMLElement = fixture.nativeElement.querySelector('hy-marquee');
    expect(marquee.querySelectorAll('a')).toHaveLength(2);
    expect(marquee.querySelector('.copy')?.hasAttribute('inert')).toBe(true);
    expect(marquee.querySelector('.copy')?.getAttribute('aria-hidden')).toBe('true');
    marquee.querySelector('button')!.click();
    await fixture.whenStable();
    expect(marquee.dataset['running']).toBe('false');
  });
  it('stops decorative effects for low fidelity and reduced motion', async () => {
    const fixture = TestBed.createComponent(EffectsHost);
    await fixture.whenStable();
    TestBed.inject(HyFidelity).setTier('low');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('hy-skeleton').dataset['animate']).toBe('false');
    expect(fixture.nativeElement.querySelector('hy-mesh').dataset['animate']).toBe('false');
    expect(fixture.nativeElement.querySelector('hy-marquee').dataset['motion']).toBe('false');
    expect(fixture.nativeElement.querySelector('hy-refraction').dataset['material']).toBe('solid');
    TestBed.inject(HyFidelity).setTier('high');
    TestBed.inject(HyMotion).setReduced(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('hy-mesh').dataset['animate']).toBe('false');
    expect(fixture.nativeElement.querySelector('hy-split-text').dataset['shown']).toBe('true');
    TestBed.inject(HyMotion).setReduced(null);
  });
  it('registers refraction only on high tier and releases it when fidelity changes', async () => {
    const remove = vi.fn();
    const register = vi.fn().mockResolvedValue(remove);
    TestBed.overrideProvider(HyRefractionRenderer, { useValue: { register, draw: vi.fn() } });
    const fixture = TestBed.createComponent(EffectsHost);
    await fixture.whenStable();
    TestBed.inject(HyFidelity).setTier('medium');
    await fixture.whenStable();
    register.mockClear();
    remove.mockClear();
    TestBed.inject(HyFidelity).setTier('high');
    await fixture.whenStable();
    expect(register).toHaveBeenCalledOnce();
    TestBed.inject(HyFidelity).setTier('low');
    await fixture.whenStable();
    expect(remove).toHaveBeenCalledOnce();
  });
  it('has no axe violations and preserves the accessible headline', async () => {
    const fixture = TestBed.createComponent(EffectsHost);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('hy-split-text .accessible').textContent).toBe(
      'طراحی برای همه',
    );
    await expectNoAxeViolations(fixture.nativeElement);
  });
});

@Component({ imports: [HyGallery], template: '<hy-gallery [images]="images" />' })
class GalleryHost {
  readonly images = [
    { src: 'steel.svg', alt: 'Steel watch', caption: 'Steel edition' },
    { src: 'gold.svg', alt: 'Gold watch' },
  ];
}

describe('HyLightbox', () => {
  it('ignores an empty collection', () => {
    expect(TestBed.inject(HyLightbox).open([])).toBeNull();
  });
  it('opens the chosen thumbnail, navigates and closes through the CDK dialog', async () => {
    const fixture = TestBed.createComponent(GalleryHost);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    const dialog = document.querySelector<HTMLElement>('[role=dialog]')!;
    expect(dialog).toBeTruthy();
    expect(dialog.querySelector('img')?.alt).toBe('Steel watch');
    const view = dialog.querySelector('hy-lightbox-view')!;
    view.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(dialog.querySelector('img')?.alt).toBe('Gold watch');
    await expectNoAxeViolations(dialog);
    (dialog.querySelector('button') as HTMLButtonElement).click();
    await new Promise((resolve) => setTimeout(resolve, 600));
    await fixture.whenStable();
    expect(document.querySelector('[role=dialog]')).toBeNull();
  });
});
