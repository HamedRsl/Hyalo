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
  host: { '(focusout)': 'leave($event)', '[attr.data-buttons]': 'buttonLayout()' },
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
  readonly formatOptions = input<Intl.NumberFormatOptions>({});
  readonly useGrouping = input(true);
  readonly precision = input<number>();
  readonly parser = input<(text: string) => number | undefined>();
  readonly formatter = input<(value: number) => string>();
  readonly buttonLayout = input<'horizontal' | 'stacked' | 'hidden'>('horizontal');
  readonly stepMode = input<'add' | 'snap'>('add');
  readonly stepped = output<{ value: number; direction: number }>();
  readonly currencyDisplay = input<'symbol' | 'narrowSymbol' | 'code' | 'name'>('symbol');
  protected readonly formatted = computed(() =>
    this.value() === null
      ? ''
      : this.formatter()?.(this.value() as number) ?? new Intl.NumberFormat(this.locale(), {
          maximumFractionDigits: this.precision() ?? 12, useGrouping: this.useGrouping(), ...this.formatOptions(),
        }).format(
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
          currencyDisplay: this.currencyDisplay(),
        })
          .formatToParts(0)
          .find((p) => p.type === 'currency')?.value
      : '',
  );
  protected update(event: Event): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    const text = (event.target as HTMLInputElement).value;
    const parser = this.parser();
    const number = parser ? parser(text) : parseLocaleNumber(text, this.locale());
    const bad =
      !!text.trim() &&
      (number === undefined || !Number.isFinite(number) ||
        number < (this.min() ?? -Infinity) ||
        number > (this.max() ?? Infinity));
    const precision = this.precision();
    this.value.set(bad ? null : number === undefined ? null : precision === undefined ? number : Number(number.toFixed(Math.min(20, Math.max(0, precision)))));
    this.parseError.set(bad);
    this.draft.set(text);
    (event.target as HTMLInputElement).setCustomValidity(this.validationError() ?? '');
  }
  protected spin(direction: number): void {
    if (this.blocked()) return;
    const step = this.step();
    if (!Number.isFinite(step) || step <= 0) return;
    const base = this.value() ?? 0;
    const stepped = this.stepMode() === 'snap' ? (Math.round((base - (this.min() ?? 0)) / step) + direction) * step + (this.min() ?? 0) : base + direction * step;
    const next = Math.min(
      this.max() ?? Infinity,
      Math.max(
        this.min() ?? -Infinity,
        Number(stepped.toFixed(Math.min(20, Math.max(0, this.precision() ?? 12)))),
      ),
    );
    this.value.set(next);
    this.draft.set(this.formatted());
    this.parseError.set(false);
    this.stepped.emit({ value: next, direction });
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
