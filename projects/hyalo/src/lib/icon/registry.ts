import { Injectable, InjectionToken, Provider, inject } from '@angular/core';
import { HY_BUILTIN_ICONS, type HyIconDef, type HyIconNode } from './icons';

type HyIconSet = Readonly<Record<string, HyIconDef | HyIconNode>>;

/** Icons added with {@link provideHyaloIcons}. Collected from every provider. */
export const HY_ICONS = new InjectionToken<readonly HyIconSet[]>('HY_ICONS');

/**
 * Registers icons by name. Only the icons you import end up in the bundle.
 *
 * ```ts
 * provideHyaloIcons({ search: Search, 'arrow-end': { node: ArrowRight, mirrorRtl: true } })
 * ```
 *
 * Works in `app.config.ts` and in a route's or component's `providers`.
 * Icons from the nearest provider win over app-wide ones.
 */
export function provideHyaloIcons(
  icons: Readonly<Record<string, HyIconDef | HyIconNode>>,
): Provider {
  return { provide: HY_ICONS, multi: true, useValue: icons };
}

function isDef(value: HyIconDef | HyIconNode): value is HyIconDef {
  return !Array.isArray(value);
}

/** Looks up icons by name: built-ins first, then registered sets in order. */
@Injectable({ providedIn: 'root' })
export class HyIconRegistry {
  private readonly icons = new Map<string, HyIconDef>(Object.entries(HY_BUILTIN_ICONS));
  private readonly sets = inject(HY_ICONS, { optional: true }) ?? [];

  constructor() {
    for (const set of this.sets) {
      for (const [name, icon] of Object.entries(set)) this.register(name, icon);
    }
  }

  /** Adds or replaces an icon at runtime. */
  register(name: string, icon: HyIconDef | HyIconNode): void {
    this.icons.set(name, isDef(icon) ? icon : { node: icon });
  }

  /** Returns the icon, or undefined when the name is unknown. */
  get(name: string): HyIconDef | undefined {
    return this.icons.get(name);
  }

  /**
   * @internal Looks in sets from a route or component injector first. This
   * registry lives in the root injector, so it never sees those itself.
   */
  lookup(name: string, sets: readonly HyIconSet[] | null): HyIconDef | undefined {
    if (sets && sets !== this.sets) {
      for (const set of [...sets].reverse()) {
        const icon = Object.hasOwn(set, name) ? set[name] : undefined;
        if (icon) return isDef(icon) ? icon : { node: icon };
      }
    }
    return this.get(name);
  }
}
