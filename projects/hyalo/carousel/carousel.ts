import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  DestroyRef,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  afterNextRender,
  afterRenderEffect,
  computed,
  contentChildren,
  contentChild,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ɵinjectIsBrowser } from '@hyalo/angular/core';
import { HyMotion } from '@hyalo/angular/motion';
import { HyButton } from '@hyalo/angular/button';
import { HyIcon } from '@hyalo/angular/icon';
export type HyCarouselMode = 'slide' | 'fade';
export type HyCarouselPagination = 'dots' | 'counter' | 'none';
export type HyCarouselNavigationMode = 'text' | 'icons' | 'none';
export type HyCarouselNavigationPosition = 'below' | 'inside-bottom' | 'sides';
export interface HyCarouselNavigationContext {
  readonly $implicit: HyCarousel;
}
@Directive({ selector: 'ng-template[hyCarouselNavigation]' })
export class HyCarouselNavigation {
  readonly template = inject<TemplateRef<HyCarouselNavigationContext>>(TemplateRef);
}

@Component({
  selector: 'hy-slide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    'aria-roledescription': 'slide',
    '[attr.aria-label]': 'label()',
    '[attr.data-mode]': 'carousel?.mode()',
    '[attr.data-active]': 'active()',
    '[attr.inert]': 'inactive() ? "" : null',
    '[attr.aria-hidden]': 'inactive() ? true : null',
  },
  template: '<ng-content />',
  styleUrl: './slide.css',
})
export class HySlide {
  protected readonly carousel = inject(HyCarousel, { optional: true });
  readonly label = input.required<string>();
  protected readonly active = computed(
    () => this.carousel?.slides()[this.carousel.current()] === this,
  );
  protected readonly inactive = computed(() => this.carousel?.mode() === 'fade' && !this.active());
}

/** Scroll-snap carousel. Touch uses browser inertia; mouse dragging projects velocity. */
@Component({
  selector: 'hy-carousel',
  imports: [HyButton, HyIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'region',
    'aria-roledescription': 'carousel',
    '[attr.aria-label]': 'label()',
    '[attr.data-mode]': 'mode()',
    '[attr.data-scrollbar]': 'scrollbar()',
    '[attr.data-navigation-position]': 'navPosition()',
    '[style.--hy-carousel-duration]':
      'animated() && motion.enabled() ? "var(--hy-dur-quick)" : "0ms"',
  },
  templateUrl: './carousel.html',
  styleUrl: './carousel.css',
})
export class HyCarousel {
  protected readonly motion = inject(HyMotion);
  private readonly browser = ɵinjectIsBrowser();
  private readonly destroyRef = inject(DestroyRef);
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  readonly label = input('Gallery');
  readonly previousLabel = input('Previous slide');
  readonly nextLabel = input('Next slide');
  readonly index = model(0);
  readonly mode = input<HyCarouselMode>('slide');
  readonly pagination = input<HyCarouselPagination>('dots');
  readonly paginationLabel = input('Choose slide');
  readonly loop = input(false, { transform: booleanAttribute });
  readonly scrollbar = input(false, { transform: booleanAttribute });
  readonly navigation = input<HyCarouselNavigationMode>('text');
  readonly navPosition = input<HyCarouselNavigationPosition>('below');
  protected readonly customNavigation = contentChild(HyCarouselNavigation);
  protected readonly navigationContext: HyCarouselNavigationContext = { $implicit: this };
  readonly slides = contentChildren(HySlide);
  readonly current = computed(() =>
    Math.max(0, Math.min(this.slides().length - 1, Math.trunc(this.index()) || 0)),
  );
  private drag: { x: number; scroll: number; time: number; moved: boolean } | null = null;
  private suppressClick = false;
  private readonly ready = signal(false);
  private syncedIndex = -1;
  private syncedMode: HyCarouselMode | null = null;
  protected readonly animated = signal(false);
  private viewportWidth = 0;
  private scrollFrame = 0;
  private scrollTarget: number | null = null;
  private settleTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    afterRenderEffect(() => {
      const current = this.current();
      const mode = this.mode();
      if (this.ready() && (current !== this.syncedIndex || mode !== this.syncedMode)) {
        this.syncedIndex = current;
        this.syncedMode = mode;
        this.animated.set(false);
        this.scrollToSlide(false);
      }
    });
    afterNextRender(() => {
      const viewport = this.viewport().nativeElement;
      this.viewportWidth = viewport.clientWidth;
      const resize =
        typeof ResizeObserver === 'function'
          ? new ResizeObserver(([entry]) => {
              this.viewportWidth = entry?.contentRect.width ?? viewport.clientWidth;
              this.scrollToSlide(false);
            })
          : null;
      resize?.observe(viewport);
      const onClick = (event: MouseEvent): void => {
        if (!this.suppressClick) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        this.suppressClick = false;
      };
      viewport.addEventListener('click', onClick, true);
      this.ready.set(true);
      this.goTo(this.current(), false);
      this.destroyRef.onDestroy(() => {
        viewport.removeEventListener('click', onClick, true);
        viewport.ownerDocument.defaultView?.cancelAnimationFrame(this.scrollFrame);
        resize?.disconnect();
        clearTimeout(this.settleTimer);
      });
    });
  }

  goTo(index: number, smooth = true): void {
    const count = this.slides().length;
    const requested = Number.isFinite(index) ? Math.trunc(index) : 0;
    this.index.set(
      this.loop() && count
        ? ((requested % count) + count) % count
        : Math.max(0, Math.min(count - 1, requested)),
    );
    this.syncedIndex = this.current();
    this.animated.set(smooth);
    this.scrollToSlide(smooth);
  }

  private scrollToSlide(smooth: boolean): void {
    if (!this.browser || this.mode() !== 'slide') return;
    const viewport = this.viewport().nativeElement;
    const slide = viewport.children[this.current()];
    if (!slide) return;
    const delta = slide.getBoundingClientRect().x - viewport.getBoundingClientRect().x;
    clearTimeout(this.settleTimer);
    this.scrollTarget =
      smooth && this.motion.enabled() && Math.abs(delta) > 1 ? this.current() : null;
    if (this.scrollTarget !== null)
      this.settleTimer = setTimeout(() => {
        this.scrollToSlide(false);
      }, 800);
    // Both slide and viewport have the same width; x works in both directions.
    viewport.scrollBy?.({
      left: delta,
      behavior: smooth && this.motion.enabled() ? 'smooth' : 'instant',
    });
  }

  protected onScroll(): void {
    if (this.drag || this.scrollTarget !== null || this.mode() !== 'slide' || this.scrollFrame)
      return;
    const viewport = this.viewport().nativeElement;
    this.scrollFrame =
      viewport.ownerDocument.defaultView?.requestAnimationFrame(() => {
        this.scrollFrame = 0;
        if (this.drag || this.scrollTarget !== null || this.mode() !== 'slide') return;
        const width = this.viewportWidth || viewport.clientWidth;
        if (!width) return;
        const closest = Math.max(
          0,
          Math.min(this.slides().length - 1, Math.round(Math.abs(viewport.scrollLeft) / width)),
        );
        this.syncedIndex = closest;
        this.index.set(closest);
      }) ?? 0;
  }
  protected onScrollEnd(): void {
    if (this.scrollTarget === null) return;
    const viewport = this.viewport().nativeElement;
    const slide = viewport.children[this.scrollTarget];
    if (slide && Math.abs(slide.getBoundingClientRect().x - viewport.getBoundingClientRect().x) > 1)
      return;
    this.scrollTarget = null;
    clearTimeout(this.settleTimer);
  }

  protected onKey(event: KeyboardEvent): void {
    if (event.target !== this.viewport().nativeElement) return;
    const rtl =
      this.viewport().nativeElement.ownerDocument.defaultView?.getComputedStyle(
        this.viewport().nativeElement,
      ).direction === 'rtl';
    let next = this.current();
    if (event.key === 'ArrowRight') next += rtl ? -1 : 1;
    else if (event.key === 'ArrowLeft') next += rtl ? 1 : -1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = this.slides().length - 1;
    else return;
    event.preventDefault();
    this.goTo(next, false);
  }

  protected pointerDown(event: PointerEvent): void {
    this.suppressClick = false;
    this.scrollTarget = null;
    clearTimeout(this.settleTimer);
    if (
      (event.pointerType !== 'mouse' && this.mode() !== 'fade') ||
      event.button !== 0 ||
      (event.target as HTMLElement).closest('button, a, input, textarea, select')
    )
      return;
    this.viewport().nativeElement.style.scrollSnapType = 'none';
    this.drag = {
      x: event.clientX,
      scroll: this.viewport().nativeElement.scrollLeft,
      time: event.timeStamp,
      moved: false,
    };
    this.viewport().nativeElement.setPointerCapture?.(event.pointerId);
  }
  protected pointerMove(event: PointerEvent): void {
    if (!this.drag) return;
    if (event.buttons === 0) {
      this.pointerCancel();
      return;
    }
    const distance = event.clientX - this.drag.x;
    if (Math.abs(distance) < 6 && !this.drag.moved) return;
    this.drag.moved = true;
    const viewport = this.viewport().nativeElement;
    viewport.setPointerCapture?.(event.pointerId);
    if (this.mode() === 'slide') viewport.scrollLeft = this.drag.scroll - distance;
    event.preventDefault();
  }
  protected pointerUp(event: PointerEvent): void {
    if (!this.drag) return;
    const drag = this.drag;
    this.drag = null;
    const viewport = this.viewport().nativeElement;
    if (viewport.hasPointerCapture?.(event.pointerId))
      viewport.releasePointerCapture(event.pointerId);
    viewport.style.removeProperty('scroll-snap-type');
    if (!drag.moved) return;
    this.suppressClick = true;
    const rtl = viewport.ownerDocument.defaultView?.getComputedStyle(viewport).direction === 'rtl';
    const distance = (event.clientX - drag.x) * (rtl ? -1 : 1);
    const projected = distance + (distance / Math.max(1, event.timeStamp - drag.time)) * 180;
    const shift = Math.round(-projected / Math.max(1, viewport.clientWidth));
    this.goTo(this.current() + shift);
  }
  protected pointerCancel(): void {
    this.drag = null;
    this.viewport().nativeElement.style.removeProperty('scroll-snap-type');
    this.goTo(this.current(), false);
  }
  protected preventNativeDrag(event: DragEvent): void {
    if (this.drag) event.preventDefault();
  }
}
@Directive({
  selector: 'button[hyCarouselPrevious]',
  host: {
    class: 'nav-prev',
    type: 'button',
    '[disabled]': 'blocked()',
    '[attr.aria-label]': 'carousel.previousLabel()',
    '(click)': 'previous()',
  },
})
export class HyCarouselPrevious {
  protected readonly carousel = inject(HyCarousel);
  protected readonly blocked = computed(
    () =>
      !this.carousel.slides().length || (!this.carousel.loop() && this.carousel.current() === 0),
  );
  protected previous(): void {
    if (!this.blocked()) this.carousel.goTo(this.carousel.current() - 1);
  }
}
@Directive({
  selector: 'button[hyCarouselNext]',
  host: {
    class: 'nav-next',
    type: 'button',
    '[disabled]': 'blocked()',
    '[attr.aria-label]': 'carousel.nextLabel()',
    '(click)': 'next()',
  },
})
export class HyCarouselNext {
  protected readonly carousel = inject(HyCarousel);
  protected readonly blocked = computed(
    () =>
      !this.carousel.slides().length ||
      (!this.carousel.loop() && this.carousel.current() >= this.carousel.slides().length - 1),
  );
  protected next(): void {
    if (!this.blocked()) this.carousel.goTo(this.carousel.current() + 1);
  }
}
export const HY_CAROUSEL = [
  HyCarousel,
  HySlide,
  HyCarouselNavigation,
  HyCarouselPrevious,
  HyCarouselNext,
] as const;
