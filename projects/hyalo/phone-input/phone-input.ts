import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { normalizeDigits, normalizeSearch } from '@hyalo/angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
import {
  formatMask,
  normalizeIranianPhone,
  deleteMaskSeparator,
  maskCaret,
} from '@hyalo/angular/masked-input';
export interface HyPhoneCountry {
  readonly code: string;
  readonly name: string;
  readonly dialCode: string;
  readonly mask: string;
  readonly pattern?: string;
  readonly example?: string;
  readonly normalize?: (value: string) => string;
}
const IRAN: HyPhoneCountry = {
  code: 'IR',
  name: 'Iran',
  dialCode: '98',
  mask: '#### ### ####',
  pattern: '09[0-9]{2} [0-9]{3} [0-9]{4}',
  example: 'Iranian mobile number, for example 0912 345 6789. +98 and Persian digits are accepted.',
  normalize: normalizeIranianPhone,
};
@Component({
  selector: 'hy-phone-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './phone-input.html',
  styleUrl: './phone-input.css',
})
export class HyPhoneInput extends HyValueControl implements FormValueControl<string> {
  readonly value = model('');
  /** Supply supported countries and their numbering policies; Iran remains the default. */
  readonly countries = input<readonly HyPhoneCountry[]>([]);
  readonly country = model('IR');
  readonly valueFormat = input<'national' | 'international'>('national');
  readonly countrySearchLabel = input('Search countries');
  readonly countryLabel = input('Country');
  readonly countryChanged = output<HyPhoneCountry>();
  protected readonly countryQuery = signal('');
  protected readonly currentCountry = computed(
    () => this.countries().find((item) => item.code === this.country()) ?? IRAN,
  );
  protected readonly filteredCountries = computed(() => {
    const query = normalizeSearch(this.countryQuery());
    return this.countries().filter(
      (item) =>
        item.code === this.country() ||
        normalizeSearch(item.name + ' ' + item.code + ' ' + item.dialCode).includes(query),
    );
  });
  protected readonly display = computed(() =>
    formatMask(this.national(this.value()), this.currentCountry().mask),
  );
  protected readonly countryPattern = computed(() => this.currentCountry().pattern ?? '');
  private national(value: string): string {
    const country = this.currentCountry(),
      normalized = normalizeDigits(value),
      digits = normalized.replace(/\D/gu, '');
    if (country.normalize) return country.normalize(value);
    const international = normalized.trim().startsWith('+') || normalized.trim().startsWith('00');
    const canonical = digits.startsWith('00') ? digits.slice(2) : digits;
    return international && canonical.startsWith(country.dialCode)
      ? canonical.slice(country.dialCode.length)
      : digits;
  }
  private canonical(value: string): string {
    const national = this.national(value).slice(
      0,
      this.currentCountry().mask.replace(/[^#]/gu, '').length,
    );
    return this.valueFormat() === 'international' && national
      ? '+' +
          this.currentCountry().dialCode +
          (this.currentCountry().code === 'IR' ? national.replace(/^0/u, '') : national)
      : national;
  }
  protected chooseCountry(event: Event): void {
    if (this.blocked()) return;
    const country = this.countries().find(
      (item) => item.code === (event.target as HTMLSelectElement).value,
    );
    if (!country) return;
    this.country.set(country.code);
    this.value.set('');
    this.countryChanged.emit(country);
    this.touch.emit();
  }
  protected beforeDelete(event: Event): void {
    if (this.blocked()) return;
    const input = event.target as HTMLInputElement,
      deletion = deleteMaskSeparator(event, input);
    if (!deletion) return;
    this.value.set(this.canonical(deletion.value));
    input.value = this.display();
    maskCaret(input, deletion.digitCaret);
  }
  protected update(event: Event): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    const element = event.target as HTMLInputElement;
    const raw = element.value,
      caret = element.selectionStart ?? raw.length;
    const next = this.canonical(raw);
    const digitCaret = this.national(raw.slice(0, caret)).length;
    this.value.set(next);
    element.value = this.display();
    let position = 0,
      count = 0;
    while (position < element.value.length && count < digitCaret) {
      if (/[0-9]/u.test(element.value[position] ?? '')) count++;
      position++;
    }
    element.setSelectionRange(position, position);
  }
}
