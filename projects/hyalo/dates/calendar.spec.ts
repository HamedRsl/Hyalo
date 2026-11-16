import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyCalendar } from './calendar';
import { HyDatePicker } from './date-picker';
import { HyJalaliDateAdapter } from './date-adapter';
describe('calendar interaction', () => {
  it('clamps a reference date to the upper bound and keeps one tab stop', async () => {
    const fixture = TestBed.createComponent(HyCalendar);
    fixture.componentRef.setInput('max', '2025-01-01');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('January 2025');
    expect(fixture.nativeElement.querySelectorAll('button[data-date][tabindex="0"]').length).toBe(
      1,
    );
    expect(
      fixture.nativeElement
        .querySelector('button[data-date][tabindex="0"]')
        .getAttribute('data-date'),
    ).toBe('2025-01-01');
  });
  it('moves by month/year, mirrors day arrows in RTL, and rejects disabled days', async () => {
    const fixture = TestBed.createComponent(HyCalendar);
    fixture.componentRef.setInput('adapter', new HyJalaliDateAdapter());
    fixture.componentRef.setInput('value', '2025-03-20');
    fixture.componentRef.setInput('isDateDisabled', (date: string) => date === '2025-03-20');
    fixture.nativeElement.setAttribute('dir', 'rtl');
    await fixture.whenStable();
    let button: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[data-date][tabindex="0"]',
    );
    button.click();
    expect(fixture.componentInstance.value()).toBe('2025-03-20');
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    await fixture.whenStable();
    button = fixture.nativeElement.querySelector('button[data-date][tabindex="0"]');
    expect(button.getAttribute('data-date')).toBe('2025-03-21');
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', shiftKey: true }));
    await fixture.whenStable();
    const active = fixture.nativeElement.querySelector('button[data-date][tabindex="0"]');
    expect(new HyJalaliDateAdapter().parts(active.getAttribute('data-date')).year).toBe(1405);
  });
  it('clears a stale value when a date draft is invalid', async () => {
    const fixture = TestBed.createComponent(HyDatePicker);
    fixture.componentRef.setInput('value', '2026-11-16');
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '2026/02/31';
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBeNull();
    expect(input.validity.customError).toBe(true);
    expect(input.value).toBe('2026/02/31');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    fixture.componentRef.setInput('value', '2026-12-01');
    fixture.componentInstance.reset();
    await fixture.whenStable();
    expect(input.value).toBe('2026/12/01');
  });
});
