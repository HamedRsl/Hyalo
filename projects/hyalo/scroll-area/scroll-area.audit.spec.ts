import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { HyScrollArea } from './scroll-area';
describe('scroll host delegation', () => {
  it('delegates native scrolling to its own host and reports coordinates', async () => {
    const f = TestBed.createComponent(HyScrollArea); f.componentRef.setInput('label', 'History'); await f.whenStable();
    const host: HTMLElement = f.nativeElement;
    const scroll = vi.fn(); host.scrollTo = scroll;
    f.componentInstance.scrollTo({ top: 120, left: 20, behavior: 'instant' });
    expect(scroll).toHaveBeenCalledWith({ top: 120, left: 20, behavior: 'instant' });
    host.scrollTop = 120; host.scrollLeft = 20;
    const changed = vi.fn(); f.componentInstance.scrolled.subscribe(changed);
    host.dispatchEvent(new Event('scroll'));
    expect(changed).toHaveBeenCalledWith({ top: 120, left: 20 });
    expect(host.getAttribute('role')).toBe('region');
  });
});
