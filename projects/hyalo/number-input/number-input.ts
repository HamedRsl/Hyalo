import {
  ChangeDetectionStrategy,
  Component,
  computed,
  afterRenderEffect,
  effect,
  input,
  model,
  output,
  linkedSignal,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
import { parseLocaleNumber } from '@hyalo/angular/core';
@Component({
  selector: 'hy-number-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './number-input.html',
  styleUrl: './number-input.css',
})
export class HyNumberInput extends HyValueControl implements FormValueControl<number | null> {
  readonly value = model<number | null>(null);
  readonly locale = input('en');
  readonly currency = input<string>();
  readonly min = input<number>();
  readonly max = input<number>();
  readonly step = input(1);
  protected readonly formatted = computed(() =>
    this.value() === null
      ? ''
      : new Intl.NumberFormat(this.locale(), { maximumFractionDigits: 12 }).format(
          this.value() as number,
        ),
  );
  protected readonly draft = linkedSignal(() => this.formatted());
  protected readonly parseError = linkedSignal(() => {
    this.value();
    return false;
  });
  readonly validationMessage = input('Enter a valid number within the allowed range.');
  readonly validationError = computed(() => (this.parseError() ? this.validationMessage() : null));
  readonly validationChange = output<string | null>();
  constructor() {
    super();
    effect(() => this.validationChange.emit(this.validationError()));
    afterRenderEffect(() =>
      this.element
        .querySelector<HTMLInputElement>('input')
        ?.setCustomValidity(this.validationError() ?? ''),
    );
  }
  protected readonly currencyLabel = computed(() =>
    this.currency()
      ? new Intl.NumberFormat(this.locale(), {
          style: 'currency',
          currency: this.currency(),
          currencyDisplay: 'symbol',
        })
          .formatToParts(0)
          .find((p) => p.type === 'currency')?.value
      : '',
  );
  protected update(event: Event): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    const text = (event.target as HTMLInputElement).value;
    const number = parseLocaleNumber(text, this.locale());
    const bad =
      !!text.trim() &&
      (number === undefined ||
        number < (this.min() ?? -Infinity) ||
        number > (this.max() ?? Infinity));
    this.value.set(bad ? null : (number ?? null));
    this.parseError.set(bad);
    this.draft.set(text);
    (event.target as HTMLInputElement).setCustomValidity(this.validationError() ?? '');
  }
  protected spin(direction: number): void {
    if (this.blocked()) return;
    const step = this.step();
    if (!Number.isFinite(step) || step <= 0) return;
    const next = Math.min(
      this.max() ?? Infinity,
      Math.max(
        this.min() ?? -Infinity,
        Number(((this.value() ?? 0) + direction * step).toFixed(12)),
      ),
    );
    this.value.set(next);
    this.draft.set(this.formatted());
    this.parseError.set(false);
  }
  protected arrows(event: KeyboardEvent): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    this.spin(event.key === 'ArrowUp' ? 1 : -1);
  }
  reset(): void {
    this.parseError.set(false);
    this.draft.set(this.formatted());
  }
}
