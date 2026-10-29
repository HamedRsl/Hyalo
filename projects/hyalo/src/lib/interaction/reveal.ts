import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { HyMotion } from '../motion/motion';

/** Where a revealed element comes from. */
export type HyRevealFrom = 'up' | 'fade' | 'scale';

/**
 * Fades and lifts an element in when it scrolls into view.
 *
 * ```html
 * @for (item of items; track item.id; let i = $index) {
 *   <article hyReveal [revealDelay]="i * 60">...</article>
 * }
 * ```
 *
 * Content is never hidden by default. The directive only hides an element
 * after hydration, only when it is below the fold, and only when motion is
 * enabled. Elements already on screen are left alone, so server-rendered
 * content does not flash. CSS transitions do the work, so it also runs on the
 * low tier when reduced motion is off.
 *
 * Put it on the glass element itself (`<hy-card hyReveal>`), not on a
 * wrapper around glass. While a wrapper fades, its glass children cannot
 * blur what is behind it, and the blur snaps in when the fade ends.
 */
@Directive({
  selector: '[hyReveal]',
  host: { '[style.--hy-reveal-delay.ms]': 'revealDelay()' },
})
export class HyReveal {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(HyMotion);

  /** Delay in milliseconds, for staggering. */
  readonly revealDelay = input(0, { transform: numberAttribute });
  /** The starting pose. */
  readonly revealFrom = input<HyRevealFrom>('up');
  /** Reveal again each time the element re-enters the viewport. */
  readonly revealRepeat = input(false, { transform: booleanAttribute });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (this.motion.reduced() || typeof IntersectionObserver !== 'function') return;
      let first = true;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          if (first) {
            first = false;
            if (entry.isIntersecting) {
              if (!this.revealRepeat()) observer.disconnect();
              return;
            }
            this.el.setAttribute('data-hy-reveal-from', this.revealFrom());
            this.el.setAttribute('data-hy-reveal', 'hidden');
            return;
          }
          if (entry.isIntersecting) {
            this.el.setAttribute('data-hy-reveal', 'shown');
            if (!this.revealRepeat()) observer.disconnect();
          } else if (this.revealRepeat()) {
            this.el.setAttribute('data-hy-reveal', 'hidden');
          }
        },
        { rootMargin: '0px 0px -8% 0px' },
      );
      observer.observe(this.el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
