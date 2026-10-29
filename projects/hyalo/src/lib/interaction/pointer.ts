import { DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { HyMotion } from '../motion/motion';
import { matchesMedia } from '../core/platform';

/** Handlers that run outside change detection. */
export interface PointerHandlers {
  enter?(event: PointerEvent, rect: DOMRect): void;
  move(event: PointerEvent, rect: DOMRect): void;
  leave?(): void;
}

/**
 * Wires pointer listeners straight to the DOM, so high-frequency
 * `pointermove` events never schedule change detection. Listeners are only
 * attached on devices with a fine pointer, and they do nothing while motion
 * is disabled.
 */
export function bindPointer(handlers: () => PointerHandlers): void {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const motion = inject(HyMotion);
  const destroyRef = inject(DestroyRef);

  afterNextRender(() => {
    if (!matchesMedia('(hover: hover) and (pointer: fine)')) return;
    const h = handlers();
    let rect: DOMRect | null = null;
    let active = false;

    const enter = (event: PointerEvent): void => {
      if (!motion.enabled() || event.pointerType === 'touch') return;
      active = true;
      rect = host.getBoundingClientRect();
      h.enter?.(event, rect);
    };
    const move = (event: PointerEvent): void => {
      if (!active) return enter(event);
      if (!rect) return;
      h.move(event, rect);
    };
    const leave = (): void => {
      if (!active) return;
      active = false;
      rect = null;
      h.leave?.();
    };

    host.addEventListener('pointerenter', enter, { passive: true });
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerleave', leave, { passive: true });
    destroyRef.onDestroy(() => {
      host.removeEventListener('pointerenter', enter);
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
    });
  });
}

/**
 * Returns a setter for one CSS custom property. Uses GSAP `quickTo` when GSAP
 * is available, so values glide, and a plain `style.setProperty` otherwise,
 * where a CSS transition does the smoothing.
 */
export function cssVarSetter(
  el: HTMLElement,
  name: string,
  unit: string,
  motion: HyMotion,
  vars: Record<string, unknown>,
): (value: number) => void {
  let quick: ((value: number) => unknown) | null = null;
  void motion.gsap().then((gsap) => {
    if (!gsap) return;
    el.classList.add('hy-gsap');
    quick = gsap.quickTo(el, name, { ...vars, unit });
  });
  return (value) => {
    if (quick) quick(value);
    else el.style.setProperty(name, `${value}${unit}`);
  };
}
