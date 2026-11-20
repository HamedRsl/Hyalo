import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';
import { HyRating } from './rating';
@Component({ imports: [HyRating], template: `<ng-template #icon let-value let-preview="preview"><b>{{value}}:{{preview}}</b></ng-template><hy-rating orientation="vertical" [iconTemplate]="icon" [tooltipFormatter]="tooltip" />` })
class Host { tooltip = (n: number) => 'Score ' + n; }
describe('rating visual and preview contracts', () => {
  it('previews hover without committing and renders custom icons/tooltips', async () => {
    const f = TestBed.createComponent(Host); await f.whenStable();
    const rating = f.debugElement.query(By.directive(HyRating)).componentInstance as HyRating;
    const preview = vi.fn(); rating.previewChanged.subscribe(preview);
    const label: HTMLLabelElement = f.nativeElement.querySelector('label');
    expect(f.nativeElement.querySelector('[role="radiogroup"]').getAttribute('aria-orientation')).toBe('vertical');
    expect(label.title).toBe('Score 1');
    label.dispatchEvent(new Event('pointerenter')); await f.whenStable();
    expect(label.textContent).toContain('1:true'); expect(preview).toHaveBeenCalledWith(1);
    expect(rating.value()).toBe(0);
    label.dispatchEvent(new Event('pointerleave')); expect(preview).toHaveBeenLastCalledWith(null);
  });
});
