import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';
import { HyMotion } from '../motion/motion';

/**
 * A soft light ripple from the press point. Purely decorative: it is
 * skipped with reduced motion and never affects layout.
 */
@Directive({
  selector: '[hyRipple]',
  host: { class: 'hy-ripple-host' },
})
export class HyRipple {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(HyMotion);

  /** Turns the ripple off without removing the directive. */
  readonly rippleDisabled = input(false, { transform: booleanAttribute });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const down = (event: PointerEvent): void => {
        if (this.rippleDisabled() || this.motion.reduced() || event.button !== 0) return;
        const rect = this.el.getBoundingClientRect();
        const size = Math.hypot(rect.width, rect.height) * 2;
        const wave = this.el.ownerDocument.createElement('span');
        wave.className = 'hy-ripple';
        wave.setAttribute('aria-hidden', 'true');
        wave.style.setProperty('--hy-ripple-size', `${size}px`);
        wave.style.setProperty('--hy-ripple-x', `${event.clientX - rect.left}px`);
        wave.style.setProperty('--hy-ripple-y', `${event.clientY - rect.top}px`);
        wave.addEventListener('animationend', () => wave.remove(), { once: true });
        this.el.appendChild(wave);
      };
      this.el.addEventListener('pointerdown', down, { passive: true });
      destroyRef.onDestroy(() => this.el.removeEventListener('pointerdown', down));
    });
  }
}
