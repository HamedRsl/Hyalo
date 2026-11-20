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
  effect,
  contentChildren,
  contentChild,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ɵinjectIsBrowser } from '@hyalo/angular/core';
import { HyMotion } from '@hyalo/angular/motion';
import { HyButton } from '@hyalo/angular/button';
import { HyIcon } from '@hyalo/angular/icon';
export interface HyCarouselBreakpoint {
  readonly minWidth: number;
  readonly visibleSlides: number;
}
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
    '[attr.data-orientation]': 'orientation()',
    '(focusin)': 'pause()',
    '(pointerenter)': 'pauseOnHover() && pause()',
    '[attr.data-scrollbar]': 'scrollbar()',
    '[attr.data-navigation-position]': 'navPosition()',
    '[style.--hy-carousel-visible]': 'visibleCount()',
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
  readonly transitionCompleted = output<number>();
  private pendingCompletion: number | null = null;
  readonly mode = input<HyCarouselMode>('slide');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly pagination = input<HyCarouselPagination>('dots');
  readonly paginationLabel = input('Choose slide');
  readonly loop = input(false, { transform: booleanAttribute });
  readonly scrollbar = input(false, { transform: booleanAttribute });
  /** Number of slides per viewport. Fade mode always shows one. */
  readonly visibleSlides = input(1, { transform: numberAttribute });
  readonly pageStep = input(1, { transform: numberAttribute });
  readonly autoplay = input(false, { transform: booleanAttribute });
  readonly autoplayInterval = input(3000, { transform: numberAttribute });
  readonly pauseOnHover = input(true, { transform: booleanAttribute });
  readonly playing = signal(false);
  private autoplayTimer?: ReturnType<typeof setInterval>;

  /** Focus always stops autoplay; resumption is an explicit user action. */
  play(): void {
    if (!this.browser || this.destroyRef.destroyed || !this.canNext() || this.playing()) return;
    this.playing.set(true);
    const interval = this.autoplayInterval();
    this.autoplayTimer = setInterval(
      () => {
        this.movePage(1);
        if (!this.canNext()) this.pause();
      },
      Number.isFinite(interval) ? Math.max(100, interval) : 3000,
    );
  }
  pause(): void {
    clearInterval(this.autoplayTimer);
    this.playing.set(false);
  }
  readonly navigation = input<HyCarouselNavigationMode>('text');
  readonly navPosition = input<HyCarouselNavigationPosition>('below');
  protected readonly customNavigation = contentChild(HyCarouselNavigation);
  protected readonly navigationContext: HyCarouselNavigationContext = { $implicit: this };
  readonly slides = contentChildren(HySlide);
  readonly responsive = input<readonly HyCarouselBreakpoint[]>([]);
  private readonly containerWidth = signal(0);
  protected readonly visibleCount = computed(() => {
    if (this.mode() === 'fade') return 1;
    const breakpoint = this.responsive()
      .filter(
        (item) =>
          Number.isFinite(item.minWidth) &&
          item.minWidth >= 0 &&
          item.minWidth <= this.containerWidth(),
      )
      .reduce<HyCarouselBreakpoint | undefined>(
        (best, item) => (!best || item.minWidth >= best.minWidth ? item : best),
        undefined,
      );
    return carouselCount(breakpoint?.visibleSlides ?? this.visibleSlides());
  });
  readonly lastIndex = computed(() => Math.max(0, this.slides().length - this.visibleCount()));
  protected readonly positions = computed(() => this.slides().slice(0, this.lastIndex() + 1));
  readonly current = computed(() =>
    Math.max(0, Math.min(this.lastIndex(), Math.trunc(this.index()) || 0)),
  );
  readonly canPrevious = computed(
    () => this.lastIndex() > 0 && (this.loop() || this.current() > 0),
  );
  readonly canNext = computed(
    () => this.lastIndex() > 0 && (this.loop() || this.current() < this.lastIndex()),
  );
  private drag: { x: number; scroll: number; time: number; moved: boolean } | null = null;
  private suppressClick = false;
  private readonly ready = signal(false);
  private syncedIndex = -1;
  private syncedMode: HyCarouselMode | null = null;
  private syncedVisible = 0;
  protected readonly animated = signal(false);
  private viewportWidth = 0;
  private scrollFrame = 0;
  private scrollTarget: number | null = null;
  private settleTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => this.pause());
    effect(() => {
      const autoplay = this.autoplay();
      this.autoplayInterval();
      if (!this.ready()) return;
      untracked(() => {
        this.pause();
        if (autoplay) this.play();
      });
    });
    effect(() => {
      const current = this.current();
      if (this.index() !== current) this.index.set(current);
    });
    afterRenderEffect(() => {
      const current = this.current();
      const mode = this.mode();
      const visible = this.visibleCount();
      if (
        this.ready() &&
        (current !== this.syncedIndex || mode !== this.syncedMode || visible !== this.syncedVisible)
      ) {
        this.syncedIndex = current;
        this.syncedMode = mode;
        this.syncedVisible = visible;
        this.animated.set(false);
        this.scrollToSlide(false);
      }
      if (this.ready() && (!this.animated() || !this.motion.enabled())) this.completeTransition();
    });
    afterNextRender(() => {
      const viewport = this.viewport().nativeElement;
      this.viewportWidth = viewport.clientWidth;
      this.containerWidth.set(viewport.clientWidth);
      const resize =
        typeof ResizeObserver === 'function'
          ? new ResizeObserver(([entry]) => {
              this.viewportWidth = entry?.contentRect.width ?? viewport.clientWidth;
              this.containerWidth.set(this.viewportWidth);
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
    const count = this.lastIndex() + 1;
    const requested = Number.isFinite(index) ? Math.trunc(index) : 0;
    const previous = this.current();
    this.index.set(
      this.loop() && count
        ? ((requested % count) + count) % count
        : Math.max(0, Math.min(count - 1, requested)),
    );
    if (previous !== this.current()) this.pendingCompletion = this.current();
    this.syncedIndex = this.current();
    this.animated.set(smooth);
    this.scrollToSlide(smooth);
  }

  movePage(direction: -1 | 1, smooth = true): void {
    if (!(direction === 1 ? this.canNext() : this.canPrevious())) return;
    const current = this.current();
    const last = this.lastIndex();
    const target = current + direction * carouselCount(this.pageStep());
    const atEdge = direction === 1 ? current === last : current === 0;
    this.goTo(atEdge ? (direction === 1 ? 0 : last) : Math.max(0, Math.min(last, target)), smooth);
  }

  private scrollToSlide(smooth: boolean): void {
    if (!this.browser || this.mode() !== 'slide') return;
    const viewport = this.viewport().nativeElement;
    const slide = viewport.children[this.current()];
    if (!slide) return;
    const delta = this.slideDelta(viewport, slide);
    clearTimeout(this.settleTimer);
    this.scrollTarget =
      smooth && this.motion.enabled() && Math.abs(delta) > 1 ? this.current() : null;
    if (this.scrollTarget !== null)
      this.settleTimer = setTimeout(() => {
        this.scrollToSlide(false);
      }, 800);
    viewport.scrollBy?.({
      ...(this.orientation() === 'vertical' ? { top: delta } : { left: delta }),
      behavior: smooth && this.motion.enabled() ? 'smooth' : 'instant',
    });
  }

  private slideDelta(viewport: HTMLElement, slide: Element): number {
    const rtl = viewport.ownerDocument.defaultView?.getComputedStyle(viewport).direction === 'rtl';
    const frame = viewport.getBoundingClientRect();
    const item = slide.getBoundingClientRect();
    if (this.orientation() === 'vertical') return item.y - frame.y;
    return rtl ? item.right - frame.right : item.x - frame.x;
  }

  protected onScroll(): void {
    if (this.drag || this.scrollTarget !== null || this.mode() !== 'slide' || this.scrollFrame)
      return;
    const viewport = this.viewport().nativeElement;
    this.scrollFrame =
      viewport.ownerDocument.defaultView?.requestAnimationFrame(() => {
        this.scrollFrame = 0;
        if (this.drag || this.scrollTarget !== null || this.mode() !== 'slide') return;
        const vertical = this.orientation() === 'vertical';
        const width =
          (vertical ? viewport.clientHeight : this.viewportWidth || viewport.clientWidth) /
          this.visibleCount();
        if (!width) return;
        const closest = Math.max(
          0,
          Math.min(
            this.lastIndex(),
            Math.round(Math.abs(vertical ? viewport.scrollTop : viewport.scrollLeft) / width),
          ),
        );
        this.syncedIndex = closest;
        this.index.set(closest);
      }) ?? 0;
  }
  protected onScrollEnd(): void {
    if (this.scrollTarget === null && this.pendingCompletion === null) return;
    const viewport = this.viewport().nativeElement;
    const slide = viewport.children[this.scrollTarget ?? this.current()];
    if (slide && Math.abs(this.slideDelta(viewport, slide)) > 1) return;
    this.scrollTarget = null;
    clearTimeout(this.settleTimer);
    this.completeTransition();
  }

  protected onFadeEnd(event: TransitionEvent): void {
    if (
      this.mode() === 'fade' &&
      event.propertyName === 'opacity' &&
      event.target === this.viewport().nativeElement.children[this.current()]
    )
      this.completeTransition();
  }

  private completeTransition(): void {
    if (this.pendingCompletion === null) return;
    const index = this.pendingCompletion;
    this.pendingCompletion = null;
    this.transitionCompleted.emit(index);
  }

  protected onKey(event: KeyboardEvent): void {
    if (event.target !== this.viewport().nativeElement) return;
    const rtl =
      this.viewport().nativeElement.ownerDocument.defaultView?.getComputedStyle(
        this.viewport().nativeElement,
      ).direction === 'rtl';
    if (this.orientation() === 'vertical' && event.key === 'ArrowDown') this.movePage(1, false);
    else if (this.orientation() === 'vertical' && event.key === 'ArrowUp') this.movePage(-1, false);
    else if (this.orientation() === 'vertical' && ['ArrowRight', 'ArrowLeft'].includes(event.key))
      return;
    else if (event.key === 'ArrowRight') this.movePage(rtl ? -1 : 1, false);
    else if (event.key === 'ArrowLeft') this.movePage(rtl ? 1 : -1, false);
    else if (event.key === 'Home') this.goTo(0, false);
    else if (event.key === 'End') this.goTo(this.lastIndex(), false);
    else return;
    event.preventDefault();
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
      x: this.orientation() === 'vertical' ? event.clientY : event.clientX,
      scroll:
        this.orientation() === 'vertical'
          ? this.viewport().nativeElement.scrollTop
          : this.viewport().nativeElement.scrollLeft,
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
    const distance =
      (this.orientation() === 'vertical' ? event.clientY : event.clientX) - this.drag.x;
    if (Math.abs(distance) < 6 && !this.drag.moved) return;
    this.drag.moved = true;
    const viewport = this.viewport().nativeElement;
    viewport.setPointerCapture?.(event.pointerId);
    if (this.mode() === 'slide') {
      if (this.orientation() === 'vertical') viewport.scrollTop = this.drag.scroll - distance;
      else viewport.scrollLeft = this.drag.scroll - distance;
    }
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
    const vertical = this.orientation() === 'vertical';
    const distance =
      ((vertical ? event.clientY : event.clientX) - drag.x) * (!vertical && rtl ? -1 : 1);
    const projected = distance + (distance / Math.max(1, event.timeStamp - drag.time)) * 180;
    const shift = Math.round(
      -projected /
        Math.max(
          1,
          (vertical ? viewport.clientHeight : viewport.clientWidth) / this.visibleCount(),
        ),
    );
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

function carouselCount(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : 1;
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
  protected readonly blocked = computed(() => !this.carousel.canPrevious());
  protected previous(): void {
    this.carousel.movePage(-1);
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
  protected readonly blocked = computed(() => !this.carousel.canNext());
  protected next(): void {
    this.carousel.movePage(1);
  }
}
export const HY_CAROUSEL = [
  HyCarousel,
  HySlide,
  HyCarouselNavigation,
  HyCarouselPrevious,
  HyCarouselNext,
] as const;
