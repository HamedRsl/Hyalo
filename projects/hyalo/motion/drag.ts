import { InjectionToken, type Provider, inject } from '@angular/core';
import { HySpring, HyVelocityTracker, SPRINGS, project, rubberband } from './runtime/spring';

export interface HyGestureConfig {
  readonly slop: number;
  readonly swipeThreshold: number;
  readonly refreshThreshold: number;
}
const DEFAULTS: HyGestureConfig = { slop: 10, swipeThreshold: 80, refreshThreshold: 72 };
export const HY_GESTURE_CONFIG = new InjectionToken<HyGestureConfig>('HY_GESTURE_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULTS,
});
export function provideHyGestures(config: Partial<HyGestureConfig>): Provider {
  return {
    provide: HY_GESTURE_CONFIG,
    useFactory: (): HyGestureConfig => ({
      ...(inject(HY_GESTURE_CONFIG, { optional: true, skipSelf: true }) ?? DEFAULTS),
      ...config,
    }),
  };
}
export interface HyDragEnd {
  readonly value: number;
  readonly velocity: number;
  readonly projected: number;
  readonly cancelled: boolean;
}
export interface HyDragOptions {
  readonly axis: 'x' | 'y';
  readonly sign?: () => number;
  readonly factor?: () => number;
  readonly slop?: number;
  readonly enabled?: () => boolean;
  readonly motion?: () => boolean;
  readonly canStart?: (event: PointerEvent) => boolean;
  readonly limits?: () => readonly [number, number];
  readonly paint: (value: number) => void;
  readonly started?: () => void;
  readonly ended: (event: HyDragEnd) => void;
}

/** One pointer owns one spring; cancellation never invokes a completion action. */
export class HyDragController {
  readonly spring: HySpring;
  private readonly abort: AbortController;
  private press: {
    id: number;
    along: number;
    across: number;
    from: number;
    active: boolean;
  } | null = null;
  private readonly tracker = new HyVelocityTracker();
  private pending?: { value: number; done?: () => void };
  private swallowTimer?: ReturnType<typeof setTimeout>;
  private readonly swallow = (event: Event): void => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  constructor(
    private readonly element: HTMLElement,
    private readonly options: HyDragOptions,
  ) {
    this.abort = new (element.ownerDocument.defaultView?.AbortController ?? AbortController)();
    this.spring = new HySpring(0, options.paint);
    const signal = this.abort.signal;
    element.addEventListener('pointerdown', this.down, { signal });
    element.addEventListener('pointermove', this.move, { signal, passive: false });
    element.ownerDocument.addEventListener('pointerup', this.release, { signal });
    element.ownerDocument.addEventListener('pointercancel', this.release, { signal });
    element.addEventListener('lostpointercapture', this.lost, { signal });
    element.ownerDocument.addEventListener('visibilitychange', this.hidden, { signal });
  }
  private along(event: PointerEvent): number {
    return (
      (this.options.axis === 'x' ? event.clientX : event.clientY) * (this.options.sign?.() ?? 1)
    );
  }
  private across(event: PointerEvent): number {
    return this.options.axis === 'x' ? event.clientY : event.clientX;
  }
  private readonly down = (event: PointerEvent): void => {
    if (event.button !== 0 || !event.isPrimary || this.press || this.options.enabled?.() === false)
      return;
    if (this.options.canStart && !this.options.canStart(event)) return;
    this.press = {
      id: event.pointerId,
      along: this.along(event),
      across: this.across(event),
      from: this.spring.value,
      active: false,
    };
  };
  private readonly move = (event: PointerEvent): void => {
    const p = this.press;
    if (!p || p.id !== event.pointerId) return;
    if (this.options.enabled?.() === false) {
      this.cancel();
      return;
    }
    const delta = this.along(event) - p.along;
    const slop = Number.isFinite(this.options.slop) ? Math.max(0, this.options.slop ?? 10) : 10;
    if (!p.active) {
      const cross = Math.abs(this.across(event) - p.across);
      if (cross > slop && cross > Math.abs(delta)) {
        this.press = null;
        return;
      }
      if (Math.abs(delta) < slop) return;
      p.active = true;
      this.pending = undefined;
      this.spring.stop();
      this.options.started?.();
      this.tracker.reset();
      this.tracker.add(p.from, event.timeStamp);
      this.element.dataset['dragging'] = '';
      try {
        this.element.setPointerCapture(p.id);
      } catch {
        /* A native cancellation can precede pointer capture. */
      }
    }
    event.preventDefault();
    const factor = this.options.factor?.() ?? 1;
    let value = p.from + delta * (Number.isFinite(factor) && factor > 0 ? factor : 1);
    const limits = this.options.limits?.();
    if (limits) {
      const span = Math.max(1, limits[1] - limits[0]);
      if (value < limits[0]) value = limits[0] + rubberband(value - limits[0], span);
      if (value > limits[1]) value = limits[1] + rubberband(value - limits[1], span);
    }
    this.tracker.add(value, event.timeStamp);
    this.spring.set(value);
  };
  private readonly release = (event: PointerEvent): void => {
    const p = this.press;
    if (!p || p.id !== event.pointerId) return;
    this.press = null;
    delete this.element.dataset['dragging'];
    if (!p.active) return;
    const cancelled = event.type === 'pointercancel';
    const velocity = cancelled ? 0 : this.tracker.velocity(event.timeStamp);
    this.element.addEventListener('click', this.swallow, { capture: true, once: true });
    clearTimeout(this.swallowTimer);
    this.swallowTimer = setTimeout(
      () => this.element.removeEventListener('click', this.swallow, true),
      0,
    );
    this.options.ended({
      value: this.spring.value,
      velocity,
      projected: this.spring.value + project(velocity),
      cancelled,
    });
  };
  private readonly lost = (event: PointerEvent): void => {
    if (this.press?.id === event.pointerId) this.cancel();
  };
  private readonly hidden = (): void => {
    if (!this.element.ownerDocument.hidden) return;
    if (this.press) this.cancel();
    else if (this.pending) {
      const pending = this.pending;
      this.pending = undefined;
      this.spring.set(pending.value);
      pending.done?.();
    }
  };
  settle(value: number, velocity = 0, done?: () => void): void {
    this.pending = { value, done };
    const finish = (): void => {
      this.pending = undefined;
      done?.();
    };
    if (this.options.motion?.() === false || this.element.ownerDocument.hidden) {
      this.spring.set(value);
      finish();
    } else
      this.spring.to(value, {
        ...(velocity ? SPRINGS.momentum : SPRINGS.settle),
        velocity,
        onRest: finish,
      });
  }
  cancel(): void {
    const p = this.press;
    this.press = null;
    this.pending = undefined;
    delete this.element.dataset['dragging'];
    if (p?.active) {
      this.spring.set(p.from);
      this.options.ended({ value: p.from, velocity: 0, projected: p.from, cancelled: true });
    } else this.spring.stop();
  }
  destroy(): void {
    this.pending = undefined;
    this.abort.abort();
    this.spring.stop();
    clearTimeout(this.swallowTimer);
    this.element.removeEventListener('click', this.swallow, true);
    this.press = null;
    delete this.element.dataset['dragging'];
  }
}
