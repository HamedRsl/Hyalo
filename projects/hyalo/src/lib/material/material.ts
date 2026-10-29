import { Directive, computed, inject, input } from '@angular/core';
import { HY_CONFIG } from '../core/config';
import type { HyMaterial, HyThickness } from '../core/axes';
import { HyFidelity } from '../fidelity/fidelity';

/**
 * Turns any element into a glass surface.
 *
 * ```html
 * <aside hyMaterial="clear">...</aside>
 * <section hyMaterial thickness="thick">...</section>
 * ```
 *
 * The look lives in CSS (`.hy-glass[data-material]`), so effects stay cheap
 * and themeable. On the low fidelity tier every material renders as `solid`,
 * because backdrop blur is the most expensive thing on the page.
 */
@Directive({
  selector: '[hyMaterial]',
  host: {
    class: 'hy-glass',
    '[attr.data-material]': 'resolved()',
    '[attr.data-thickness]': 'thickness() === "regular" ? null : thickness()',
  },
})
export class HyMaterialDirective {
  private readonly config = inject(HY_CONFIG);
  private readonly fidelity = inject(HyFidelity);

  /** The material. An empty attribute uses the configured default. */
  readonly material = input<HyMaterial | '' | undefined>(undefined, { alias: 'hyMaterial' });
  /** How heavy the glass reads. Use `thick` for large surfaces. */
  readonly thickness = input<HyThickness>('regular');

  /** The material that is actually rendered after fidelity is applied. */
  readonly resolved = computed<HyMaterial>(() => {
    if (this.fidelity.tier() === 'low') return 'solid';
    return this.material() || this.config.material;
  });
}
