import { TestBed } from '@angular/core/testing';
import { HyMotion, provideHyalo } from '@hyalo/angular';
import { gsap } from 'gsap';
import { cssVarSetter } from './pointer';

describe('pointer CSS setters with GSAP', () => {
  const elements: HTMLElement[] = [];
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHyalo({ gsap: async () => gsap })],
    }),
  );
  afterEach(() => {
    elements.forEach((element) => {
      gsap.killTweensOf(element);
      element.remove();
    });
    elements.length = 0;
    vi.restoreAllMocks();
  });

  it.each([
    ['--hy-rx', 'deg', 6],
    ['--hy-mx', 'px', 12],
  ] as const)('keeps the unit for %s after a tween completes', async (name, unit, value) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    elements.push(element);
    const warning = vi.spyOn(console, 'warn');
    const motion = TestBed.inject(HyMotion);
    const set = cssVarSetter(element, name, unit, motion, { duration: 0.1 });
    await motion.gsap();
    set(value);
    gsap.getTweensOf(element).forEach((tween) => tween.progress(1));
    expect(element.style.getPropertyValue(name)).toBe(value + unit);
    expect(warning).not.toHaveBeenCalled();
  });

  it('keeps the last fallback position when the optional loader resolves', async () => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    elements.push(element);
    const motion = TestBed.inject(HyMotion);
    const set = cssVarSetter(element, '--hy-ry', 'deg', motion, { duration: 0.1 });
    set(-4);
    await motion.gsap();
    expect(element.style.getPropertyValue('--hy-ry')).toBe('-4deg');
    set(8);
    gsap.getTweensOf(element).forEach((tween) => tween.progress(1));
    expect(element.style.getPropertyValue('--hy-ry')).toBe('8deg');
  });
});
