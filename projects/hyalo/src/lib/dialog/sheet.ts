import { HySpring, HyVelocityTracker, SPRINGS, project, rubberband } from '../motion/spring';
import type { HyDrawerSide } from './drawer';

/** Movement before a press turns into a drag, in px. */
const SLOP = 10;
/** Presses on these stay presses: they never start a drag. */
const INTERACTIVE =
  'button, a[href], input, select, textarea, label, summary, [contenteditable], [role="slider"], [tabindex]:not([tabindex="-1"])';

/** @internal What a drawer needs from its HyDialogRef. */
export interface HySheetHost {
  readonly dismissible: boolean;
  close(): void;
  cancelClose(): void;
}

/**
 * @internal Puts a drawer or bottom sheet on a spring and lets people drag
 * it toward its edge to close it.
 *
 * - Enter and exit run on the same spring, so the panel can be grabbed at
 *   any moment, even while it is closing, and it follows from where it is.
 * - The drag tracks the pointer 1:1. Pulling the wrong way rubber-bands.
 * - On release the flick is projected forward, and the panel springs to
 *   whichever end the projection lands nearer, carrying the finger's speed.
 * - The backdrop dims in step with how open the panel is.
 *
 * Returns the exit for `HyDialogRef.exit`.
 */
export function driveSheet(
  panel: HTMLElement,
  backdrop: HTMLElement | null,
  side: HyDrawerSide,
  host: HySheetHost,
): (finish: () => void) => void {
  const vertical = side === 'bottom';
  const rtl = getComputedStyle(panel).direction === 'rtl';
  // +1 when closing moves toward larger x or y.
  const sign = vertical ? 1 : (side === 'end') !== rtl ? 1 : -1;
  // Extra travel so the shadow is gone too.
  const size = (): number => (vertical ? panel.offsetHeight : panel.offsetWidth) + 32;

  panel.classList.add('hy-sheet-driven');
  if (backdrop) backdrop.style.transition = 'none';

  /** `offset` is how far the panel has moved out, in px. 0 is open. */
  const paint = (offset: number): void => {
    const full = size();
    // Past the open position, and past closed when it may not close, the
    // panel resists instead of following.
    let shown = offset < 0 ? rubberband(offset, full) : offset;
    if (!host.dismissible && offset > 0) shown = rubberband(offset, full);
    const px = `${shown * sign}px`;
    panel.style.translate = vertical ? `0 ${px}` : `${px} 0`;
    if (backdrop) backdrop.style.opacity = String(Math.min(1, Math.max(0, 1 - shown / full)));
  };

  const spring = new HySpring(0, paint);
  // Start out of view without measuring yet; the content has not rendered.
  panel.style.translate = vertical ? '0 100%' : `${sign * 100}% 0`;
  if (backdrop) backdrop.style.opacity = '0';
  requestAnimationFrame(() => {
    spring.set(size());
    spring.to(0, SPRINGS.settle);
  });

  let closing = false;
  const exit = (finish: () => void): void => {
    // A hidden page runs no animation frames, so the spring would never
    // arrive and `closed` would never resolve.
    if (panel.ownerDocument.hidden) {
      spring.stop();
      finish();
      return;
    }
    closing = true;
    spring.to(size(), { ...SPRINGS.settle, onRest: finish });
  };

  // Touch scrolling and our drag must not fight. Side drawers drag across
  // the scroll direction. A sheet only takes vertical touches when its
  // content cannot scroll; otherwise it is dragged by the grabber.
  if (vertical) {
    const grabber = panel.ownerDocument.createElement('div');
    grabber.className = 'hy-drawer__grabber';
    grabber.setAttribute('aria-hidden', 'true');
    panel.prepend(grabber);
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(() => {
        panel.style.touchAction = panel.scrollHeight > panel.clientHeight + 1 ? '' : 'none';
      }).observe(panel);
    }
  }

  interface Press {
    readonly id: number;
    x: number;
    readonly y: number;
    from: number;
    dragging: boolean;
  }
  let press: Press | null = null;
  const tracker = new HyVelocityTracker();
  const along = (e: PointerEvent): number => (vertical ? e.clientY : e.clientX) * sign;
  const across = (e: PointerEvent): number => (vertical ? e.clientX : e.clientY);

  const grab = (p: Press, e: PointerEvent): void => {
    p.dragging = true;
    p.x = along(e);
    p.from = spring.value;
    spring.stop();
    if (closing) {
      // Taken back mid-exit: the sheet stays, and close() can run again.
      closing = false;
      host.cancelClose();
    }
    tracker.reset();
    tracker.add(spring.value);
    try {
      panel.setPointerCapture(e.pointerId);
    } catch {
      // The pointer is already gone, as when it lifted on the same frame.
    }
    panel.dataset['dragging'] = '';
    panel.ownerDocument.getSelection()?.removeAllRanges();
  };

  panel.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !e.isPrimary) return;
    const target = e.target as Element;
    const onGrabber = !!target.closest('.hy-drawer__grabber');
    if (!onGrabber && target.closest(INTERACTIVE)) return;
    if (vertical && !onGrabber && panel.scrollTop > 0) return;
    const p: Press = {
      id: e.pointerId,
      x: along(e),
      y: across(e),
      from: spring.value,
      dragging: false,
    };
    press = p;
    // A panel already in motion is caught right away, with no slop.
    if (spring.running) grab(p, e);
  });

  panel.addEventListener('pointermove', (e) => {
    if (!press || e.pointerId !== press.id) return;
    const moved = along(e) - press.x;
    if (!press.dragging) {
      const cross = Math.abs(across(e) - press.y);
      if (cross > SLOP && cross > Math.abs(moved)) {
        press = null;
        return;
      }
      if (Math.abs(moved) < SLOP) return;
      grab(press, e);
      return;
    }
    const offset = press.from + moved;
    tracker.add(offset);
    spring.set(offset);
  });

  const release = (e: PointerEvent): void => {
    if (!press || e.pointerId !== press.id) return;
    const wasDragging = press.dragging;
    press = null;
    if (!wasDragging) return;
    delete panel.dataset['dragging'];
    // A drag must not end in a click on whatever is under the pointer.
    const swallow = (click: Event): void => {
      click.stopPropagation();
      click.preventDefault();
    };
    panel.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => panel.removeEventListener('click', swallow, { capture: true }));

    const velocity = e.type === 'pointercancel' ? 0 : tracker.velocity();
    const full = size();
    const landing = spring.value + project(velocity);
    // A clear flick decides by its direction, a slow release by where it lands.
    const out = Math.abs(velocity) > 400 ? velocity > 0 : landing > full / 2;
    spring.velocity = velocity;
    if (out && host.dismissible) host.close();
    else spring.to(0, SPRINGS.settle);
  };
  panel.addEventListener('pointerup', release);
  panel.addEventListener('pointercancel', release);

  return exit;
}
