import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { compatForm } from '@angular/forms/signals/compat';
import { FormField, disabled, form, required, validate } from '@angular/forms/signals';
import { describe, expect, it } from 'vitest';
import { HyField } from './field';
import { HyNumberInput } from '@hyalo/angular/number-input';
import { HyOtp } from '@hyalo/angular/otp';
import { HyPhoneInput } from '@hyalo/angular/phone-input';
import { HyInlineEdit } from '@hyalo/angular/inline-edit';
import { HyRangeSlider } from '@hyalo/angular/range-slider';
import { HyDateRangePicker, type HyDateRange } from '@hyalo/angular/dates';
@Component({
  imports: [HyField, HyNumberInput, HyOtp, HyPhoneInput, FormField],
  template: ` <hy-field label="Amount"
      ><hy-number-input [formField]="f.amount" (validationChange)="parseError.set($event)"
    /></hy-field>
    <hy-field label="Code"><hy-otp [formField]="f.code" /></hy-field>
    <hy-field label="Phone"><hy-phone-input [formField]="legacy.phone" /></hy-field>`,
})
class Host {
  readonly model = signal({ amount: 1 as number | null, code: '' });
  readonly locked = signal(false);
  readonly parseError = signal<string | null>(null);
  readonly f = form(this.model, (p) => {
    required(p.code);
    validate(p.amount, () =>
      this.parseError() ? { kind: 'parse', message: this.parseError()! } : undefined,
    );
    disabled(p.amount, { when: () => this.locked() });
  });
  readonly reactive = new FormControl('09123456789', { nonNullable: true });
  readonly legacy = compatForm(signal({ phone: this.reactive }));
}
describe('advanced form contracts', () => {
  it('updates Signal Forms and typed Reactive Forms, touches on blur, disables and resets', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    inputs[0]!.value = '۱۲۳';
    inputs[0]!.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().amount).toBe(123);
    inputs[0]!.value = '-';
    inputs[0]!.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().amount).toBeNull();
    expect(fixture.componentInstance.f.amount().invalid()).toBe(true);
    expect(inputs[0]!.validity.customError).toBe(true);
    inputs[1]!.value = '۰۰۱۲۳۴';
    inputs[1]!.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().code).toBe('001234');
    inputs[1]!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await fixture.whenStable();
    expect(fixture.componentInstance.f.code().touched()).toBe(true);
    inputs[2]!.value = '+98 912 123 4567';
    inputs[2]!.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.reactive.value).toBe('09121234567');
    inputs[2]!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await fixture.whenStable();
    expect(fixture.componentInstance.reactive.touched).toBe(true);
    fixture.componentInstance.reactive.disable();
    await fixture.whenStable();
    expect(inputs[2]!.disabled).toBe(true);
    fixture.componentInstance.reactive.enable();
    fixture.componentInstance.locked.set(true);
    await fixture.whenStable();
    expect(inputs[0]!.disabled).toBe(true);
    fixture.componentInstance.f().reset({ amount: 4, code: '' });
    fixture.componentInstance.reactive.reset();
    await fixture.whenStable();
    expect(inputs[0]!.value).toBe('4');
    expect(inputs[1]!.value).toBe('');
    expect(inputs[2]!.value).toBe('0912 345 6789');
    expect(fixture.componentInstance.f.code().touched()).toBe(false);
  });
  it('does not normalize an unfinished composition', async () => {
    const fixture = TestBed.createComponent(HyOtp);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '۱۲';
    input.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('');
    input.dispatchEvent(new Event('compositionend', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('12');
  });
  it('keeps inline drafts separate, validates save, and cancels with Escape', async () => {
    const fixture = TestBed.createComponent(HyInlineEdit);
    fixture.componentRef.setInput('value', 'Original');
    fixture.componentRef.setInput('validate', (text: string) =>
      text.length < 3 ? 'Too short' : undefined,
    );
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'x';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('Original');
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Too short');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
    expect(fixture.componentInstance.value()).toBe('Original');
  });
  it('keeps range handles ordered and date drafts resettable', async () => {
    const slider = TestBed.createComponent(HyRangeSlider);
    slider.componentRef.setInput('value', [20, 80]);
    await slider.whenStable();
    const input: HTMLInputElement = slider.nativeElement.querySelector('input');
    input.value = '100';
    input.dispatchEvent(new Event('input'));
    await slider.whenStable();
    expect(slider.componentInstance.value()[0]).toBeLessThanOrEqual(
      slider.componentInstance.value()[1],
    );
    const range = TestBed.createComponent(HyDateRangePicker);
    range.componentRef.setInput('value', {
      start: '2026-11-16',
      end: '2026-11-18',
    } satisfies HyDateRange);
    await range.whenStable();
    range.componentRef.setInput('value', null);
    range.componentInstance.reset();
    await range.whenStable();
    expect((range.nativeElement.querySelector('input') as HTMLInputElement).value).toBe('');
  });
});
