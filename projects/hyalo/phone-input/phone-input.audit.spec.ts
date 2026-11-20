import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyPhoneInput, type HyPhoneCountry } from './phone-input';

const countries: readonly HyPhoneCountry[] = [
  { code: 'US', name: 'United States', dialCode: '1', mask: '(###) ###-####' },
  { code: 'GB', name: 'United Kingdom', dialCode: '44', mask: '#### ### ###' },
];

describe('phone country policies (API-198–200)', () => {
  it('uses the first supported country when the default is not in the supplied catalog', async () => {
    const fixture = TestBed.createComponent(HyPhoneInput);
    fixture.componentRef.setInput('countries', countries);
    fixture.componentRef.setInput('value', '+12025550123');
    fixture.componentRef.setInput('valueFormat', 'international');
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('select')!.value).toBe('US');
    expect(root.querySelector<HTMLInputElement>('input[type="tel"]')!.value).toBe('(202) 555-0123');
    const search = root.querySelector<HTMLInputElement>('input[type="search"]')!;
    search.value = 'kingdom';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect([...root.querySelectorAll('option')].map((option) => option.value)).toEqual([
      'US',
      'GB',
    ]);
    const select = root.querySelector('select')!;
    select.value = 'GB';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.country()).toBe('GB');
    expect(fixture.componentInstance.value()).toBe('');
    const tel = root.querySelector<HTMLInputElement>('input[type="tel"]')!;
    tel.value = '+44 2071 234 567';
    tel.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('+442071234567');
    expect(tel.value).toBe('2071 234 567');
  });

  it('keeps country selection and telephone edits blocked while readonly', async () => {
    const fixture = TestBed.createComponent(HyPhoneInput);
    fixture.componentRef.setInput('countries', countries);
    fixture.componentRef.setInput('country', 'US');
    fixture.componentRef.setInput('readonly', true);
    fixture.componentRef.setInput('value', '2025550123');
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('select')!.disabled).toBe(true);
    const select = root.querySelector('select')!;
    select.value = 'GB';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.country()).toBe('US');
    expect(fixture.componentInstance.value()).toBe('2025550123');
  });
});
