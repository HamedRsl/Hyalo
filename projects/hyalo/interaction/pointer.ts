import { DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { HyMotion, HySceneLight, type HyPointerHandlers } from '@hyalo/angular/motion';
export type PointerHandlers = HyPointerHandlers;

export function bindPointer(handlers: () => PointerHandlers): void {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const scene = inject(HySceneLight),
    destroy = inject(DestroyRef);
  afterNextRender(() => {
    const unregister = scene.register(host, handlers());
    destroy.onDestroy(unregister);
  });
}

export interface HyCssSetter {
  (value: number): void;
  destroy(): void;
}
export function cssVarSetter(
  el: HTMLElement,
  name: string,
  unit: string,
  motion: HyMotion,
  vars: Record<string, unknown>,
): HyCssSetter {
  let quick: ((value: number) => unknown) | undefined;
  let engine: Awaited<ReturnType<HyMotion['gsap']>>;
  let disposed = false;
  void motion.gsap().then((gsap) => {
    if (!gsap || disposed) return;
    engine = gsap;
    el.classList.add('hy-gsap');
    // quickTo preserves a custom property's existing unit instead of appending one.
    if (!el.style.getPropertyValue(name)) el.style.setProperty(name, `0${unit}`);
    quick = gsap.quickTo(el, name, vars);
  });
  const set = ((value: number): void => {
    if (disposed) return;
    if (quick && motion.enabled()) quick(value);
    else {
      engine?.killTweensOf(el);
      el.style.setProperty(name, `${value}${unit}`);
    }
  }) as HyCssSetter;
  set.destroy = () => {
    disposed = true;
    engine?.killTweensOf(el);
    quick = undefined;
  };
  return set;
}
