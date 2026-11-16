import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { form, FormField } from '@angular/forms/signals';
import { HyJalaliDateAdapter, HyDatePicker } from '@hyalo/angular/dates';
import { HyTimePicker } from '@hyalo/angular/time-picker';
import { HyDateTimePicker } from './date-time-picker';
import { expectNoAxeViolations } from '../src/testing/axe';

@Component({
  imports: [HyDateTimePicker, FormField],
  template:
    '<hy-date-time-picker label="Scheduled at" [formField]="fields.at" timeZone="Asia/Tehran" />',
})
class FormHost {
  readonly data = signal<{ at: number | null }>({ at: Date.UTC(2026, 10, 16, 8, 30) });
  readonly fields = form(this.data);
}
describe('HyDateTimePicker', () => {
  it('keeps edits in a draft until Apply and restores them on Cancel', async () => {
    const f = TestBed.createComponent(FormHost);
    await f.whenStable();
    const picker = f.debugElement.query(By.directive(HyDateTimePicker))
      .componentInstance as HyDateTimePicker;
    const time = f.debugElement.query(By.directive(HyTimePicker)).componentInstance as HyTimePicker;
    const applied = vi.fn();
    picker.applied.subscribe(applied);
    time.value.set('13:45');
    await f.whenStable();
    expect(f.componentInstance.data().at).toBe(Date.UTC(2026, 10, 16, 8, 30));
    const buttons = () =>
      [...f.nativeElement.querySelectorAll('.actions > button')] as HTMLButtonElement[];
    buttons()[1]?.click();
    await f.whenStable();
    expect(time.value()).toBe('12:00');
    time.value.set('13:45');
    await f.whenStable();
    buttons()[0]?.focus();
    buttons()[0]?.click();
    await f.whenStable();
    expect(f.componentInstance.data().at).toBe(Date.UTC(2026, 10, 16, 10, 15));
    expect(applied).toHaveBeenCalledWith(Date.UTC(2026, 10, 16, 10, 15));
    expect(document.activeElement).toBe(buttons()[0]);
    await expectNoAxeViolations(f.nativeElement);
    picker.value.set(null);
    await f.whenStable();
    expect(time.value()).toBe('');
  });
  it('validates time-zone gaps, overlap policy, exact bounds, and readonly state', async () => {
    const f = TestBed.createComponent(HyDateTimePicker);
    f.componentRef.setInput('label', 'Appointment');
    f.componentRef.setInput('value', Date.UTC(2026, 10, 1, 5, 30));
    f.componentRef.setInput('timeZone', 'America/New_York');
    f.componentRef.setInput('disambiguation', 'reject');
    await f.whenStable();
    expect(f.componentInstance.validationError()).not.toBeNull();
    f.componentRef.setInput('disambiguation', 'later');
    f.componentRef.setInput('max', Date.UTC(2026, 10, 1, 6));
    await f.whenStable();
    expect(f.componentInstance.validationError()).not.toBeNull();
    f.componentRef.setInput('max', undefined);
    f.componentRef.setInput('readonly', true);
    await f.whenStable();
    expect(f.nativeElement.querySelector('.actions button').disabled).toBe(true);
    f.componentRef.setInput('readonly', false);
    const date = f.debugElement.query(By.directive(HyDatePicker)).componentInstance as HyDatePicker;
    const time = f.debugElement.query(By.directive(HyTimePicker)).componentInstance as HyTimePicker;
    date.value.set('2026-03-08');
    time.value.set('02:30');
    await f.whenStable();
    expect(f.componentInstance.validationError()).not.toBeNull();
    await expectNoAxeViolations(f.nativeElement);
  });
  it('passes the Jalali adapter through while keeping the value an instant', async () => {
    const f = TestBed.createComponent(HyDateTimePicker);
    f.componentRef.setInput('label', 'Appointment');
    f.componentRef.setInput('value', Date.UTC(2026, 10, 16, 8, 30));
    const adapter = new HyJalaliDateAdapter();
    f.componentRef.setInput('adapter', adapter);
    f.componentRef.setInput('locale', 'fa');
    await f.whenStable();
    const date = f.debugElement.query(By.directive(HyDatePicker)).componentInstance as HyDatePicker;
    expect(date.adapter()).toBe(adapter);
    expect(date.value()).toBe('2026-11-16');
    expect(f.componentInstance.value()).toBe(Date.UTC(2026, 10, 16, 8, 30));
    await expectNoAxeViolations(f.nativeElement);
  });
});
