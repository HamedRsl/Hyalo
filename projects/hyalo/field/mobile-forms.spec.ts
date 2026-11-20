import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, disabled, form, maxLength, required } from '@angular/forms/signals';
import { HyNumericKeypad } from '@hyalo/angular/keypad';
import { HySlideConfirm } from '@hyalo/angular/slide-confirm';
@Component({
  imports: [FormField, HyNumericKeypad, HySlideConfirm],
  template:
    '<hy-numeric-keypad label="Amount" [formField]="fields.amount" /><hy-slide-confirm label="Confirm" [formField]="fields.confirmed" />',
})
class Host {
  readonly data = signal({ amount: '', confirmed: false });
  readonly locked = signal(false);
  readonly fields = form(this.data, (p) => {
    required(p.amount);
    maxLength(p.amount, 4);
    disabled(p.amount, { when: () => this.locked() });
    disabled(p.confirmed, { when: () => this.locked() });
  });
}
describe('mobile Signal Forms controls', () => {
  it('shares value, touch, maxlength, disabled and reset with Signal Forms', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const input = f.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '۰۰۱۲';
    input.dispatchEvent(new Event('input'));
    await f.whenStable();
    expect(f.componentInstance.data().amount).toBe('0012');
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.fields.amount().touched()).toBe(true);
    input.value = '12345';
    input.dispatchEvent(new Event('input'));
    await f.whenStable();
    expect(f.componentInstance.data().amount).toBe('0012');
    f.nativeElement.querySelector('hy-slide-confirm button').click();
    await f.whenStable();
    expect(f.componentInstance.data().confirmed).toBe(true);
    f.componentInstance.locked.set(true);
    await f.whenStable();
    expect(input.disabled).toBe(true);
    expect(f.nativeElement.querySelector('hy-slide-confirm button').disabled).toBe(true);
    f.componentInstance.fields().reset({ amount: '09', confirmed: false });
    await f.whenStable();
    expect(input.value).toBe('09');
    expect(f.componentInstance.fields.amount().touched()).toBe(false);
    expect(f.nativeElement.querySelector('.track').getAttribute('data-confirmed')).toBe('false');
  });
});
