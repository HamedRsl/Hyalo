import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Renderer2,
  computed,
  effect,
  inject,
  input,
  isDevMode,
} from '@angular/core';
import type { HyIconDef, HyIconNode } from './icons';
import { HY_ICONS, HyIconRegistry } from './registry';

const SAFE_ATTRS = new Set([
  'd',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'x1',
  'x2',
  'y1',
  'y2',
  'width',
  'height',
  'points',
  'fill',
  'stroke',
  'stroke-width',
  'opacity',
  'transform',
]);

/** Copies whitelisted geometry attributes onto an SVG child element. */
@Directive({ selector: '[hyIconAttrs]' })
export class HyIconAttrs {
  private readonly el = inject(ElementRef).nativeElement as SVGElement;
  private readonly renderer = inject(Renderer2);
  readonly hyIconAttrs = input.required<Readonly<Record<string, string | number>>>();

  constructor() {
    let applied = new Set<string>();
    effect(() => {
      const next = new Set<string>();
      for (const [name, value] of Object.entries(this.hyIconAttrs())) {
        if (!SAFE_ATTRS.has(name)) continue;
        this.renderer.setAttribute(this.el, name, String(value));
        next.add(name);
      }
      // A swapped icon may not use every attribute the previous one did.
      for (const name of applied) {
        if (!next.has(name)) this.renderer.removeAttribute(this.el, name);
      }
      applied = next;
    });
  }
}

/**
 * An SVG icon from the registry, or passed in directly.
 *
 * ```html
 * <hy-icon name="check" />
 * <hy-icon [icon]="ArrowRight" label="Next" />
 * ```
 *
 * Icons are decorative (`aria-hidden`) unless `label` is set, in which case
 * they get `role="img"` and that label. The size follows the font size.
 */
@Component({
  selector: 'hy-icon',
  imports: [HyIconAttrs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-icon',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[attr.data-mirror-rtl]': 'def()?.mirrorRtl || null',
    '[style.--hy-icon-size]': 'size()',
  },
  templateUrl: './icon.html',
  styleUrl: './icon.css',
})
export class HyIcon {
  private readonly registry = inject(HyIconRegistry);
  private readonly sets = inject(HY_ICONS, { optional: true });

  /** Registered icon name. */
  readonly name = input<string>();
  /** Icon data, used instead of `name`. */
  readonly icon = input<HyIconDef | HyIconNode>();
  /** Accessible name. Leave empty for decorative icons. */
  readonly label = input<string>();
  /** Any CSS length. Defaults to 1.25em. */
  readonly size = input<string>();
  /** Stroke width in viewBox units. */
  readonly strokeWidth = input(1.75);

  protected readonly def = computed<HyIconDef | undefined>(() => {
    const icon = this.icon();
    if (icon) return Array.isArray(icon) ? { node: icon as HyIconNode } : (icon as HyIconDef);
    const name = this.name();
    const found = name ? this.registry.lookup(name, this.sets) : undefined;
    if (name && !found && isDevMode()) {
      console.warn(`[hyalo] Unknown icon "${name}". Register it with provideHyaloIcons().`); // eslint-disable-line no-console
    }
    return found;
  });
}
