import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { HySlider } from './slider';

describe('slider audit native contracts', () => {
  it('renders formatted value, labeled native ticks and vertical reversed direction', async () => {
    const f = TestBed.createComponent(HySlider);
    f.componentRef.setInput('orientation', 'vertical'); f.componentRef.setInput('reversed', true);
    f.componentRef.setInput('marks', [{ value: 25, label: 'Quarter' }]);
    f.componentRef.setInput('ticks', [0, 50, 100]);
    f.componentRef.setInput('valueFormatter', (v: number) => '$' + v);
    f.componentInstance.value.set(25); await f.whenStable();
    const input: HTMLInputElement = f.nativeElement.querySelector('input');
    expect(input.style.writingMode).toBe('vertical-lr');
    expect(input.style.direction).toBe('rtl');
    expect(input.getAttribute('aria-valuetext')).toBe('$25');
    expect(f.nativeElement.querySelector('output').textContent).toBe('$25');
    expect(f.nativeElement.querySelectorAll('datalist option').length).toBe(4);
    expect(f.nativeElement.querySelector('option[label="Quarter"]')).not.toBeNull();
    const start = vi.fn(), end = vi.fn();
    f.componentInstance.dragStarted.subscribe(start); f.componentInstance.dragEnded.subscribe(end);
    input.dispatchEvent(new Event('pointerdown')); input.dispatchEvent(new Event('pointercancel'));
    expect(start).toHaveBeenCalledWith(25); expect(end).toHaveBeenCalledWith(25);
  });
  it('maps a nonlinear native position to a value and commits separately', async () => {
    const f = TestBed.createComponent(HySlider);
    f.componentRef.setInput('min', 1);
    f.componentRef.setInput('max', 100);
    f.componentRef.setInput('scale', { toPosition: (v: number) => Math.log10(v) / 2, fromPosition: (p: number) => 100 ** p });
    f.componentInstance.value.set(10);
    await f.whenStable();
    const input: HTMLInputElement = f.nativeElement.querySelector('input');
    expect(Number(input.value)).toBeCloseTo(0.5);
    input.value = '1'; input.dispatchEvent(new Event('input'));
    expect(f.componentInstance.value()).toBe(100);
    const commit = vi.fn(); f.componentInstance.committed.subscribe(commit);
    expect(commit).not.toHaveBeenCalled();
    input.dispatchEvent(new Event('change'));
    expect(commit).toHaveBeenCalledWith(100);
    f.componentRef.setInput('disabled', true); await f.whenStable();
    input.dispatchEvent(new Event('change'));
    expect(commit).toHaveBeenCalledTimes(1);
  });
});
