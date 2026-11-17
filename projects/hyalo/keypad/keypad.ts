import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyLocale, normalizeDigits } from '@hyalo/angular/core';
import { HyValueControl } from '@hyalo/angular/field';

@Component({
  selector: 'hy-numeric-keypad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './keypad.html',
  styleUrl: './keypad.css',
  host: { '(focusout)': 'leave($event)' },
})
export class HyNumericKeypad extends HyValueControl implements FormValueControl<string> {
  private readonly globalLocale = inject(HyLocale);
  readonly value = model('');
  readonly locale = input<string>();
  readonly decimal = input(false);
  readonly allowNegative = input(false);
  readonly masked = input(false);
  readonly maxLength = input<number | undefined>(16);
  readonly maxFractionDigits = input<number>();
  readonly layout = input<'telephone' | 'calculator'>('telephone');
  readonly decimalSeparator = input('.');
  readonly autocomplete = input('off');
  readonly clearLabel = input('Clear');
  readonly backspaceLabel = input('Delete last digit');
  readonly decimalLabel = input('Decimal separator');
  readonly signLabel = input('Change sign');
  readonly submitLabel = input('');
  readonly submitted = output<string>();
  protected readonly digits = computed(() => {
    const format = new Intl.NumberFormat(this.locale() ?? this.globalLocale.locale(), {
      useGrouping: false,
    });
    return Array.from({ length: 10 }, (_, i) => ({ value: String(i), label: format.format(i) }));
  });
  protected readonly display = computed(() =>
    this.value()
      .replace(/\d/gu, (digit) => this.digits()[Number(digit)]?.label ?? digit)
      .replace('.', this.decimalSeparator()),
  );
  protected readonly keys = computed(() =>
    (this.layout() === 'calculator'
      ? [7, 8, 9, 4, 5, 6, 1, 2, 3]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9]
    ).flatMap((index) => {
      const digit = this.digits()[index];
      return digit ? [digit] : [];
    }),
  );
  private accepts(value: string): boolean {
    const limit = this.maxLength();
    const max =
      limit !== undefined && Number.isFinite(limit)
        ? Math.max(1, Math.min(1000, Math.trunc(limit)))
        : 16;
    const fractionDigits = this.maxFractionDigits();
    const pattern = this.decimal() ? /^-?\d*(?:\.\d*)?$/u : /^-?\d*$/u;
    return (
      value.length <= max &&
      pattern.test(value) &&
      (this.allowNegative() || !value.startsWith('-')) &&
      (fractionDigits === undefined ||
        !Number.isFinite(fractionDigits) ||
        (value.split('.')[1]?.length ?? 0) <= Math.max(0, Math.trunc(fractionDigits)))
    );
  }
  append(value: string): void {
    if (this.blocked()) return;
    const next = this.value() + value;
    if (this.accepts(next)) this.value.set(next);
  }
  erase(): void {
    if (!this.blocked()) this.value.update((value) => value.slice(0, -1));
  }
  clear(): void {
    if (!this.blocked()) this.value.set('');
  }
  sign(): void {
    if (!this.blocked()) {
      const next = this.value().startsWith('-') ? this.value().slice(1) : '-' + this.value();
      if (this.accepts(next)) this.value.set(next);
    }
  }
  protected enter(event: Event): void {
    if ('isComposing' in event && event.isComposing) return;
    event.preventDefault();
    this.submit();
  }
  protected edit(event: Event): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    const input = event.target as HTMLInputElement,
      value = normalizeDigits(input.value)
        .replaceAll('٫', '.')
        .replace(this.decimalSeparator() || '.', '.');
    if (this.accepts(value)) this.value.set(value);
    else input.value = this.display();
  }
  submit(): void {
    if (
      !this.blocked() &&
      /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(this.value()) &&
      this.accepts(this.value())
    ) {
      this.touch.emit();
      this.submitted.emit(this.value());
    }
  }
}
