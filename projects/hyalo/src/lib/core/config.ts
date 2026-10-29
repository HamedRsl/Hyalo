import { InjectionToken, Provider, inject } from '@angular/core';
import type { HyFidelityTier, HyMaterial, HySize, HyTone } from './axes';
import type { HyGsapLoader } from './gsap';

/** Global defaults read by every Hyalo component. */
export interface HyConfig {
  /** Default material for glass surfaces. */
  readonly material: HyMaterial;
  /** Default control size. */
  readonly size: HySize;
  /** Default tone for buttons and other coloured controls. */
  readonly tone: HyTone;
  /**
   * Forces a fidelity tier instead of detecting it. Handy for tests,
   * screenshots and low-end kiosks.
   */
  readonly fidelity?: HyFidelityTier;
  /**
   * Loads GSAP on demand. Without it, Hyalo falls back to CSS transitions,
   * so GSAP stays an optional dependency.
   *
   * ```ts
   * provideHyalo({ gsap: () => import('gsap').then((m) => m.gsap) })
   * ```
   */
  readonly gsap?: HyGsapLoader;
}

const DEFAULTS: HyConfig = {
  material: 'frosted',
  size: 'md',
  tone: 'accent',
};

/** Resolved Hyalo configuration. Use {@link provideHyalo} to change it. */
export const HY_CONFIG = new InjectionToken<HyConfig>('HY_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULTS,
});

/**
 * Sets Hyalo defaults. Works in `app.config.ts` and in a component's
 * `providers`, where it merges with whatever the parent injector provides.
 * That makes it easy to switch one section of a page to `solid`, for example.
 */
export function provideHyalo(config: Partial<HyConfig> = {}): Provider {
  return {
    provide: HY_CONFIG,
    useFactory: (): HyConfig => {
      const parent = inject(HY_CONFIG, { skipSelf: true, optional: true }) ?? DEFAULTS;
      return { ...parent, ...config };
    },
  };
}
