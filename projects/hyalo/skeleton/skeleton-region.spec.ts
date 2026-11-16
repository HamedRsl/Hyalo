import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HySkeleton } from './skeleton';
import { HySkeletonRegion } from './skeleton-region';
import { expectNoAxeViolations } from '../src/testing/axe';

@Component({
  imports: [HySkeleton, HySkeletonRegion],
  template: '<hy-skeleton-region [label]="label()"><hy-skeleton /></hy-skeleton-region>',
})
class Host {
  readonly label = signal('Loading account');
}

describe('HySkeletonRegion', () => {
  it('announces once beside silent placeholders without hiding the announcement as busy', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const region = f.nativeElement.querySelector('hy-skeleton-region');
    expect(region.hasAttribute('aria-busy')).toBe(false);
    expect(region.querySelector('[role=status]').textContent).toBe('Loading account');
    expect(region.querySelector('hy-skeleton').getAttribute('aria-hidden')).toBe('true');
    f.componentInstance.label.set('Loading report');
    await f.whenStable();
    expect(region.querySelectorAll('[role=status]')).toHaveLength(1);
    expect(region.querySelector('[role=status]').textContent).toBe('Loading report');
    await expectNoAxeViolations(f.nativeElement);
  });
});
