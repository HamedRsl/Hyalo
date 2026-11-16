import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyFidelity, HyMotion, provideHyalo } from '@hyalo/angular';
import { gsap } from 'gsap';
import { cssVarSetter } from './pointer';
import { HyTilt } from './tilt';
import { HyMagnetic } from './magnetic';

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

@Component({
  imports: [HyTilt, HyMagnetic],
  template: '<div hyTilt>Tilt</div><button hyMagnetic>Magnetic</button>',
})
class PointerHost {}

describe('live pointer motion preferences', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(private readonly callback: IntersectionObserverCallback) {}
        observe(target: Element): void {
          this.callback(
            [{ target, isIntersecting: true } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
        }
        unobserve(): void {}
        disconnect(): void {}
      },
    );
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: query.includes('hover: hover'),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    TestBed.configureTestingModule({ providers: [provideHyalo({ fidelity: 'high' })] });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each(['reduced', 'low'])(
    'resets active effects when %s is selected and can resume',
    async (preference) => {
      const fixture = TestBed.createComponent(PointerHost);
      await fixture.whenStable();
      const tilt: HTMLElement = fixture.nativeElement.querySelector('[hyTilt]');
      const magnetic: HTMLElement = fixture.nativeElement.querySelector('[hyMagnetic]');
      const move = (element: HTMLElement): void => {
        element.dispatchEvent(
          new PointerEvent('pointermove', { pointerType: 'mouse', clientX: 80, clientY: 30 }),
        );
      };
      for (const element of [tilt, magnetic]) {
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
          left: 0,
          top: 0,
          width: 100,
          height: 100,
          right: 100,
          bottom: 100,
        } as DOMRect);
        element.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
        move(element);
      }
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      expect(parseFloat(tilt.style.getPropertyValue('--hy-ry'))).toBeGreaterThan(0);
      expect(parseFloat(magnetic.style.getPropertyValue('--hy-mx'))).toBeGreaterThan(0);
      const motion = TestBed.inject(HyMotion);
      const fidelity = TestBed.inject(HyFidelity);
      if (preference === 'reduced') motion.setReduced(true);
      else fidelity.setTier('low');
      await fixture.whenStable();
      expect(tilt.style.getPropertyValue('--hy-ry')).toBe('0deg');
      expect(magnetic.style.getPropertyValue('--hy-mx')).toBe('0px');
      move(tilt);
      move(magnetic);
      expect(tilt.style.getPropertyValue('--hy-ry')).toBe('0deg');
      expect(magnetic.style.getPropertyValue('--hy-mx')).toBe('0px');
      motion.setReduced(false);
      fidelity.setTier('high');
      await fixture.whenStable();
      move(tilt);
      move(tilt);
      move(magnetic);
      move(magnetic);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      expect(parseFloat(tilt.style.getPropertyValue('--hy-ry'))).toBeGreaterThan(0);
      expect(parseFloat(magnetic.style.getPropertyValue('--hy-mx'))).toBeGreaterThan(0);
      fixture.destroy();
      motion.setReduced(null);
    },
  );
});
