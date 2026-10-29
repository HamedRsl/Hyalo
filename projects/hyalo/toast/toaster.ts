import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  createGlobalPositionStrategy,
  createOverlayRef,
  type OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, inject, signal } from '@angular/core';
import { MOTION, ɵinjectIsBrowser as injectIsBrowser } from '@hyalo/angular';
import { HyToastStack } from './toast-stack';

/** Colour and icon of a toast. */
export type HyToastTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** What to show. */
export interface HyToastOptions {
  readonly message: string;
  readonly title?: string;
  readonly tone?: HyToastTone;
  /**
   * Milliseconds before it hides. 0 keeps it until dismissed. Defaults to
   * 5000, or 0 when there is an action, so nobody has to race a timer.
   */
  readonly duration?: number;
  /** One optional action, such as Undo. */
  readonly action?: { readonly label: string; readonly run: () => void };
}

/** @internal One toast in the stack. */
export interface HyToastItem extends HyToastOptions {
  readonly id: number;
  readonly leaving: boolean;
}

/** Handle to a shown toast. */
export interface HyToastRef {
  dismiss(): void;
}

const MAX_VISIBLE = 4;

/** @internal Why the timers are on hold. Hover and focus are tracked apart. */
export type HyToastHold = 'hover' | 'focus';

/**
 * Shows toasts: short messages about something that just happened.
 *
 * ```ts
 * toaster.show({ message: 'Address saved', tone: 'success' });
 * toaster.show({ message: 'Draft deleted', action: { label: 'Undo', run: () => restore() } });
 * ```
 *
 * Every toast is announced through the live announcer (`danger` toasts
 * assertively, the rest politely). Timers pause while the pointer or focus
 * is in the stack, and toasts can be swiped away. The stack sits at the
 * bottom inline-end corner and is a labelled region, so keyboard and screen
 * reader users can reach the actions.
 */
@Injectable({ providedIn: 'root' })
export class HyToaster {
  private readonly injector = inject(Injector);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly isBrowser = injectIsBrowser();
  private readonly timers = new Map<
    number,
    { left: number; started: number; handle?: ReturnType<typeof setTimeout> }
  >();
  private overlayRef: OverlayRef | null = null;
  private nextId = 1;
  private readonly holds = new Set<HyToastHold>();

  /** @internal The current stack, newest last. */
  readonly items = signal<readonly HyToastItem[]>([]);

  /** Shows a toast. Does nothing during server rendering. */
  show(options: HyToastOptions): HyToastRef {
    const id = this.nextId++;
    const ref = { dismiss: () => this.dismiss(id) };
    if (!this.isBrowser) return ref;
    this.ensureStack();

    const item: HyToastItem = { tone: 'neutral', ...options, id, leaving: false };
    this.items.update((list) => [...list, item]);
    // Toasts already on their way out do not count, and are not picked again.
    const staying = this.items().filter((t) => !t.leaving);
    const overflow = staying.length - MAX_VISIBLE;
    for (const old of staying.slice(0, Math.max(0, overflow))) this.dismiss(old.id);

    const text = options.title ? `${options.title}. ${options.message}` : options.message;
    void this.announcer.announce(text, item.tone === 'danger' ? 'assertive' : 'polite');

    const duration = options.duration ?? (options.action ? 0 : 5000);
    if (duration > 0) {
      this.timers.set(id, { left: duration, started: Date.now() });
      if (this.holds.size === 0) this.startTimer(id);
    }
    return ref;
  }

  success(message: string, title?: string): HyToastRef {
    return this.show({ message, title, tone: 'success' });
  }

  error(message: string, title?: string): HyToastRef {
    return this.show({ message, title, tone: 'danger' });
  }

  /** Hides one toast with its exit animation, a fade with reduced motion. */
  dismiss(id: number): void {
    this.clearTimer(id);
    if (!this.items().some((t) => t.id === id && !t.leaving)) return;
    this.items.update((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => this.remove(id), MOTION.quick.duration * 1000 + 40);
  }

  /** @internal Removes a toast that already left the screen, as after a swipe. */
  discard(id: number): void {
    this.clearTimer(id);
    this.remove(id);
  }

  private clearTimer(id: number): void {
    clearTimeout(this.timers.get(id)?.handle);
    this.timers.delete(id);
  }

  /** Hides every toast. */
  dismissAll(): void {
    for (const t of this.items()) this.dismiss(t.id);
  }

  /**
   * @internal Pauses all timers while the stack is hovered or focused. Each
   * reason is held separately, so the pointer leaving does not restart the
   * timers while focus is still on a toast.
   */
  pause(reason: HyToastHold): void {
    const wasPaused = this.holds.size > 0;
    this.holds.add(reason);
    if (wasPaused) return;
    const now = Date.now();
    for (const timer of this.timers.values()) {
      clearTimeout(timer.handle);
      timer.left -= now - timer.started;
    }
  }

  /** @internal Releases one hold. Timers restart once no hold is left. */
  resume(reason: HyToastHold): void {
    if (!this.holds.delete(reason) || this.holds.size > 0) return;
    for (const id of this.timers.keys()) this.startTimer(id);
  }

  private startTimer(id: number): void {
    const timer = this.timers.get(id);
    if (!timer) return;
    timer.started = Date.now();
    timer.handle = setTimeout(() => this.dismiss(id), Math.max(0, timer.left));
  }

  private remove(id: number): void {
    this.items.update((list) => list.filter((t) => t.id !== id));
  }

  private ensureStack(): void {
    if (this.overlayRef) return;
    this.overlayRef = createOverlayRef(this.injector, {
      positionStrategy: createGlobalPositionStrategy(this.injector).bottom('0').end('0'),
      panelClass: 'hy-toast-pane',
    });
    this.overlayRef.attach(new ComponentPortal(HyToastStack, null, this.injector));
  }
}
