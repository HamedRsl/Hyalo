import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { HyMotion, injectHyVisibility } from '@hyalo/angular/motion';
@Component({
  selector: 'hy-border-beam',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[class.moving]': 'moving()' },
  template: '',
  styleUrl: './border-beam.css',
})
export class HyBorderBeam {
  readonly animated = input(false, { transform: booleanAttribute });
  private readonly motion = inject(HyMotion);
  private readonly visible = injectHyVisibility();
  protected readonly moving = computed(
    () => this.animated() && this.motion.enabled() && this.visible(),
  );
}
