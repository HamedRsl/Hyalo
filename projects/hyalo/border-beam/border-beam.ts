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
  styles: `
    :host {
      display: block;
      position: absolute;
      inset: 0;
      border: 1px solid var(--hy-line-strong);
      border-radius: inherit;
      pointer-events: none;
      overflow: clip;
    }
    :host::before {
      content: '';
      position: absolute;
      inset: -100%;
      background: conic-gradient(from 0deg, transparent 75%, var(--hy-primary), transparent);
      opacity: 0.45;
      animation: hy-beam 8s linear infinite;
      animation-play-state: paused;
      mask-image: radial-gradient(ellipse, transparent 60%, black 62%);
    }
    :host(.moving)::before {
      animation-play-state: running;
    }
    @keyframes hy-beam {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce), (forced-colors: active) {
      :host::before {
        display: none;
      }
    }
  `,
})
export class HyBorderBeam {
  readonly animated = input(false, { transform: booleanAttribute });
  private readonly motion = inject(HyMotion);
  private readonly visible = injectHyVisibility();
  protected readonly moving = computed(
    () => this.animated() && this.motion.enabled() && this.visible(),
  );
}
