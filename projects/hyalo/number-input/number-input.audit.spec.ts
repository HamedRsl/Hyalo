import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { HyNumberInput } from './number-input';
describe('number input audit contracts', () => {
  it('does not round a valid draft past its maximum', async () => {
    const f = TestBed.createComponent(HyNumberInput); f.componentRef.setInput('precision', 1); f.componentRef.setInput('max', 1.25); await f.whenStable();
    const input: HTMLInputElement = f.nativeElement.querySelector('input'); input.value = '1.25'; input.dispatchEvent(new Event('input'));
    expect(f.componentInstance.value()).toBe(1.25);
  });
  it('does not emit a step when already clamped at a bound', async () => {
    const f = TestBed.createComponent(HyNumberInput); f.componentRef.setInput('max', 10); f.componentInstance.value.set(10); await f.whenStable();
    const stepped = vi.fn(); f.componentInstance.stepped.subscribe(stepped);
    f.nativeElement.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(f.componentInstance.value()).toBe(10); expect(stepped).not.toHaveBeenCalled();
  });
  it('rounds parsed values, rejects invalid drafts and applies parser/formatter hooks', async () => {
    const f = TestBed.createComponent(HyNumberInput);
    f.componentRef.setInput('precision', 2); f.componentRef.setInput('min', 0); f.componentRef.setInput('max', 100);
    f.componentRef.setInput('parser', (s: string) => s.startsWith('#') ? Number(s.slice(1)) : undefined);
    f.componentRef.setInput('formatter', (n: number) => '#' + n); await f.whenStable();
    const input: HTMLInputElement = f.nativeElement.querySelector('input');
    input.value = '#12.345'; input.dispatchEvent(new Event('input')); await f.whenStable();
    expect(f.componentInstance.value()).toBe(12.35);
    f.componentInstance.reset(); await f.whenStable(); expect(input.value).toBe('#12.35');
    input.value = 'bad'; input.dispatchEvent(new Event('input')); await f.whenStable();
    expect(f.componentInstance.value()).toBeNull(); expect(input.validity.customError).toBe(true);
  });
  it('snaps stepping to the minimum-anchored grid and emits only changed values', async () => {
    const f = TestBed.createComponent(HyNumberInput); f.componentRef.setInput('min', 1); f.componentRef.setInput('max', 10); f.componentRef.setInput('step', 2); f.componentRef.setInput('stepMode', 'snap'); f.componentInstance.value.set(4); await f.whenStable();
    const stepped = vi.fn(); f.componentInstance.stepped.subscribe(stepped);
    f.nativeElement.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(f.componentInstance.value()).toBe(7); expect(stepped).toHaveBeenCalledWith({ value: 7, direction: 1 });
  });
  it('formats and parses German grouping with currency metadata', async () => {
    const f = TestBed.createComponent(HyNumberInput); f.componentRef.setInput('locale', 'de-DE'); f.componentRef.setInput('currency', 'EUR'); f.componentRef.setInput('currencyDisplay', 'code'); f.componentInstance.value.set(1234.5); await f.whenStable();
    const input: HTMLInputElement = f.nativeElement.querySelector('input'); expect(input.value).toBe('1.234,5');
    expect(input.getAttribute('aria-valuetext')).toContain('EUR');
    input.value = '2.345,67'; input.dispatchEvent(new Event('input')); expect(f.componentInstance.value()).toBe(2345.67);
  });
});
