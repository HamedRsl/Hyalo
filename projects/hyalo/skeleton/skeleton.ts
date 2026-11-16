import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { HyMotion } from '@hyalo/angular/motion';
export type HySkeletonAnimation = 'shimmer' | 'pulse' | 'none';
/** Decorative placeholder. Put aria-busy on the region being loaded. */
@Component({
  selector: 'hy-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[attr.data-shape]': 'shape()',
    '[attr.data-animate]': 'animate()',
    '[attr.data-animation]': 'animation()',
    '[style.inline-size]': 'width()',
    '[style.block-size]': 'height()',
  },
  template: '',
  styleUrl: './skeleton.css',
})
export class HySkeleton {
  private readonly motion = inject(HyMotion);
  protected readonly animate = computed(() => this.motion.enabled() && this.animation() !== 'none');
  readonly animation = input<HySkeletonAnimation>('shimmer');
  readonly shape = input<'text' | 'circle' | 'rect'>('text');
  readonly width = input('100%');
  readonly height = input('1em');
}
