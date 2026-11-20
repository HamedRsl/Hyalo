import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyDivider } from './divider';
@Component({
  imports: [HyDivider],
  template: `<hy-divider [align]="align()" inset="12px">Or continue</hy-divider>`,
})
class Host {
  readonly align = signal<'start' | 'center' | 'end'>('start');
}
describe('labeled divider', () => {
  it('creates a genuine flex label layout and logical alignment ratios without losing inset', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const divider: HTMLElement = f.nativeElement.querySelector('hy-divider');
    expect(getComputedStyle(divider).display).toBe('flex');
    expect(divider.style.marginInlineStart).toBe('12px');
    expect(getComputedStyle(divider).getPropertyValue('--hy-divider-before').trim()).toBe('1');
    expect(getComputedStyle(divider).getPropertyValue('--hy-divider-after').trim()).toBe('9');
    f.componentInstance.align.set('end');
    await f.whenStable();
    expect(getComputedStyle(divider).getPropertyValue('--hy-divider-before').trim()).toBe('9');
    f.componentInstance.align.set('center');
    await f.whenStable();
    expect(getComputedStyle(divider).getPropertyValue('--hy-divider-before').trim()).toBe('1');
    expect(getComputedStyle(divider).getPropertyValue('--hy-divider-after').trim()).toBe('1');
    expect(divider.querySelector('span')?.textContent).toBe('Or continue');
  });
});
