import { TestBed } from '@angular/core/testing';
import { provideHyalo } from '../core/config';
import type { HyGsap } from '../core/gsap';
import { HyFidelity } from '../fidelity/fidelity';
import { HyMotion } from './motion';

describe('HyMotion', () => {
  afterEach(() => document.documentElement.removeAttribute('data-hy-motion'));

  it('can force reduced motion and mirrors it to the root element', () => {
    const motion = TestBed.inject(HyMotion);
    motion.setReduced(true);
    expect(motion.reduced()).toBe(true);
    expect(motion.enabled()).toBe(false);
    expect(document.documentElement.dataset['hyMotion']).toBe('reduced');
  });

  it('disables effects on the low tier', () => {
    const motion = TestBed.inject(HyMotion);
    TestBed.inject(HyFidelity).setTier('low');
    expect(motion.enabled()).toBe(false);
  });

  it('resolves gsap to null without a loader', async () => {
    expect(await TestBed.inject(HyMotion).gsap()).toBeNull();
  });

  it('loads gsap once through the configured loader', async () => {
    const fake = {} as HyGsap;
    const loader = vi.fn(() => Promise.resolve(fake));
    TestBed.configureTestingModule({ providers: [provideHyalo({ gsap: loader })] });
    const motion = TestBed.inject(HyMotion);
    expect(await motion.gsap()).toBe(fake);
    await motion.gsap();
    expect(loader).toHaveBeenCalledTimes(1);
  });
});
