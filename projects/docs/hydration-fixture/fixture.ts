// Purpose-built SSR regression fixture: keep the two hydration boundaries visible together.
/* eslint-disable @angular-eslint/component-max-inline-declarations */
import { Component, inject, signal, afterNextRender } from '@angular/core';

import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { HySelect } from '../../hyalo/select/select';
import { HyFidelity } from '@hyalo/angular/core';

@Component({
  selector: 'docs-hydration-choice',
  imports: [HySelect],
  template: `<hy-select [options]="options" [(value)]="value" name="choice" />
    <output class="model">{{ value() }}</output>`,
})
export class HydrationChoice {
  readonly value = signal<string | undefined>('first');
  readonly options = [
    { value: 'first', label: 'First' },
    { value: 'second', label: 'Second' },
    { value: 'third', label: 'Third' },
  ];
}

@Component({
  selector: 'docs-hydration-fixture',
  imports: [HydrationChoice],
  template: `<main>
    <section id="eager"><docs-hydration-choice /></section>
    @defer (hydrate on interaction) {
      <section id="deferred"><docs-hydration-choice /></section>
    }
    <button id="outside" type="button">Outside</button>
    <button id="low" type="button" (click)="fidelity.setTier('low')">Low</button>
    <button id="high" type="button" (click)="fidelity.setTier('high')">High</button>
    <output id="tier">{{ fidelity.tier() }}</output>
    <output id="booted">{{ booted() }}</output>
  </main>`,
})
export class HydrationFixture {
  readonly fidelity = inject(HyFidelity);
  readonly booted = signal(false);
  constructor() {
    afterNextRender(() => {
      const saved = localStorage.getItem('docs-hydration-tier');
      if (saved === 'high' || saved === 'medium' || saved === 'low') this.fidelity.setTier(saved);
      this.booted.set(true);
    });
  }
}

export const hydrationProviders = [provideClientHydration(withIncrementalHydration())];
