import {
  numberAttribute,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  input,
} from '@angular/core';
import { HyMotion, MOTION } from './runtime/motion';
import { injectHyVisibility } from './visibility';

/** The caller owns the state change and focus; this directive only animates its own host bounds. */
@Directive({ selector: '[hyFlip]', exportAs: 'hyFlip' })
export class HyFlip {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(HyMotion);
  private readonly injector = inject(Injector);
  private readonly destroy = inject(DestroyRef);
  private animation?: Animation;
  private generation = 0;
  constructor() {
    effect(() => {
      if (!this.motion.enabled()) this.animation?.cancel();
    });
    this.destroy.onDestroy(() => {
      this.generation++;
      this.animation?.cancel();
    });
  }
  run(change: () => void): void {
    const generation = ++this.generation;
    this.animation?.cancel();
    const before = this.host.getBoundingClientRect();
    change();
    if (!this.motion.enabled() || typeof this.host.animate !== 'function') return;
    afterNextRender(
      () => {
        if (this.destroy.destroyed || generation !== this.generation || !this.motion.enabled())
          return;
        const after = this.host.getBoundingClientRect();
        if (!after.width || !after.height) return;
        this.animation = this.host.animate(
          [
            {
              transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})`,
              transformOrigin: 'top left',
            },
            { transform: 'none', transformOrigin: 'top left' },
          ],
          { duration: MOTION.quick.duration * 1000, easing: MOTION.settle.css, composite: 'add' },
        );
      },
      { injector: this.injector },
    );
  }
}

@Directive({ selector: '[hyStagger]' })
export class HyStagger {
  readonly hyStagger = input(50, { transform: (value: unknown) => numberAttribute(value, 50) });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly visible = injectHyVisibility();
  private readonly motion = inject(HyMotion);
  private readonly seen = new WeakSet<Element>();
  private readonly animations = new Set<Animation>();
  constructor() {
    const destroy = inject(DestroyRef);
    const animate = (): void => {
      let index = 0;
      for (const child of Array.from(this.host.children)) {
        if (this.seen.has(child)) continue;
        this.seen.add(child);
        if (!this.motion.enabled() || typeof child.animate !== 'function') continue;
        const animation = child.animate(
          [
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'none' },
          ],
          {
            duration: MOTION.quick.duration * 1000,
            delay: Math.min(300, index++ * Math.max(0, Math.min(80, this.hyStagger()))),
            easing: MOTION.settle.css,
            fill: 'backwards',
            composite: 'add',
          },
        );
        this.animations.add(animation);
        void animation.finished.then(
          () => this.animations.delete(animation),
          () => this.animations.delete(animation),
        );
      }
    };
    effect(() => {
      if (!this.motion.enabled() || !this.visible()) {
        this.animations.forEach((a) => a.cancel());
        this.animations.clear();
      }
      if (this.visible()) animate();
    });
    afterNextRender(() => {
      const observer = new MutationObserver(() => {
        if (this.visible()) animate();
      });
      observer.observe(this.host, { childList: true });
      destroy.onDestroy(() => observer.disconnect());
    });
    destroy.onDestroy(() => this.animations.forEach((a) => a.cancel()));
  }
}
