import { DOCUMENT, DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { HY_CONFIG } from '@hyalo/angular/core';
import {
  ɵinjectIsBrowser as injectIsBrowser,
  ɵmatchesMedia as matchesMedia,
} from '@hyalo/angular/core';
import { HyFidelity } from '@hyalo/angular/core';
import type { HyGsap } from '@hyalo/angular/core';

/** One named motion: duration in seconds plus matching GSAP and CSS easings. */
export interface HyMotionPreset {
  readonly duration: number;
  readonly ease: string;
  readonly css: string;
}

/**
 * The shared motion vocabulary. CSS has the same values as `--hy-dur-*` and
 * `--hy-ease-*` tokens.
 *
 * - `settle`: the default for anything that moves into place.
 * - `pop`: a small overshoot. Only for motion the user caused, such as a
 *   toggle they just pressed. Never for things that appear on their own.
 * - `quick`: acknowledgements, like a press or a hover.
 * - `scene`: large, slow movements such as section reveals.
 */
export const MOTION = {
  settle: { duration: 0.44, ease: 'power3.out', css: 'cubic-bezier(0.215, 0.61, 0.355, 1)' },
  pop: { duration: 0.5, ease: 'back.out(1.5)', css: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  quick: { duration: 0.22, ease: 'power2.out', css: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
  scene: { duration: 0.9, ease: 'expo.out', css: 'cubic-bezier(0.16, 1, 0.3, 1)' },
} as const satisfies Record<string, HyMotionPreset>;

/**
 * Motion state for the whole app: whether the user prefers reduced motion,
 * whether effects may run at all, and lazy access to GSAP.
 */
@Injectable({ providedIn: 'root' })
export class HyMotion {
  private readonly config = inject(HY_CONFIG);
  private readonly fidelity = inject(HyFidelity);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = injectIsBrowser();
  private readonly _reduced = signal(false);
  private gsapPromise: Promise<HyGsap | null> | undefined;

  /** True when the OS asks for reduced motion, or the app forced it. */
  readonly reduced = this._reduced.asReadonly();

  /** True when decorative motion (tilt, magnetic, reveal) may run. */
  readonly enabled = computed(() => !this._reduced() && this.fidelity.tier() !== 'low');

  constructor() {
    if (!this.isBrowser || typeof matchMedia !== 'function') return;
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = (): void =>
      this._reduced.set(
        query.matches || this.document.documentElement.getAttribute('data-hy-motion') === 'reduced',
      );
    update();
    query.addEventListener('change', update);
    inject(DestroyRef).onDestroy(() => query.removeEventListener('change', update));
  }

  /**
   * Requests reduced or normal motion without overriding the OS preference, and mirrors
   * the choice to `data-hy-motion` so CSS tokens follow. Pass `null` to go
   * back to the OS setting.
   */
  setReduced(reduced: boolean | null): void {
    const root = this.document.documentElement;
    if (reduced === null) {
      root.removeAttribute('data-hy-motion');
      this._reduced.set(matchesMedia('(prefers-reduced-motion: reduce)'));
      return;
    }
    root.setAttribute('data-hy-motion', reduced ? 'reduced' : 'full');
    this._reduced.set(reduced || matchesMedia('(prefers-reduced-motion: reduce)'));
  }

  /**
   * Loads GSAP once, if the app provided a loader. Resolves to `null` on the
   * server, without a loader, or if loading fails, so callers can fall back
   * to CSS.
   */
  gsap(): Promise<HyGsap | null> {
    const loader = this.config.gsap;
    if (!this.isBrowser || !loader) return Promise.resolve(null);
    this.gsapPromise ??= loader().catch(() => null);
    return this.gsapPromise;
  }
}
