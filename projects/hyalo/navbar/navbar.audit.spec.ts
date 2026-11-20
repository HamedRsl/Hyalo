import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { HyNavbar } from './navbar';
describe('navbar configurable container breakpoint', () => {
  it('collapses at configured host width and disconnects its observer', async () => {
    let resize: ResizeObserverCallback = () => undefined;
    const disconnect = vi.fn();
    vi.stubGlobal('ResizeObserver', class { constructor(callback: ResizeObserverCallback) { resize = callback; } observe() {} disconnect = disconnect; });
    const f = TestBed.createComponent(HyNavbar); f.componentRef.setInput('mobileBreakpoint', 600); await f.whenStable();
    resize([{ contentRect: { width: 500 } } as ResizeObserverEntry], {} as ResizeObserver); await f.whenStable();
    expect(f.nativeElement.getAttribute('data-mobile')).toBe('true');
    resize([{ contentRect: { width: 700 } } as ResizeObserverEntry], {} as ResizeObserver); await f.whenStable();
    expect(f.nativeElement.hasAttribute('data-mobile')).toBe(false);
    f.componentRef.setInput('mobileBreakpoint', 800); await f.whenStable();
    expect(f.nativeElement.getAttribute('data-mobile')).toBe('true');
    f.destroy(); expect(disconnect).toHaveBeenCalled(); vi.unstubAllGlobals();
  });
});
