import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyMotion, provideHyalo } from '@hyalo/angular';
import { HyFlip, HyStagger } from './layout';

@Component({
  imports: [HyFlip, HyStagger],
  template:
    '<div hyFlip><button>Focus</button></div><section hyStagger><button>A</button><button>B</button></section>',
})
class LayoutHost {
  readonly flip = viewChild.required(HyFlip);
}

class VisibilityObserver {
  static current: VisibilityObserver;
  readonly disconnect = vi.fn();
  private target!: Element;
  constructor(private readonly callback: IntersectionObserverCallback) {
    VisibilityObserver.current = this;
  }
  observe(target: Element): void {
    this.target = target;
  }
  emit(isIntersecting: boolean): void {
    this.callback(
      [{ target: this.target, isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe('layout motion lifecycle', () => {
  let animations: { cancel: ReturnType<typeof vi.fn>; finish: () => void; reject: () => void }[];
  let animate: ReturnType<typeof vi.fn<Element['animate']>>;
  beforeEach(() => {
    animations = [];
    animate = vi.fn(() => {
      let finish!: () => void, reject!: () => void;
      const finished = new Promise<void>((resolve, fail) => {
        finish = resolve;
        reject = () => fail(new Error('cancelled'));
      });
      const animation = { cancel: vi.fn(), finished, finish, reject };
      animations.push(animation);
      return animation as unknown as Animation;
    });
    vi.stubGlobal('IntersectionObserver', VisibilityObserver);
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: animate });
    TestBed.configureTestingModule({ providers: [provideHyalo({ fidelity: 'high' })] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    Reflect.deleteProperty(Element.prototype, 'animate');
    document.documentElement.removeAttribute('data-hy-motion');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('FLIP applies the latest change, cancels interruption and preserves focus', async () => {
    const fixture = TestBed.createComponent(LayoutHost);
    await fixture.whenStable();
    const element = fixture.nativeElement.querySelector('[hyFlip]') as HTMLElement;
    const button = element.querySelector('button')!;
    button.focus();
    let left = 0;
    vi.spyOn(element, 'getBoundingClientRect').mockImplementation(
      () => new DOMRect(left, 0, 100, 100),
    );
    const flip = fixture.componentInstance.flip();
    flip.run(() => {
      left = 20;
    });
    await fixture.whenStable();
    expect(animate).toHaveBeenCalledOnce();
    expect((animate.mock.calls[0]![0] as Keyframe[])[0]!['transform']).toContain('translate(-20px');
    flip.run(() => {
      left = 40;
    });
    flip.run(() => {
      left = 60;
    });
    await fixture.whenStable();
    expect(animations[0]!.cancel).toHaveBeenCalled();
    expect(animate).toHaveBeenCalledTimes(2);
    expect(document.activeElement).toBe(button);
    fixture.destroy();
    expect(animations[1]!.cancel).toHaveBeenCalled();
  });

  it('FLIP never animates pending work after destroy or reduction and always runs state changes', async () => {
    const fixture = TestBed.createComponent(LayoutHost);
    await fixture.whenStable();
    const flip = fixture.componentInstance.flip(),
      change = vi.fn();
    TestBed.inject(HyMotion).setReduced(true);
    flip.run(change);
    await fixture.whenStable();
    expect(change).toHaveBeenCalledOnce();
    expect(animate).not.toHaveBeenCalled();
    TestBed.inject(HyMotion).setReduced(false);
    await fixture.whenStable();
    flip.run(change);
    fixture.destroy();
    await Promise.resolve();
    expect(change).toHaveBeenCalledTimes(2);
    expect(animate).not.toHaveBeenCalled();
  });

  it('stagger uses bounded delays, cancels offscreen and does not replay existing identities', async () => {
    const fixture = TestBed.createComponent(LayoutHost);
    await fixture.whenStable();
    expect(animate).not.toHaveBeenCalled();
    VisibilityObserver.current.emit(true);
    await fixture.whenStable();
    expect(animate).toHaveBeenCalledTimes(2);
    expect(animate.mock.calls.map((call) => (call[1] as KeyframeAnimationOptions).delay)).toEqual([
      0, 50,
    ]);
    VisibilityObserver.current.emit(false);
    await fixture.whenStable();
    animations.forEach((animation) => expect(animation.cancel).toHaveBeenCalledOnce());
    VisibilityObserver.current.emit(true);
    await fixture.whenStable();
    expect(animate).toHaveBeenCalledTimes(2);
    fixture.destroy();
    expect(VisibilityObserver.current.disconnect).toHaveBeenCalledOnce();
  });

  it('stagger cancels on document hiding and reduced motion without moving focus', async () => {
    const fixture = TestBed.createComponent(LayoutHost);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('section button') as HTMLButtonElement;
    button.focus();
    VisibilityObserver.current.emit(true);
    await fixture.whenStable();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await fixture.whenStable();
    animations.forEach((animation) => expect(animation.cancel).toHaveBeenCalledOnce());
    TestBed.inject(HyMotion).setReduced(true);
    await fixture.whenStable();
    expect(document.activeElement).toBe(button);
    animations.forEach((animation) => animation.reject());
    await Promise.resolve();
  });

  it('stagger tracks inserted identities, clamps delays and disconnects on destroy', async () => {
    const fixture = TestBed.createComponent(LayoutHost);
    await fixture.whenStable();
    VisibilityObserver.current.emit(true);
    await fixture.whenStable();
    animations.forEach((animation) => animation.finish());
    await Promise.resolve();
    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    const existing = section.firstElementChild!;
    existing.remove();
    section.append(existing);
    await Promise.resolve();
    expect(animate).toHaveBeenCalledTimes(2);
    for (let index = 0; index < 10; index++) section.append(document.createElement('button'));
    await Promise.resolve();
    expect(animate).toHaveBeenCalledTimes(12);
    expect(
      animate.mock.calls.slice(2).map((call) => (call[1] as KeyframeAnimationOptions).delay),
    ).toEqual([0, 50, 100, 150, 200, 250, 300, 300, 300, 300]);
    fixture.destroy();
    expect(animations[0]!.cancel).not.toHaveBeenCalled();
    animations.slice(2).forEach((animation) => expect(animation.cancel).toHaveBeenCalledOnce());
    section.append(document.createElement('button'));
    await Promise.resolve();
    expect(animate).toHaveBeenCalledTimes(12);
  });

  it('stagger falls back without IO and leaves reduced-motion children visible without replay', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    TestBed.inject(HyMotion).setReduced(true);
    const fixture = TestBed.createComponent(LayoutHost);
    await fixture.whenStable();
    expect(animate).not.toHaveBeenCalled();
    TestBed.inject(HyMotion).setReduced(false);
    await fixture.whenStable();
    expect(animate).not.toHaveBeenCalled();
    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    section.append(document.createElement('button'));
    await Promise.resolve();
    expect(animate).toHaveBeenCalledOnce();
    fixture.destroy();
    expect(animations[0]!.cancel).toHaveBeenCalledOnce();
  });

  it('FLIP retains state changes with no WAAPI or zero-sized final bounds', async () => {
    const fixture = TestBed.createComponent(LayoutHost);
    await fixture.whenStable();
    const element = fixture.nativeElement.querySelector('[hyFlip]') as HTMLElement;
    const change = vi.fn();
    fixture.componentInstance.flip().run(change);
    await fixture.whenStable();
    expect(animate).not.toHaveBeenCalled();
    Object.defineProperty(element, 'animate', { value: undefined });
    fixture.componentInstance.flip().run(change);
    await fixture.whenStable();
    expect(change).toHaveBeenCalledTimes(2);
    expect(animate).not.toHaveBeenCalled();
  });

  it('stagger cancels active animations on reduction and preserves visible children', async () => {
    const fixture = TestBed.createComponent(LayoutHost);
    await fixture.whenStable();
    VisibilityObserver.current.emit(true);
    await fixture.whenStable();
    expect(animate).toHaveBeenCalledTimes(2);
    TestBed.inject(HyMotion).setReduced(true);
    await fixture.whenStable();
    animations.forEach((animation) => expect(animation.cancel).toHaveBeenCalledOnce());
    TestBed.inject(HyMotion).setReduced(false);
    await fixture.whenStable();
    expect(animate).toHaveBeenCalledTimes(2);
  });

  it('FLIP cancels active motion when the preference changes', async () => {
    const fixture = TestBed.createComponent(LayoutHost);
    await fixture.whenStable();
    const element = fixture.nativeElement.querySelector('[hyFlip]') as HTMLElement;
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    fixture.componentInstance.flip().run(() => {});
    await fixture.whenStable();
    expect(animate).toHaveBeenCalledOnce();
    TestBed.inject(HyMotion).setReduced(true);
    await fixture.whenStable();
    expect(animations[0]!.cancel).toHaveBeenCalledOnce();
  });
});
