import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { HyMotion, injectHyVisibility } from '@hyalo/angular/motion';
/** Ambient backdrop. Content stays in a separate, stationary layer. */
@Component({
  selector: 'hy-mesh',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-animate]': 'moving()', '[attr.data-enabled]': 'allowed() && animated()' },
  templateUrl: './mesh.html',
  styleUrl: './mesh.css',
})
export class HyMesh {
  private readonly motion = inject(HyMotion);
  private readonly visible = injectHyVisibility();
  readonly animated = input(false, { transform: booleanAttribute });
  readonly pauseLabel = input('Pause background');
  readonly playLabel = input('Play background');
  readonly disabledLabel = input('Animation disabled');
  protected readonly paused = signal(false);
  protected readonly allowed = computed(() => this.motion.enabled());
  protected readonly moving = computed(
    () => this.animated() && !this.paused() && this.motion.enabled() && this.visible(),
  );
}
