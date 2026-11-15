import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { HyMotion } from '@hyalo/angular/motion';
/** Splits measured lines after hydration. The accessible text is read once. */
@Component({
  selector: 'hy-split-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-shown]': 'shown()' },
  templateUrl: './split-text.html',
  styleUrl: './split-text.css',
})
export class HySplitText {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(HyMotion);
  private readonly destroyRef = inject(DestroyRef);
  private readonly measure = viewChild.required<ElementRef<HTMLElement>>('measure');
  readonly text = input.required<string>();
  protected readonly lines = signal<readonly string[]>([]);
  private readonly entered = signal(false);
  private readonly ready = signal(false);
  private remeasure: (() => void) | undefined;
  protected readonly shown = computed(() => this.entered() || !this.motion.enabled());
  protected readonly words = computed(() => this.text().split(/(\s+)/u));
  constructor() {
    afterRenderEffect(() => {
      this.text();
      if (this.ready()) this.remeasure?.();
    });
    afterNextRender(() => {
      let alive = true;
      const split = (): void => {
        const lines: string[] = [];
        let top: number | undefined;
        for (const child of Array.from(this.measure().nativeElement.children)) {
          const y = child.getBoundingClientRect().top;
          if (top === undefined || Math.abs(y - top) > 2) {
            lines.push(child.textContent ?? '');
            top = y;
          } else lines[lines.length - 1] += child.textContent ?? '';
        }
        this.lines.set(lines);
      };
      const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(split) : null;
      this.remeasure = split;
      resize?.observe(this.el);
      void this.el.ownerDocument.fonts?.ready.then(() => {
        if (alive) split();
      });
      split();
      this.ready.set(true);
      const observer =
        typeof IntersectionObserver === 'function'
          ? new IntersectionObserver(([entry]) => {
              if (entry?.isIntersecting) {
                this.entered.set(true);
                observer?.disconnect();
              }
            })
          : null;
      if (observer) observer.observe(this.el);
      else this.entered.set(true);
      this.destroyRef.onDestroy(() => {
        alive = false;
        resize?.disconnect();
        observer?.disconnect();
      });
    });
  }
}
