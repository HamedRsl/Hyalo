import {
  Directive,
  ElementRef,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { MOTION, HyMotion } from '../motion/motion';
import { bindPointer, cssVarSetter } from './pointer';

/**
 * Tilts the element toward the cursor and moves a soft glow under it.
 *
 * ```html
 * <hy-card hyTilt [tiltMax]="8">...</hy-card>
 * ```
 *
 * Runs only with a fine pointer, with motion enabled and above the low
 * fidelity tier. The glow uses `--hy-px`, `--hy-py` and `--hy-glow`, which the
 * glass material already reads.
 */
@Directive({
  selector: '[hyTilt]',
  host: { class: 'hy-tilt' },
})
export class HyTilt {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(HyMotion);

  /** Maximum rotation in degrees. */
  readonly tiltMax = input(6, { transform: numberAttribute });
  /** Whether to show the pointer glow. */
  readonly tiltGlow = input(true, { transform: booleanAttribute });

  constructor() {
    bindPointer(() => {
      const vars = { duration: MOTION.settle.duration, ease: MOTION.settle.ease };
      const rx = cssVarSetter(this.el, '--hy-rx', 'deg', this.motion, vars);
      const ry = cssVarSetter(this.el, '--hy-ry', 'deg', this.motion, vars);
      return {
        enter: () => {
          if (this.tiltGlow()) this.el.style.setProperty('--hy-glow', '0.32');
        },
        move: (event, rect) => {
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          const max = this.tiltMax();
          ry((x - 0.5) * 2 * max);
          rx((0.5 - y) * 2 * max);
          this.el.style.setProperty('--hy-px', `${(x * 100).toFixed(1)}%`);
          this.el.style.setProperty('--hy-py', `${(y * 100).toFixed(1)}%`);
        },
        leave: () => {
          rx(0);
          ry(0);
          this.el.style.setProperty('--hy-glow', '0');
        },
      };
    });
  }
}
