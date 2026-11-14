import { TestBed } from '@angular/core/testing';
import { HyFidelity, HyMotion } from '@hyalo/angular';
import { HySkeleton } from './skeleton';

describe('HySkeleton animation modes', () => {
  it('supports pulse and static modes while honoring motion and fidelity', async () => {
    const fixture = TestBed.createComponent(HySkeleton);
    await fixture.whenStable();
    fixture.componentRef.setInput('animation', 'pulse');
    await fixture.whenStable();
    expect(fixture.nativeElement.dataset['animation']).toBe('pulse');
    expect(fixture.nativeElement.dataset['animate']).toBe('true');
    fixture.componentRef.setInput('animation', 'none');
    await fixture.whenStable();
    expect(fixture.nativeElement.dataset['animate']).toBe('false');
    fixture.componentRef.setInput('animation', 'shimmer');
    TestBed.inject(HyFidelity).setTier('low');
    await fixture.whenStable();
    expect(fixture.nativeElement.dataset['animate']).toBe('false');
    TestBed.inject(HyFidelity).setTier('high');
    TestBed.inject(HyMotion).setReduced(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.dataset['animate']).toBe('false');
    TestBed.inject(HyMotion).setReduced(null);
  });
});
