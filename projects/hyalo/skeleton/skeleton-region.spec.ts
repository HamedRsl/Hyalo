import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HySkeleton } from './skeleton';
import { HySkeletonRegion } from './skeleton-region';
import { expectNoAxeViolations } from '../src/testing/axe';

@Component({
  imports: [HySkeleton, HySkeletonRegion],
  template: `
    <hy-skeleton-region [label]="label()">
      <div class="profile-placeholder">
        <hy-skeleton shape="circle" width="3rem" height="3rem" />
        <hy-skeleton width="40%" />
        <hy-skeleton width="70%" />
        <hy-skeleton shape="rect" height="8rem" />
      </div>
    </hy-skeleton-region>
  `,
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
    expect(region.querySelectorAll('.profile-placeholder hy-skeleton')).toHaveLength(4);
    expect(region.querySelectorAll('hy-skeleton[aria-hidden="true"]')).toHaveLength(4);
    expect(region.querySelector('hy-skeleton').style.inlineSize).toBe('3rem');
    f.componentInstance.label.set('Loading report');
    await f.whenStable();
    expect(region.querySelectorAll('[role=status]')).toHaveLength(1);
    expect(region.querySelector('[role=status]').textContent).toBe('Loading report');
    await expectNoAxeViolations(f.nativeElement);
  });
});
