import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyCalendar } from './calendar';
import { HyDatePicker } from './date-picker';
import { HyJalaliDateAdapter } from './date-adapter';
describe('calendar interaction', () => {
  it('honors a custom strategy that suppresses live preview', async () => {
    const fixture = TestBed.createComponent(HyCalendar);
    fixture.componentRef.setInput('rangeMode', true);
    await fixture.whenStable();
    // Start with the default strategy, then let an application suppress previews.
    fixture.nativeElement.querySelector('[data-date="2026-01-10"]').click();
    fixture.componentRef.setInput('rangeStrategy', () => null);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('[data-date="2026-01-12"]').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('[data-preview="true"]')).toHaveLength(0);
  });
  it('drills from bounded year choices into a month with an in-bounds active day', async () => {
    const fixture = TestBed.createComponent(HyCalendar);
    fixture.componentRef.setInput('min', '2026-06-15');
    fixture.componentRef.setInput('max', '2027-03-10');
    fixture.componentRef.setInput('referenceDate', '2026-06-15');
    await fixture.whenStable();
    fixture.nativeElement.querySelector('[aria-label="Choose year"]').click();
    await fixture.whenStable();
    const year = [...fixture.nativeElement.querySelectorAll('.calendar-choices button') as NodeListOf<HTMLButtonElement>].find(button => button.textContent?.trim() === '2026')!;
    year.click();
    await fixture.whenStable();
    const months = fixture.nativeElement.querySelectorAll('.calendar-choices button') as NodeListOf<HTMLButtonElement>;
    expect(months).toHaveLength(12);
    expect(months[0]!.disabled).toBe(true);
    months[5]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.view()).toBe('month');
    const active = fixture.nativeElement.querySelector('button[data-date][tabindex="0"]') as HTMLButtonElement;
    expect(active.getAttribute('data-date')).toBe('2026-06-15');
    expect(active.getAttribute('aria-disabled')).not.toBe('true');
  });

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
  it('clears the live range preview when hovering a disabled endpoint', async () => {
    const fixture = TestBed.createComponent(HyCalendar);
    fixture.componentRef.setInput('rangeMode', true);
    fixture.componentRef.setInput('isDateDisabled', (date: string) => date === '2026-01-13');
    const previews: unknown[] = [];
    fixture.componentInstance.rangePreview.subscribe((range) => previews.push(range));
    await fixture.whenStable();
    const day = (date: string): HTMLButtonElement =>
      fixture.nativeElement.querySelector('button[data-date="' + date + '"]');
    day('2026-01-10').click();
    day('2026-01-12').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(previews.at(-1)).toEqual({ start: '2026-01-10', end: '2026-01-12' });
    expect(fixture.nativeElement.querySelectorAll('[data-preview="true"]').length).toBe(3);

    day('2026-01-13').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(previews.at(-1)).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[data-preview="true"]').length).toBe(0);
    expect(fixture.componentInstance.range()).toBeNull();

    day('2026-01-12').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.range()).toEqual({ start: '2026-01-10', end: '2026-01-12' });
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
