import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
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
  type TemplateRef,
  booleanAttribute,
} from '@angular/core';
import { HyMotion } from '@hyalo/angular/motion';
import { injectId, ɵnormalizeMeasurement } from '@hyalo/angular/core';
@Component({
  selector: 'hy-progress',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress.html',
  styleUrl: './progress.css',
  host: {
    role: 'progressbar',
    '[attr.aria-label]': 'label()',
    '[attr.aria-valuemin]': 'reading().min',
    '[attr.aria-valuemax]': 'reading().max',
    '[attr.aria-valuenow]': 'reading().value',
    '[style.inline-size]': 'size() ?? null',
    '[style.block-size]': 'variant() === "circle" ? size() ?? null : null',
    '[style.--hy-progress-thickness]': 'thickness() === undefined ? null : stroke() + "px"',
    '[style.--hy-progress-segment]': '100 / segmentCount() + "%"',
    '[style.--hy-progress-duration]': 'animationDuration() + "ms"',
    '[attr.data-variant]': 'variant()',
    '[class.indeterminate]': 'amount()===null',
    '[class.moving]': 'moving()',
  },
})
export class HyProgress {
  protected readonly segmentMaskId = injectId('progress-segments');
  protected readonly segmentDash = computed(() => {
    const step = 100 / this.segmentCount();
    const gap = Math.min(2, step / 3);
    return `${step - gap} ${gap}`;
  });
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
  readonly min = input(0);
  readonly max = input(100);
  readonly size = input<string>();
  readonly duration = input(1000);
  protected readonly animationDuration = computed(() =>
    Number.isFinite(this.duration()) ? Math.max(100, this.duration()) : 1000,
  );
  readonly thickness = input<number>();
  readonly success = input<number | null>(null);
  readonly segments = input(1);
  readonly showLabel = input(false, { transform: booleanAttribute });
  readonly labelTemplate = input<TemplateRef<HyProgressLabelContext>>();
  protected readonly segmentCount = computed(() =>
    Number.isFinite(this.segments()) ? Math.min(100, Math.max(1, Math.trunc(this.segments()))) : 1,
  );
  protected readonly successAmount = computed(() =>
    this.amount() === null || this.success() === null
      ? 0
      : Math.min(
          this.amount() ?? 0,
          ɵnormalizeMeasurement(this.success(), this.min(), this.max()).fraction * 100,
        ),
  );
  protected readonly labelContext = computed<HyProgressLabelContext>(() => ({
    $implicit: this.reading().value,
    percent: this.amount(),
  }));
  readonly linecap = input<'round' | 'butt' | 'square'>('round');
  protected readonly stroke = computed(() =>
    Number.isFinite(this.thickness()) ? Math.min(20, Math.max(1, this.thickness() ?? 3)) : 3,
  );
  protected readonly radius = computed(() => Math.min(16, 20 - this.stroke() / 2));
  protected readonly reading = computed(() =>
    ɵnormalizeMeasurement(
      this.value() === null ? null : Number.isFinite(this.value()) ? this.value() : this.min(),
      this.min(),
      this.max(),
    ),
  );
  readonly amount = computed(() => (this.value() === null ? null : this.reading().fraction * 100));
  readonly offset = computed(() => 100 - (this.amount() ?? 25));
}
@Component({
  selector: 'hy-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
    '<hy-progress variant="circle" [label]="label()" [thickness]="thickness()" [duration]="duration()" />',
  host: { '[style.inline-size]': 'size()', '[style.block-size]': 'size()' },
  imports: [HyProgress],
  styles:
    ':host{display:inline-flex;inline-size:1.5rem;block-size:1.5rem}hy-progress{inline-size:100%;block-size:100%}',
})
export class HySpinner {
  readonly size = input('1.5rem');
  readonly thickness = input(3);
  readonly duration = input(1000);
  readonly label = input('Loading');
}
export interface HyProgressLabelContext {
  readonly $implicit: number | null;
  readonly percent: number | null;
}
export const HY_PROGRESS = [HyProgress, HySpinner] as const;
