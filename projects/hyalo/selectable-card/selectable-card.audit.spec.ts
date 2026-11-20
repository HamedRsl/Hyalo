import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HySelectableCard } from './selectable-card';
describe('selectable card visual sizes', () => {
  it('changes card padding for small and large sizes', async () => {
    const f = TestBed.createComponent(HySelectableCard); f.componentRef.setInput('options', [{ value: 'a', label: 'Alpha' }]);
    f.componentRef.setInput('size', 'sm'); await f.whenStable();
    const card: HTMLElement = f.nativeElement.querySelector('.card');
    expect(getComputedStyle(card).padding).toBe('12px');
    f.componentRef.setInput('size', 'lg'); await f.whenStable();
    expect(getComputedStyle(card).padding).toBe('24px');
  });
});
