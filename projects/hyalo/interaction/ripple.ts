import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';
import { HyMotion } from '@hyalo/angular/motion';

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

  readonly rippleRadius = input<number | null>(null);
  readonly rippleDuration = input<number | null>(null);
  readonly rippleCentered = input(false, { transform: booleanAttribute });
  private readonly waves = new Set<HTMLElement>();
  private disposed = false;

  /** Launch a wave at host-relative coordinates, or at the center when omitted. */
  launch(x?: number, y?: number): HTMLElement | null {
    if (this.disposed || this.rippleDisabled() || this.motion.reduced()) return null;
    const rect = this.el.getBoundingClientRect();
    const radius = this.rippleRadius();
    const size =
      radius !== null && Number.isFinite(radius) && radius > 0
        ? radius * 2
        : Math.hypot(rect.width, rect.height) * 2;
    const wave = this.el.ownerDocument.createElement('span');
    wave.className = 'hy-ripple';
    wave.setAttribute('aria-hidden', 'true');
    wave.style.setProperty('--hy-ripple-size', `${size}px`);
    wave.style.setProperty(
      '--hy-ripple-x',
      `${this.rippleCentered() || x === undefined ? rect.width / 2 : x}px`,
    );
    wave.style.setProperty(
      '--hy-ripple-y',
      `${this.rippleCentered() || y === undefined ? rect.height / 2 : y}px`,
    );
    const duration = this.rippleDuration();
    if (duration !== null && Number.isFinite(duration) && duration >= 0)
      wave.style.animationDuration = `${duration}ms`;
    wave.addEventListener(
      'animationend',
      () => {
        wave.remove();
        this.waves.delete(wave);
      },
      { once: true },
    );
    this.waves.add(wave);
    this.el.appendChild(wave);
    return wave;
  }

  clear(): void {
    for (const wave of this.waves) wave.remove();
    this.waves.clear();
  }

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      this.disposed = true;
      this.clear();
    });
    afterNextRender(() => {
      const down = (event: PointerEvent): void => {
        if (event.button !== 0) return;
        const rect = this.el.getBoundingClientRect();
        this.launch(event.clientX - rect.left, event.clientY - rect.top);
      };
      this.el.addEventListener('pointerdown', down, { passive: true });
      destroyRef.onDestroy(() => this.el.removeEventListener('pointerdown', down));
    });
  }
}
