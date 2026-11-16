import { Directionality } from '@angular/cdk/bidi';
import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  HyAppearance,
  HyLocale,
  HyFidelity,
  type HyMaterial,
  type HyFidelityTier,
} from '@hyalo/angular/core';
import { HyMotion } from '@hyalo/angular/motion';
import { HyPalette, type HyPaletteName } from '@hyalo/angular/theme';

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
  private readonly appearance = inject(HyAppearance);
  private readonly localeService = inject(HyLocale);
  private readonly dir = inject(Directionality);
  private readonly palettes = inject(HyPalette);

  readonly locale = this.localeService.locale;
  readonly material = this.appearance.material;
  readonly detectedTier = this.fidelity.detected;
  readonly tierChoice = computed(() => this.fidelity.override() ?? 'auto');
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
      root.setAttribute('lang', this.locale());
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

  setTier(tier: string): void {
    if (tier === 'auto') this.fidelity.setTier(null);
    else if (['high', 'medium', 'low'].includes(tier))
      this.fidelity.setTier(tier as HyFidelityTier);
  }

  setLocale(value: string): void {
    if (value === 'en' || value === 'fa') this.localeService.setLocale(value);
  }
  setMaterial(value: string): void {
    this.appearance.material.set(
      ['clear', 'frosted', 'tinted', 'solid'].includes(value) ? (value as HyMaterial) : null,
    );
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
