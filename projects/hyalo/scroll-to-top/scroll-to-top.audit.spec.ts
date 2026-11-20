import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';
import { HyMotion } from '@hyalo/angular/motion';
import { HyScrollToTop } from './scroll-to-top';
@Component({ imports: [HyScrollToTop], template: `<ng-template #icon><b>UP</b></ng-template><hy-scroll-to-top [iconTemplate]="icon" [threshold]="-1" behavior="smooth" />` })
class Host {}
describe('scroll-to-top audit', () => {
  it('renders a custom icon and honors reduced motion over requested smooth behavior', async () => {
    const f = TestBed.createComponent(Host); await f.whenStable();
    const component = f.debugElement.query(By.directive(HyScrollToTop)).componentInstance as HyScrollToTop;
    expect(f.nativeElement.querySelector('button').textContent).toContain('UP');
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const reduced = vi.spyOn(TestBed.inject(HyMotion), 'reduced').mockReturnValue(true);
    component.scroll(); expect(scroll).toHaveBeenLastCalledWith({ top: 0, behavior: 'instant' });
    reduced.mockReturnValue(false); component.scroll(); expect(scroll).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' });
    reduced.mockRestore(); scroll.mockRestore();
  });
});
