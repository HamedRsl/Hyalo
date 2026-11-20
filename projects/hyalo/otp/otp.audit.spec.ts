import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { HyOtp } from './otp';

describe('OTP audit contracts', () => {
  it('formats a pasted code exactly once before filtering and completing', async () => {
    const fixture = TestBed.createComponent(HyOtp);
    const formatter = vi.fn((text: string) => text.slice(1));
    fixture.componentRef.setInput('length', 4);
    fixture.componentRef.setInput('mode', 'alphanumeric');
    fixture.componentRef.setInput('masked', true);
    fixture.componentRef.setInput('formatter', formatter);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const complete = vi.fn();
    fixture.componentInstance.complete.subscribe(complete);
    const event = new Event('paste', { cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => '#a۱b2' } });
    input.dispatchEvent(event);
    await fixture.whenStable();
    expect(input.type).toBe('password');
    expect(fixture.componentInstance.value()).toBe('a1b2');
    expect(complete).toHaveBeenCalledWith('a1b2');
    expect(formatter).toHaveBeenCalledTimes(1);
  });
});
