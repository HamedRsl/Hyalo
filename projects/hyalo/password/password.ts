import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  input,
  model,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type HyPasswordStrength = 'empty' | 'short' | 'variety' | 'stronger';
export interface HyPasswordStrengthContext {
  readonly $implicit: string;
  readonly value: string;
  readonly level: HyPasswordStrength;
}
export interface HyPasswordVisibilityContext {
  readonly $implicit: boolean;
}
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

@Component({
  selector: 'hy-password',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './password.html',
  styleUrl: './password.css',
})
export class HyPassword extends HyValueControl implements FormValueControl<string> {
  readonly value = model('');
  readonly autocomplete = input('new-password');
  readonly minLength = input<number | undefined>(12);
  readonly showStrength = input(true);
  readonly strengthPolicy = input<(value: string) => HyPasswordStrength>();
  readonly strengthMessages = input<Readonly<Record<HyPasswordStrength, string>>>({
    empty: 'No password entered',
    short: 'Too short',
    variety: 'Add variety',
    stronger: 'Stronger',
  });
  readonly strengthTemplate = input<TemplateRef<HyPasswordStrengthContext>>();
  readonly visibilityTemplate = input<TemplateRef<HyPasswordVisibilityContext>>();
  readonly showLabel = input('Show password');
  readonly hideLabel = input('Hide password');
  readonly strengthPrefix = input('Strength estimate:');
  readonly strengthDisclaimer = input('This is not a security guarantee.');
  protected readonly revealed = signal(false);
  protected readonly strengthLevel = computed<HyPasswordStrength>(() => {
    const value = this.value();
    const policy = this.strengthPolicy();
    if (policy) return policy(value);
    if (!value) return 'empty';
    if (value.length < (this.minLength() ?? 12)) return 'short';
    const groups = [/[a-z]/u, /[A-Z]/u, /[0-9]/u, /[^a-zA-Z0-9]/u].filter((pattern) =>
      pattern.test(value),
    ).length;
    return groups >= 3 ? 'stronger' : 'variety';
  });
  protected readonly strength = computed(() => this.strengthMessages()[this.strengthLevel()]);
  protected readonly strengthContext = computed<HyPasswordStrengthContext>(() => ({
    $implicit: this.strength(),
    value: this.value(),
    level: this.strengthLevel(),
  }));
  protected update(event: Event): void {
    if (!this.blocked()) this.value.set((event.target as HTMLInputElement).value);
  }
  protected toggle(): void {
    this.revealed.update((value) => !value);
    this.focus();
  }
  reset(): void {
    this.revealed.set(false);
  }
}
