import { TestBed } from '@angular/core/testing';
import { HyAvatar } from './avatar';

describe('avatar image policy', () => {
  it('forwards image candidates and policy and falls back once per failed image', async () => {
    const f = TestBed.createComponent(HyAvatar);
    f.componentRef.setInput('name', 'Ada Lovelace');
    f.componentRef.setInput('src', '/ada.png');
    f.componentRef.setInput('srcset', '/ada.png 1x, /ada@2x.png 2x');
    f.componentRef.setInput('sizes', '40px');
    f.componentRef.setInput('loading', 'lazy');
    f.componentRef.setInput('fetchPriority', 'low');
    f.componentRef.setInput('shape', 'square');
    const errors = vi.fn();
    f.componentInstance.imageError.subscribe(errors);
    await f.whenStable();
    const image: HTMLImageElement = f.nativeElement.querySelector('img');
    expect(image.srcset).toContain('2x');
    expect(image.sizes).toBe('40px');
    expect(image.loading).toBe('lazy');
    expect(image.getAttribute('fetchpriority')).toBe('low');
    expect(f.nativeElement.style.borderRadius).toBe('var(--hy-radius-m)');
    image.dispatchEvent(new Event('error'));
    await f.whenStable();
    expect(errors).toHaveBeenCalledTimes(1);
    expect(f.nativeElement.querySelector('img')).toBeNull();
    expect(f.nativeElement.textContent.trim()).toBe('AL');
    f.componentRef.setInput('src', '/replacement.png');
    await f.whenStable();
    expect(f.nativeElement.querySelector('img')).not.toBeNull();
    f.componentRef.setInput('src', '');
    f.componentRef.setInput('icon', 'user');
    await f.whenStable();
    expect(f.nativeElement.querySelector('hy-icon')).not.toBeNull();
    expect(f.nativeElement.getAttribute('aria-label')).toBe('Ada Lovelace');
  });
});
