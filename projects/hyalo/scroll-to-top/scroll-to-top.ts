import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { HyMotion, ɵinjectIsBrowser } from '@hyalo/angular';
@Component({
  selector: 'hy-scroll-to-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-to-top.html',
  styleUrl: './scroll-to-top.css',
})
export class HyScrollToTop {
  private readonly document = inject(DOCUMENT);
  private readonly motion = inject(HyMotion);
  private readonly browser = ɵinjectIsBrowser();
  readonly label = input('Back to top');
  readonly threshold = input(400);
  /** Focus this heading or landmark after scrolling, so keyboard users return too. */
  readonly targetId = input<string | null>(null);
  protected readonly visible = signal(false);
  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const window = this.document.defaultView;
      const update = (): void => this.visible.set((window?.scrollY ?? 0) > this.threshold());
      window?.addEventListener('scroll', update, { passive: true });
      update();
      destroy.onDestroy(() => window?.removeEventListener('scroll', update));
    });
  }
  scroll(): void {
    if (!this.browser) return;
    const target =
      this.document.getElementById(this.targetId() ?? '') ??
      this.document.querySelector<HTMLElement>('h1, main');
    if (target) {
      const previous = target.getAttribute('tabindex');
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener(
        'blur',
        () => {
          if (previous === null) target.removeAttribute('tabindex');
          else target.setAttribute('tabindex', previous);
        },
        { once: true },
      );
    }
    this.document.defaultView?.scrollTo({
      top: 0,
      behavior: this.motion.reduced() ? 'instant' : 'smooth',
    });
  }
}
