import {
  DOCUMENT,
  Injectable,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { HY_CONFIG } from '../core/config';
import type { HyFidelityTier } from '../core/axes';
import { injectIsBrowser, matchesMedia } from '../core/platform';
export type { HyFidelityTier };
interface NavigatorHints {
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
  readonly connection?: { readonly saveData?: boolean };
}
export function detectFidelity(nav: NavigatorHints): HyFidelityTier {
  if (nav.connection?.saveData) return 'low';
  const memory = nav.deviceMemory ?? 8,
    cores = nav.hardwareConcurrency ?? 8;
  if (memory <= 2 || cores <= 2) return 'low';
  if (memory <= 4 || cores <= 4 || matchesMedia('(pointer: coarse)')) return 'medium';
  return 'high';
}
@Injectable({ providedIn: 'root' })
export class HyFidelity {
  private readonly config = inject(HY_CONFIG);
  private readonly document = inject(DOCUMENT);
  private readonly detectedTier = signal<HyFidelityTier>('medium');
  private readonly selectedTier = signal<HyFidelityTier | null>(this.config.fidelity ?? null);
  readonly detected = this.detectedTier.asReadonly();
  readonly override = this.selectedTier.asReadonly();
  readonly tier = computed(() => this.selectedTier() ?? this.detectedTier());
  constructor() {
    if (!injectIsBrowser()) return;
    afterNextRender(() => this.detectedTier.set(detectFidelity(navigator as NavigatorHints)));
    effect(() => this.document.documentElement.setAttribute('data-hy-fidelity', this.tier()));
  }
  setTier(tier: HyFidelityTier | null): void {
    this.selectedTier.set(tier);
  }
}
