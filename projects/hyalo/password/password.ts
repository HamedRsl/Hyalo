import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

@Component({
  selector: 'hy-password',
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
  protected readonly revealed = signal(false);
  protected readonly strength = computed(() => {
    const value = this.value();
    if (!value) return 'No password entered';
    if (value.length < (this.minLength() ?? 12)) return 'Too short';
    const groups = [/[a-z]/u, /[A-Z]/u, /[0-9]/u, /[^a-zA-Z0-9]/u].filter((pattern) =>
      pattern.test(value),
    ).length;
    return groups >= 3 ? 'Stronger' : 'Add variety';
  });
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
