import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
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
  readonly locale = input('en');
  protected readonly choices = computed(() =>
    Array.from({ length: Math.min(10, Math.max(1, Math.floor(this.max() ?? 5) || 5)) }, (_, i) => ({
      value: i + 1,
      text: new Intl.NumberFormat(this.locale()).format(i + 1),
    })),
  );
  protected choose(event: Event): void {
    if (!this.blocked()) this.value.set(Number((event.target as HTMLInputElement).value));
  }
}
