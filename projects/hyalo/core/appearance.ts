import { HY_CONFIG } from './lib/core/config';
import { Injectable, inject, signal } from '@angular/core';
import type { HyMaterial } from './lib/core/axes';

/** Scoped preview override; null preserves each component's own material choice. */
@Injectable({ providedIn: 'root' })
export class HyAppearance {
  readonly material = signal<HyMaterial | null>(null);
}

@Injectable({ providedIn: 'root' })
export class HyLocale {
  readonly locale = signal(inject(HY_CONFIG).locale ?? 'en');
  setLocale(value: string): void {
    this.locale.set(Intl.getCanonicalLocales(value)[0] ?? 'en');
  }
}
