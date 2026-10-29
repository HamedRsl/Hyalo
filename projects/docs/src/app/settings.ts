import { Directionality } from '@angular/cdk/bidi';
import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  HyFidelity,
  HyMotion,
  HyPalette,
  type HyFidelityTier,
  type HyPaletteName,
} from '@hyalo/angular';

export type ThemeChoice = 'system' | 'light' | 'dark';
export type DirChoice = 'ltr' | 'rtl';
export type MotionChoice = 'system' | 'full' | 'reduced';

/** The key the pre-paint script in index.html reads. Keep the two in sync. */
const PALETTE_KEY = 'hy-palette';

/**
 * Display settings for trying the kit: theme, palette, direction, motion
 * and fidelity. Writes them to <html> so every component, overlays
 * included, picks them up. The palette is also remembered across visits.
 */
@Injectable({ providedIn: 'root' })
export class DocsSettings {
  private readonly document = inject(DOCUMENT);
  private readonly motion = inject(HyMotion);
  private readonly fidelity = inject(HyFidelity);
  private readonly dir = inject(Directionality);
  private readonly palettes = inject(HyPalette);

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

  /** The palette the picker shows as chosen, before its stylesheet arrives. */
  readonly palette = this.palettes.selected;
  readonly paletteLoading = computed(() => this.palettes.selected() !== this.palettes.current());

  setTier(tier: HyFidelityTier): void {
    this.fidelity.setTier(tier);
  }

  setPalette(name: HyPaletteName | null): void {
    this.palettes
      .use(name)
      .then(() => {
        try {
          if (name) localStorage.setItem(PALETTE_KEY, name);
          else localStorage.removeItem(PALETTE_KEY);
        } catch {
          // Storage can be blocked. The palette still applies for this visit.
        }
      })
      .catch(() => undefined); // HyPalette has already put the previous choice back.
  }

  preloadPalette(name: HyPaletteName | null): void {
    if (name) this.palettes.preload(name);
  }
}
