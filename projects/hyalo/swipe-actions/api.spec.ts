import { TestBed } from '@angular/core/testing';
import { HyMotion } from '@hyalo/angular/motion';
import { HySwipeActions } from './swipe-actions';
describe('swipe action programmatic controls', () => {
  it('reports signed reveal metrics, rejects unavailable rails, and closes disabled rows', async () => {
    TestBed.inject(HyMotion).setReduced(true);
    const f = TestBed.createComponent(HySwipeActions);
    f.componentRef.setInput('label', 'Message');
    f.componentRef.setInput('endActions', [{ id: 'remove', label: 'Remove' }]);
    await f.whenStable();
    expect(f.componentInstance.reveal('start')).toBe(false);
    expect(f.componentInstance.reveal('end')).toBe(true);
    expect(f.componentInstance.getOpenAmount()).toBe(-88);
    expect(f.componentInstance.getSlidingRatio()).toBe(-1);
    f.componentRef.setInput('disabled', true);
    await f.whenStable();
    expect(f.componentInstance.getOpenAmount()).toBe(0);
    expect(f.componentInstance.reveal('end')).toBe(false);
    TestBed.inject(HyMotion).setReduced(null);
  });
});
