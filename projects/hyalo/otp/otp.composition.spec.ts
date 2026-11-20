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
});
