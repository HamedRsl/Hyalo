import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { HyFidelity } from '@hyalo/angular/core';
@Component({
  selector: 'hy-progressive-blur',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[attr.data-edge]': 'edge()', '[class.blur]': 'blur()' },
  template: '<i></i><i></i>',
  styleUrl: './progressive-blur.css',
})
export class HyProgressiveBlur {
  readonly edge = input<'top' | 'bottom'>('top');
  private readonly fidelity = inject(HyFidelity);
  protected readonly blur = computed(() => this.fidelity.tier() === 'high');
}
