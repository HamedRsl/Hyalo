import { TestBed } from '@angular/core/testing';
import { HyMotion } from '@hyalo/angular/motion';
import { HyPullRefresh } from './pull-refresh';
import { pointer } from '../src/testing/pointer';

describe('pull refresh lifecycle', () => {
  it('applies pull resistance and reports cancellation and completion without duplicate requests', async () => {
    TestBed.inject(HyMotion).setReduced(true);
    const f = TestBed.createComponent(HyPullRefresh);
    f.componentRef.setInput('label', 'Feed');
    f.componentRef.setInput('pullFactor', 0.5);
    const started = vi.fn();
    const ended = vi.fn();
    const refresh = vi.fn();
    f.componentInstance.started.subscribe(started);
    f.componentInstance.refreshEnded.subscribe(ended);
    f.componentInstance.refresh.subscribe(refresh);
    await f.whenStable();
    pointer(f.nativeElement, 'pointerdown', 0, 0);
    pointer(f.nativeElement, 'pointermove', 0, 100);
    expect(f.componentInstance.getProgress()).toBeCloseTo(50 / 72);
    pointer(f.nativeElement, 'pointercancel', 0, 100);
    expect(started).toHaveBeenCalledTimes(1);
    expect(ended).toHaveBeenCalledWith('cancel');
    expect(refresh).not.toHaveBeenCalled();
    f.componentInstance.request();
    f.componentInstance.request();
    expect(refresh).toHaveBeenCalledTimes(1);
    f.componentInstance.complete();
    f.componentInstance.complete();
    expect(ended.mock.calls.map((call) => call[0])).toEqual(['cancel', 'complete']);
    TestBed.inject(HyMotion).setReduced(null);
  });
});
