import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { HyMotion } from '@hyalo/angular';
@Component({
  selector: 'hy-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress.html',
  styleUrl: './progress.css',
  host: {
    role: 'progressbar',
    '[attr.aria-label]': 'label()',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'amount()',
    '[attr.data-variant]': 'variant()',
    '[class.indeterminate]': 'amount()===null',
    '[class.moving]': 'moving()',
  },
})
export class HyProgress {
  protected readonly motion = inject(HyMotion);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly visible = signal(true);
  private readonly foreground = signal(true);
  protected readonly moving = computed(
    () => this.motion.enabled() && this.visible() && this.foreground(),
  );
  constructor() {
    let observer: IntersectionObserver | undefined;
    const abort = new AbortController();
    afterNextRender(() => {
      this.foreground.set(!this.document.hidden);
      this.document.addEventListener(
        'visibilitychange',
        () => this.foreground.set(!this.document.hidden),
        { signal: abort.signal },
      );
      if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver((entries) =>
          this.visible.set(entries.some((entry) => entry.isIntersecting)),
        );
        observer.observe(this.host.nativeElement);
      }
    });
    inject(DestroyRef).onDestroy(() => {
      observer?.disconnect();
      abort.abort();
    });
  }
  readonly value = input<number | null>(null);
  readonly label = input.required<string>();
  readonly variant = input<'bar' | 'circle'>('bar');
  readonly amount = computed(() =>
    this.value() === null
      ? null
      : Math.min(100, Math.max(0, Number.isFinite(this.value()) ? (this.value() ?? 0) : 0)),
  );
  readonly offset = computed(() => 100 - (this.amount() ?? 25));
}
@Component({
  selector: 'hy-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<hy-progress variant="circle" [label]="label()" />',
  imports: [HyProgress],
  styles:
    ':host{display:inline-flex;inline-size:1.5rem;block-size:1.5rem}hy-progress{inline-size:100%;block-size:100%}',
})
export class HySpinner {
  readonly label = input('Loading');
}
export const HY_PROGRESS = [HyProgress, HySpinner] as const;
