import { HyMotion } from '@hyalo/angular/motion';
import { HyFidelity } from '@hyalo/angular/core';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_CARD_STACK } from './card-stack';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HY_CARD_STACK],
  template:
    '<hy-card-stack #stack label="Accounts" [items]="items" [itemKey]="key"><ng-template [hyStackItem]="stack" let-item><h3>{{ item.label }}</h3><button type="button">Details</button></ng-template></hy-card-stack>',
})
class Host {
  readonly items = [
    { id: 1, label: 'Main account' },
    { id: 2, label: 'Savings' },
  ];
  readonly key = (item: { id: number }): number => item.id;
}
describe('HyCardStack', () => {
  it('keeps inactive cards inert and changes the active card through native controls', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('.card[aria-hidden=true]').length).toBe(1);
    expect(f.nativeElement.querySelector('.card[aria-hidden=true]').inert).toBe(true);
    expect(f.nativeElement.querySelector('.active').textContent).toContain('Main account');
    f.nativeElement.querySelector('.actions button:last-child').click();
    await f.whenStable();
    expect(f.nativeElement.querySelector('.active').textContent).toContain('Savings');
    expect(f.nativeElement.querySelector('.actions button:last-child').disabled).toBe(true);
    await expectNoAxeViolations(f.nativeElement);
  });
});

describe('card stack motion', () => {
  it('moves the outgoing card below the deck and cancels motion when reduced', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate');
    const events: Keyframe[][] = [];
    const cancel = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: (frames: Keyframe[]): Animation => {
        events.push(frames);
        return { cancel, finished: new Promise<void>(() => {}) } as unknown as Animation;
      },
    });
    vi.stubGlobal('IntersectionObserver', undefined);
    TestBed.inject(HyFidelity).setTier('high');
    TestBed.inject(HyMotion).setReduced(false);
    const f = TestBed.createComponent(Host);
    try {
      await f.whenStable();
      f.nativeElement.querySelector('.actions button:last-child').click();
      await f.whenStable();
      expect(
        events.some(
          (frames) => frames.length === 3 && frames[0]?.['zIndex'] === 6 && frames[2]?.['zIndex'] === 0,
        ),
      ).toBe(true);
      const count = events.length;
      TestBed.inject(HyMotion).setReduced(true);
      await f.whenStable();
      f.nativeElement.querySelector('.actions button').click();
      await f.whenStable();
      expect(events).toHaveLength(count);
      expect(cancel).toHaveBeenCalled();
      expect(f.nativeElement.querySelector('[data-stack-exit]')).toBeNull();
    } finally {
      f.destroy();
      if (descriptor) Object.defineProperty(HTMLElement.prototype, 'animate', descriptor);
      else Reflect.deleteProperty(HTMLElement.prototype, 'animate');
      vi.unstubAllGlobals();
      TestBed.inject(HyMotion).setReduced(null);
      TestBed.inject(HyFidelity).setTier(null);
    }
  });
});
