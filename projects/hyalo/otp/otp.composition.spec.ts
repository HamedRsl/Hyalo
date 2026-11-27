import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyOtp } from './otp';
@Component({ imports: [HyOtp], template: `<ng-template #cell let-char let-index="index"><b>{{index}}={{char}}</b></ng-template><hy-otp label="Security code" [length]="3" value="12" [masked]="true" [cellTemplate]="cell" />` })
class Host {}
describe('OTP decorative cell composition', () => {
  it('keeps a single accessible native input and masked decorative template context', async () => {
    const f = TestBed.createComponent(Host); await f.whenStable();
    expect(f.nativeElement.querySelectorAll('input').length).toBe(1);
    expect(f.nativeElement.querySelector('input').getAttribute('aria-label')).toBe('Security code');
    const cells: HTMLElement = f.nativeElement.querySelector('[aria-hidden="true"]');
    expect(cells.textContent).toContain('0=•'); expect(cells.textContent).toContain('1=•'); expect(cells.querySelectorAll('b').length).toBe(3);
  });

  it('normalizes slot input, advances focus, and accepts a full pasted code', async () => {
    const fixture = TestBed.createComponent(HyOtp);
    fixture.componentRef.setInput('inputMode', 'per-character');
    fixture.componentRef.setInput('length', 3);
    await fixture.whenStable();
    const slots = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('.otp-slots input');
    const first = slots.item(0);
    const second = slots.item(1);
    const complete = vi.fn();
    fixture.componentInstance.complete.subscribe(complete);
    first.value = '۰';
    first.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(first.value).toBe('0');
    expect(document.activeElement).toBe(second);
    const paste = new Event('paste', { cancelable: true });
    Object.defineProperty(paste, 'clipboardData', { value: { getData: () => '۰۱۲' } });
    second.dispatchEvent(paste);
    await fixture.whenStable();
    expect(Array.from(slots, (slot) => slot.value)).toEqual(['0', '1', '2']);
    expect(complete).toHaveBeenCalledExactlyOnceWith('012');
  });
});
