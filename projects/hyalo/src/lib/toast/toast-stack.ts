import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
} from '@angular/core';
import { HyIcon } from '../icon/icon';
import { HyFidelity } from '../fidelity/fidelity';
import { HyMotion, MOTION } from '../motion/motion';
import { HySpring, HyVelocityTracker, SPRINGS, project } from '../motion/spring';
import { HyToaster, type HyToastItem } from './toaster';

/** How far a swipe has to be headed before it dismisses, in px. */
const SWIPE_DISTANCE = 80;
/** Movement before a press turns into a swipe, in px. */
const SLOP = 8;

interface Swipe {
  readonly el: HTMLElement;
  readonly id: number;
  readonly spring: HySpring;
  readonly tracker: HyVelocityTracker;
  startX: number;
  readonly startY: number;
  dragging: boolean;
}

/** @internal The visible stack of toasts. Created by HyToaster. */
@Component({
  selector: 'hy-toast-stack',
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-toast-stack',
    role: 'region',
    'aria-label': 'Notifications',
    '(pointerenter)': "toaster.pause('hover')",
    '(pointerleave)': "toaster.resume('hover')",
    '(focusin)': "toaster.pause('focus')",
    '(focusout)': 'onFocusOut($event)',
  },
  templateUrl: './toast-stack.html',
})
export class HyToastStack {
  protected readonly toaster = inject(HyToaster);
  private readonly fidelity = inject(HyFidelity);
  private readonly motion = inject(HyMotion);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly springs = new WeakMap<HTMLElement, HySpring>();
  private swipe: Swipe | null = null;
  /** Layout position of each toast after the last render, for the slide. */
  private tops = new Map<number, number>();

  protected readonly material = computed(() =>
    this.fidelity.tier() === 'low' ? 'solid' : 'frosted',
  );

  constructor() {
    afterRenderEffect(() => {
      this.toaster.items();
      // Removing the focused toast drops focus without a reliable focusout.
      if (!this.host.contains(this.host.ownerDocument.activeElement)) {
        this.toaster.resume('focus');
      }
      this.slideIntoPlace();
    });
  }

  protected onFocusOut(event: FocusEvent): void {
    // Moving between buttons inside the stack keeps the timers paused.
    if (!this.host.contains(event.relatedTarget as Node | null)) this.toaster.resume('focus');
  }

  protected onDown(event: PointerEvent): void {
    if (event.button !== 0 || (event.target as Element).closest('button')) return;
    const el = event.currentTarget as HTMLElement;
    const spring = this.springFor(el);
    // A toast still springing back is caught where it is.
    const caught = spring.running;
    spring.stop();
    this.swipe = {
      el,
      id: event.pointerId,
      spring,
      tracker: new HyVelocityTracker(),
      startX: event.clientX - spring.value,
      startY: event.clientY,
      dragging: false,
    };
    if (caught) this.startDrag(this.swipe, event);
  }

  protected onMove(event: PointerEvent): void {
    const s = this.swipe;
    if (!s || event.pointerId !== s.id) return;
    const dx = event.clientX - s.startX;
    if (!s.dragging) {
      const dy = Math.abs(event.clientY - s.startY);
      const moved = Math.abs(dx - s.spring.value);
      if (dy > SLOP && dy > moved) {
        this.swipe = null;
        return;
      }
      if (moved < SLOP) return;
      this.startDrag(s, event);
      return;
    }
    s.tracker.add(dx);
    s.spring.set(dx);
  }

  protected onUp(event: PointerEvent, toast: HyToastItem | null): void {
    const s = this.swipe;
    if (!s || event.pointerId !== s.id) return;
    this.swipe = null;
    if (!s.dragging) return;
    const x = s.spring.value;
    const velocity = toast ? s.tracker.velocity() : 0;
    const landing = x + project(velocity);
    // A flick against the drag direction takes the toast back.
    const out =
      toast && Math.abs(landing) > SWIPE_DISTANCE && Math.sign(landing) === Math.sign(x || 1);
    if (out) {
      const away = Math.sign(landing) * (s.el.offsetWidth + 48);
      s.spring.to(away, {
        ...SPRINGS.settle,
        response: 0.3,
        velocity,
        onRest: () => this.toaster.discard(toast.id),
      });
    } else {
      // The flick carried speed, so the return may overshoot a little.
      s.spring.to(0, { ...SPRINGS.momentum, velocity });
    }
  }

  private startDrag(s: Swipe, event: PointerEvent): void {
    s.dragging = true;
    s.startX = event.clientX - s.spring.value;
    s.tracker.add(s.spring.value);
    try {
      s.el.setPointerCapture(event.pointerId);
    } catch {
      // The pointer is already gone; the swipe still ends on pointerup.
    }
  }

  private springFor(el: HTMLElement): HySpring {
    let spring = this.springs.get(el);
    if (!spring) {
      spring = new HySpring(0, (x) => {
        el.style.translate = x ? `${x}px 0` : '';
        el.style.opacity = x ? String(Math.max(0, 1 - Math.abs(x) / el.offsetWidth)) : '';
      });
      this.springs.set(el, spring);
    }
    return spring;
  }

  /**
   * When a toast arrives or leaves, the others glide to their new place
   * instead of jumping. It starts from where each one is on screen, so a
   * slide that is interrupted by another change carries on smoothly.
   */
  private slideIntoPlace(): void {
    const tops = new Map<number, number>();
    for (const el of this.host.querySelectorAll<HTMLElement>('.hy-toast[data-id]')) {
      const id = Number(el.dataset['id']);
      const top = el.offsetTop;
      tops.set(id, top);
      const before = this.tops.get(id);
      if (before === undefined || before === top) continue;
      if (this.motion.reduced() || typeof el.animate !== 'function') continue;
      const current = new DOMMatrixReadOnly(getComputedStyle(el).transform).m42;
      for (const running of el.getAnimations()) {
        if (running.id === 'hy-toast-slide') running.cancel();
      }
      el.animate(
        [{ transform: `translateY(${before + current - top}px)` }, { transform: 'none' }],
        {
          id: 'hy-toast-slide',
          duration: MOTION.settle.duration * 1000,
          easing: MOTION.settle.css,
        },
      );
    }
    this.tops = tops;
  }
}
