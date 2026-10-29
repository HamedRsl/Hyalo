import { Directive, ElementRef, inject, input, numberAttribute } from '@angular/core';
import { MOTION, HyMotion } from '../motion/motion';
import { bindPointer, cssVarSetter } from './pointer';

/**
 * Pulls the element a little toward the cursor while it hovers.
 *
 * Uses the `translate` property, so it never fights with a `transform` the
 * element already has.
 */
@Directive({
  selector: '[hyMagnetic]',
  host: { class: 'hy-magnetic' },
})
export class HyMagnetic {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(HyMotion);

  /** How far the element follows the cursor, as a share of the distance. */
  readonly magneticStrength = input(0.3, { transform: numberAttribute });
  /** Upper limit for the offset in pixels. */
  readonly magneticMax = input(10, { transform: numberAttribute });

  constructor() {
    bindPointer(() => {
      const vars = { duration: MOTION.settle.duration, ease: MOTION.settle.ease };
      const mx = cssVarSetter(this.el, '--hy-mx', 'px', this.motion, vars);
      const my = cssVarSetter(this.el, '--hy-my', 'px', this.motion, vars);
      const clamp = (v: number): number =>
        Math.max(-this.magneticMax(), Math.min(this.magneticMax(), v));
      return {
        move: (event, rect) => {
          const strength = this.magneticStrength();
          mx(clamp((event.clientX - rect.left - rect.width / 2) * strength));
          my(clamp((event.clientY - rect.top - rect.height / 2) * strength));
        },
        leave: () => {
          mx(0);
          my(0);
        },
      };
    });
  }
}
