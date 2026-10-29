import { Directionality } from '@angular/cdk/bidi';
import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { HyFidelity, HyMotion, type HyFidelityTier } from '@hyalo/angular';

export type ThemeChoice = 'system' | 'light' | 'dark';
export type DirChoice = 'ltr' | 'rtl';
export type MotionChoice = 'system' | 'full' | 'reduced';

/**
 * Display settings for trying the kit: theme, direction, motion and
 * fidelity. Writes them to <html> so every component, overlays included,
 * picks them up.
 */
@Injectable({ providedIn: 'root' })
export class DocsSettings {
  private readonly document = inject(DOCUMENT);
  private readonly motion = inject(HyMotion);
  private readonly fidelity = inject(HyFidelity);
  private readonly dir = inject(Directionality);

  readonly theme = signal<ThemeChoice>('system');
  readonly direction = signal<DirChoice>('ltr');
  readonly motionChoice = signal<MotionChoice>('system');

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      const theme = this.theme();
      if (theme === 'system') root.removeAttribute('data-hy-theme');
      else root.setAttribute('data-hy-theme', theme);
    });
    effect(() => {
      const dir = this.direction();
      const root = this.document.documentElement;
      root.setAttribute('dir', dir);
      root.setAttribute('lang', dir === 'rtl' ? 'fa' : 'en');
      this.dir.valueSignal.set(dir);
    });
    effect(() => {
      const choice = this.motionChoice();
      this.motion.setReduced(choice === 'system' ? null : choice === 'reduced');
    });
  }

  readonly tier = this.fidelity.tier;

  setTier(tier: HyFidelityTier): void {
    this.fidelity.setTier(tier);
  }
}
