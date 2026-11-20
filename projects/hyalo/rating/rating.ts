import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

@Component({
  selector: 'hy-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './rating.html',
  styleUrl: './rating.css',
})
export class HyRating extends HyValueControl implements FormValueControl<number> {
  readonly value = model(0);
  readonly max = input<number | undefined>(5);
  /** Increment between choices, from 0.1 to 1. */
  readonly step = input(1);
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly locale = input('en');
  protected readonly maximum = computed(() =>
    Math.min(10, Math.max(1, Math.floor(this.max() ?? 5) || 5)),
  );
  protected readonly maximumText = computed(() =>
    new Intl.NumberFormat(this.locale()).format(this.maximum()),
  );
  protected readonly choices = computed(() => {
    const maximum = this.maximum();
    const step = Number.isFinite(this.step()) ? Math.min(1, Math.max(0.1, this.step())) : 1;
    const format = new Intl.NumberFormat(this.locale());
    return Array.from({ length: Math.ceil(maximum / step) }, (_, i) => {
      const value = Math.min(maximum, Number(((i + 1) * step).toFixed(3)));
      return { value, text: format.format(value) };
    }).filter((choice, i, choices) => choice.value !== choices[i - 1]?.value);
  });
  protected choose(event: Event): void {
    if (!this.blocked()) this.value.set(Number((event.target as HTMLInputElement).value));
  }
  protected clearChoice(event: MouseEvent, choice: number): void {
    if (this.blocked() || !this.clearable() || this.value() !== choice) return;
    event.preventDefault();
    this.value.set(0);
  }
}
