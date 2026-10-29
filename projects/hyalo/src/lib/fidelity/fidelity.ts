import { DOCUMENT, Injectable, afterNextRender, effect, inject, signal } from '@angular/core';
import { HY_CONFIG } from '../core/config';
import type { HyFidelityTier } from '../core/axes';
import { injectIsBrowser, matchesMedia } from '../core/platform';

export type { HyFidelityTier };

interface NavigatorHints {
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
  readonly connection?: { readonly saveData?: boolean };
}

/**
 * Picks a tier from what the browser reports. Exported for tests and for
 * apps that want to run the same check themselves.
 */
export function detectFidelity(nav: NavigatorHints, reducedMotion: boolean): HyFidelityTier {
  if (reducedMotion || nav.connection?.saveData) return 'low';
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  if (memory <= 2 || cores <= 2) return 'low';
  if (memory <= 4 || cores <= 4 || matchesMedia('(pointer: coarse)')) return 'medium';
  return 'high';
}

/**
 * Holds the current fidelity tier. Every effect in Hyalo reads it.
 *
 * The server and the first client render always use `medium`, so hydration
 * sees the same markup. The real tier is detected right after the first
 * render. The tier is also written to `data-hy-fidelity` on `<html>` for
 * CSS that needs it.
 */
@Injectable({ providedIn: 'root' })
export class HyFidelity {
  private readonly config = inject(HY_CONFIG);
  private readonly document = inject(DOCUMENT);
  private readonly _tier = signal<HyFidelityTier>(this.config.fidelity ?? 'medium');
  private overridden = !!this.config.fidelity;

  /** The active tier. */
  readonly tier = this._tier.asReadonly();

  constructor() {
    if (!injectIsBrowser()) return;
    afterNextRender(() => {
      if (!this.overridden) {
        this._tier.set(
          detectFidelity(
            navigator as NavigatorHints,
            matchesMedia('(prefers-reduced-motion: reduce)'),
          ),
        );
      }
    });
    effect(() => this.document.documentElement.setAttribute('data-hy-fidelity', this._tier()));
  }

  /** Overrides the detected tier, for example from a settings toggle. */
  setTier(tier: HyFidelityTier): void {
    this.overridden = true;
    this._tier.set(tier);
  }
}
