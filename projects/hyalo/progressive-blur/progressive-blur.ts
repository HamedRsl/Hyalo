import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { HyFidelity } from '@hyalo/angular/core';
@Component({
  selector: 'hy-progressive-blur',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[attr.data-edge]': 'edge()', '[class.blur]': 'blur()' },
  template: '<i></i><i></i>',
  styles: `
    :host {
      position: absolute;
      inset-inline: 0;
      inset-block-start: 0;
      block-size: var(--hy-edge-height, 3rem);
      pointer-events: none;
      background: linear-gradient(var(--hy-surface-1), transparent);
      z-index: 1;
    }
    :host([data-edge='bottom']) {
      inset-block-start: auto;
      inset-block-end: 0;
      rotate: 180deg;
    }
    i {
      position: absolute;
      inset: 0;
      mask-image: linear-gradient(black, transparent);
    }
    :host(.blur) i:first-child {
      backdrop-filter: blur(4px);
    }
    :host(.blur) i:last-child {
      backdrop-filter: blur(8px);
      mask-image: linear-gradient(black, transparent 65%);
    }
    @media (prefers-reduced-transparency: reduce), (forced-colors: active) {
      i {
        display: none;
      }
    }
  `,
})
export class HyProgressiveBlur {
  readonly edge = input<'top' | 'bottom'>('top');
  private readonly fidelity = inject(HyFidelity);
  protected readonly blur = computed(() => this.fidelity.tier() === 'high');
}
