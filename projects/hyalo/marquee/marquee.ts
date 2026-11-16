import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HyMotion } from '@hyalo/angular/motion';
@Directive({ selector: 'ng-template[hyMarqueeItem]' })
export class HyMarqueeItem {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
@Component({
  selector: 'hy-marquee',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-running]': 'running()',
    '[attr.data-motion]': 'motionEnabled()',
    '[style.--hy-marquee-duration]': 'duration()',
    '[attr.data-reverse]': 'reverse()',
  },
  templateUrl: './marquee.html',
  styleUrl: './marquee.css',
})
export class HyMarquee {
  private readonly motion = inject(HyMotion);
  readonly label = input('Partners');
  readonly duration = input('30s');
  readonly reverse = input(false, { transform: booleanAttribute });
  readonly pauseLabel = input('Pause animation');
  readonly playLabel = input('Play animation');
  protected readonly paused = signal(false);
  protected readonly motionEnabled = computed(() => this.motion.enabled());
  protected readonly running = computed(() => this.motion.enabled() && !this.paused());
  protected readonly items = contentChildren(HyMarqueeItem);
}
export const HY_MARQUEE = [HyMarquee, HyMarqueeItem] as const;
