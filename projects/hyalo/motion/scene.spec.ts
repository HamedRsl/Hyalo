import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyMotion, provideHyalo } from '@hyalo/angular';
import { HySceneLight, HySceneLightDirective } from './scene';

class Observer {
  static all: Observer[] = [];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options: IntersectionObserverInit,
  ) {
    Observer.all.push(this);
  }
  emit(target: Element, isIntersecting: boolean): void {
    this.callback(
      [{ target, isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}
@Component({ imports: [HySceneLightDirective], template: '<div hySceneLight></div>' })
class SceneHost {}

describe('shared scene light lifecycle', () => {
  let frames: Map<number, FrameRequestCallback>;
  let serial: number;
  const hosts: HTMLElement[] = [];
  const host = (): HTMLElement => {
    const element = document.createElement('div');
    document.body.append(element);
    hosts.push(element);
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    return element;
  };
  const move = (pointerType = 'mouse'): void => {
    document.dispatchEvent(
      new PointerEvent('pointermove', { pointerType, clientX: 25, clientY: 50 }),
    );
  };
  const flush = (): void => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  };
  beforeEach(() => {
    Observer.all = [];
    frames = new Map();
    serial = 0;
    vi.stubGlobal('IntersectionObserver', Observer);
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('hover: hover'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++serial, callback);
      return serial;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
    TestBed.configureTestingModule({ providers: [provideHyalo({ fidelity: 'high' })] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    hosts.splice(0).forEach((element) => element.remove());
    document.documentElement.removeAttribute('data-hy-motion');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('isolates the same host registered under nested roots', () => {
    const scene = TestBed.inject(HySceneLight),
      element = host(),
      outer = host(),
      inner = host();
    outer.append(inner);
    inner.append(element);
    const outerMove = vi.fn(),
      innerMove = vi.fn();
    scene.register(element, { move: outerMove }, false, outer);
    scene.register(element, { move: innerMove }, false, inner);
    Observer.all[0]!.emit(element, true);
    move();
    flush();
    expect(outerMove).toHaveBeenCalledOnce();
    expect(innerMove).not.toHaveBeenCalled();
  });

  it('shares one observer per root and keeps observing until its last registration leaves', () => {
    const scene = TestBed.inject(HySceneLight),
      element = host();
    const first = scene.register(element, { move: vi.fn() });
    const second = scene.register(element, { move: vi.fn() });
    expect(Observer.all).toHaveLength(1);
    first();
    expect(Observer.all[0]!.unobserve).not.toHaveBeenCalled();
    second();
    expect(Observer.all[0]!.disconnect).toHaveBeenCalledOnce();
  });

  it('unobserves a removed root registration while retaining the other root', () => {
    const scene = TestBed.inject(HySceneLight),
      element = host(),
      root = host();
    const remove = scene.register(element, { move: vi.fn() }, false, root);
    scene.register(element, { move: vi.fn() });
    remove();
    expect(Observer.all[0]!.unobserve).toHaveBeenCalledWith(element);
    expect(Observer.all[1]!.unobserve).not.toHaveBeenCalled();
  });

  it('batches all reads before writes and caches geometry until scroll', () => {
    const scene = TestBed.inject(HySceneLight),
      order: string[] = [];
    flush();
    const elements = [host(), host()];
    for (const element of elements) {
      vi.mocked(element.getBoundingClientRect).mockImplementation(() => {
        order.push('read');
        return new DOMRect(0, 0, 100, 100);
      });
      scene.register(element, { move: () => order.push('write') });
      Observer.all[0]!.emit(element, true);
    }
    move();
    move();
    expect(frames.size).toBe(1);
    flush();
    expect(order).toEqual(['read', 'read', 'write', 'write']);
    order.length = 0;
    move();
    flush();
    expect(order).toEqual(['write', 'write']);
    order.length = 0;
    document.dispatchEvent(new Event('scroll'));
    flush();
    expect(order).toEqual(['read', 'read', 'write', 'write']);
  });

  it('resets offscreen, removed, cancelled, hidden and reduced-motion participants', () => {
    const scene = TestBed.inject(HySceneLight),
      element = host();
    const leave = vi.fn(),
      moved = vi.fn();
    scene.register(element, { move: moved, leave });
    const enter = (): void => {
      Observer.all[0]!.emit(element, true);
      move();
      flush();
    };
    enter();
    Observer.all[0]!.emit(element, false);
    expect(leave).toHaveBeenCalledTimes(1);
    enter();
    element.remove();
    move();
    flush();
    expect(leave).toHaveBeenCalledTimes(2);
    document.body.append(element);
    enter();
    document.dispatchEvent(new Event('pointercancel'));
    expect(leave).toHaveBeenCalledTimes(3);
    enter();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(leave).toHaveBeenCalledTimes(4);
    move();
    expect(frames.size).toBe(0);
    vi.mocked(Object.getOwnPropertyDescriptor(document, 'hidden')!.get!).mockReturnValue(false);
    enter();
    TestBed.inject(HyMotion).setReduced(true);
    TestBed.tick();
    expect(leave).toHaveBeenCalledTimes(5);
    move();
    expect(frames.size).toBe(0);
  });

  it.each(['no observer', 'coarse pointer'])('has a static fallback with %s', (mode) => {
    if (mode === 'no observer') vi.stubGlobal('IntersectionObserver', undefined);
    else
      vi.stubGlobal('matchMedia', () => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
    const moved = vi.fn(),
      destroy = vi.fn();
    const unregister = TestBed.inject(HySceneLight).register(host(), { move: moved, destroy });
    move();
    flush();
    unregister();
    expect(moved).not.toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledOnce();
    expect(Observer.all).toHaveLength(0);
  });

  it('ignores touch and cancels pending work on final removal', () => {
    const moved = vi.fn(),
      destroy = vi.fn(),
      element = host();
    const unregister = TestBed.inject(HySceneLight).register(element, { move: moved, destroy });
    flush();
    Observer.all[0]!.emit(element, true);
    move('touch');
    expect(frames.size).toBe(0);
    move();
    expect(frames.size).toBe(1);
    unregister();
    flush();
    expect(moved).not.toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledOnce();
    move();
    expect(frames.size).toBe(0);
  });

  it('writes scene coordinates only to its host, never document or scene roots', async () => {
    const fixture = TestBed.createComponent(SceneHost);
    await fixture.whenStable();
    const element = fixture.nativeElement.firstElementChild as HTMLElement;
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    const rootWrite = vi.spyOn(document.documentElement.style, 'setProperty');
    const parentWrite = vi.spyOn(fixture.nativeElement.style, 'setProperty');
    Observer.all[0]!.emit(element, true);
    move();
    flush();
    expect(element.style.getPropertyValue('--hy-px')).toBe('25.0%');
    expect(element.style.getPropertyValue('--hy-py')).toBe('50.0%');
    expect(rootWrite).not.toHaveBeenCalled();
    expect(parentWrite).not.toHaveBeenCalled();
    fixture.destroy();
    expect(element.style.getPropertyValue('--hy-glow')).toBe('0');
  });
});
