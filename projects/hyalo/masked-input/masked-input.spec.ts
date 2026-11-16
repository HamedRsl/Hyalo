import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyMaskedInput } from './masked-input';
import { normalizeIranianPhone } from './mask';
describe('identifier editing', () => {
  it('normalizes phone prefixes and preserves leading zeros', () => {
    expect(normalizeIranianPhone('+۹۸۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
    expect(normalizeIranianPhone('0098 912 345 6789')).toBe('09123456789');
  });
  it('deletes digits across a presentation separator and keeps the caret', async () => {
    const fixture = TestBed.createComponent(HyMaskedInput);
    fixture.componentRef.setInput('mask', '###-###');
    fixture.componentRef.setInput('value', '001234');
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.setSelectionRange(4, 4);
    const event = new InputEvent('beforeinput', {
      inputType: 'deleteContentBackward',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    await fixture.whenStable();
    expect(event.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.value()).toBe('00234');
    expect(input.value).toBe('002-34');
    expect(input.selectionStart).toBe(2);
  });
});
