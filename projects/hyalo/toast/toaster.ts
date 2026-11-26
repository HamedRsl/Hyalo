import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  createGlobalPositionStrategy,
  createOverlayRef,
  type OverlayRef,
  type GlobalPositionStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  DestroyRef,
  InjectionToken,
  Injectable,
  Injector,
  type TemplateRef,
  inject,
  signal,
} from '@angular/core';
import { ɵinjectIsBrowser as injectIsBrowser } from '@hyalo/angular/core';
import { MOTION } from '@hyalo/angular/motion';
import { HyToastStack } from './toast-stack';

/** Colour and icon of a toast. */
export type HyToastTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** What to show. */
export interface HyToastOptions {
  readonly dismissOnClick?: boolean;
  readonly contentClass?: string;
  readonly template?: TemplateRef<HyToastContext>;
  readonly announcement?: 'off' | 'polite' | 'assertive';
  readonly announcementText?: string;
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
  readonly closed: Promise<HyToastCloseReason>;
  dismiss(): void;
}
export type HyToastCloseReason =
  'dismiss' | 'timeout' | 'action' | 'swipe' | 'overflow' | 'destroy' | 'server';
export interface HyToastContext {
  readonly $implicit: HyToastItem;
  readonly dismiss: () => void;
}

export type HyToastPosition =
  'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

export interface HyToastPlacement {
  readonly position?: HyToastPosition;
  readonly width?: string;
}

export interface HyToastBreakpoint extends HyToastPlacement {
  readonly maxWidth: number;
}

export interface HyToastChannelConfig extends HyToastPlacement {
  /** CSS-pixel limits. The narrowest matching entry overrides the base placement. */
  readonly breakpoints?: readonly HyToastBreakpoint[];
  readonly maxVisible?: number;
  readonly duplicates?: 'allow' | 'ignore';
}
const CHANNEL_CONFIG = new InjectionToken<HyToastChannelConfig>('Toast channel configuration');

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
  /** @internal Responsive width applied by the stack, independent of placement. */
  get stackWidth(): string {
    return `min(${this.placement().width ?? '24rem'}, calc(100vw - 2rem))`;
  }
  private readonly config = inject(CHANNEL_CONFIG, { optional: true }) ?? {};
  private readonly placement = signal<HyToastPlacement>(this.config);
  private stopResponsive?: () => void;
  private readonly channels = new Map<string, HyToaster>();
  private readonly refs = new Map<number, HyToastRef>();
  private readonly results = new Map<
    number,
    { reason?: HyToastCloseReason; resolve: (reason: HyToastCloseReason) => void }
  >();
  private readonly exits = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const id of this.timers.keys()) this.clearTimer(id);
      for (const timer of this.exits) clearTimeout(timer);
      this.stopResponsive?.();
      this.overlayRef?.dispose();
      for (const result of this.results.values()) result.resolve('destroy');
      this.results.clear();
    });
  }

  /** Named stacks are independent. Configuration is fixed on first access. */
  channel(name: string, config: HyToastChannelConfig = {}): HyToaster {
    let channel = this.channels.get(name);
    if (!channel) {
      const child = Injector.create({
        parent: this.injector,
        providers: [HyToaster, { provide: CHANNEL_CONFIG, useValue: config }],
      });
      channel = child.get(HyToaster);
      this.channels.set(name, channel);
      this.injector.get(DestroyRef).onDestroy(() => child.destroy());
    }
    return channel;
  }
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
    if (this.config.duplicates === 'ignore') {
      const duplicate = this.items().find(
        (item) =>
          !item.leaving &&
          item.message === options.message &&
          item.title === options.title &&
          item.tone === (options.tone ?? 'neutral'),
      );
      const existing = duplicate ? this.refs.get(duplicate.id) : undefined;
      if (existing) return existing;
    }
    const id = this.nextId++;
    let resolve!: (reason: HyToastCloseReason) => void;
    const closed = new Promise<HyToastCloseReason>((done) => (resolve = done));
    const ref = { closed, dismiss: () => this.dismiss(id) };
    if (!this.isBrowser) {
      resolve('server');
      return ref;
    }
    this.results.set(id, { resolve });
    this.refs.set(id, ref);
    this.ensureStack();

    const item: HyToastItem = { tone: 'neutral', ...options, id, leaving: false };
    this.items.update((list) => [...list, item]);
    // Toasts already on their way out do not count, and are not picked again.
    const staying = this.items().filter((t) => !t.leaving);
    const limit = this.config.maxVisible;
    const overflow =
      staying.length -
      (limit !== undefined && Number.isFinite(limit) ? Math.max(1, Math.trunc(limit)) : 4);
    for (const old of staying.slice(0, Math.max(0, overflow))) this.dismiss(old.id, 'overflow');

    const text = options.title ? `${options.title}. ${options.message}` : options.message;
    if (options.announcement !== 'off')
      void this.announcer.announce(
        options.announcementText ?? text,
        options.announcement ?? (item.tone === 'danger' ? 'assertive' : 'polite'),
      );

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
  dismiss(id: number, reason: HyToastCloseReason = 'dismiss'): void {
    this.clearTimer(id);
    if (!this.items().some((t) => t.id === id && !t.leaving)) return;
    const result = this.results.get(id);
    if (result) result.reason = reason;
    this.items.update((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    const timer = setTimeout(
      () => {
        this.exits.delete(timer);
        this.remove(id);
      },
      MOTION.quick.duration * 1000 + 40,
    );
    this.exits.add(timer);
  }

  /** @internal Removes a toast that already left the screen, as after a swipe. */
  discard(id: number): void {
    const result = this.results.get(id);
    if (result && !result.reason) result.reason = 'swipe';
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
    timer.handle = setTimeout(() => this.dismiss(id, 'timeout'), Math.max(0, timer.left));
  }

  private remove(id: number): void {
    const result = this.results.get(id);
    result?.resolve(result.reason ?? 'dismiss');
    this.results.delete(id);
    this.refs.delete(id);
    this.items.update((list) => list.filter((t) => t.id !== id));
  }

  private ensureStack(): void {
    if (this.overlayRef) return;
    this.observePlacement();
    const position = this.positionStrategy(this.placement().position ?? 'bottom-end');
    this.overlayRef = createOverlayRef(this.injector, {
      positionStrategy: position,
      panelClass: 'hy-toast-pane',
    });
    this.overlayRef.attach(new ComponentPortal(HyToastStack, null, this.injector));
  }

  private positionStrategy(placement: HyToastPosition): GlobalPositionStrategy {
    const position = createGlobalPositionStrategy(this.injector);
    if (placement.startsWith('top')) position.top('0');
    else position.bottom('0');
    if (placement.endsWith('start')) position.start('0');
    else if (placement.endsWith('center')) position.centerHorizontally();
    else position.end('0');
    return position;
  }

  private observePlacement(): void {
    const queries = (this.config.breakpoints ?? [])
      .filter(({ maxWidth }) => Number.isFinite(maxWidth) && maxWidth > 0)
      .sort((a, b) => a.maxWidth - b.maxWidth)
      .map((point) => ({
        point,
        query: window.matchMedia?.('(max-width: ' + point.maxWidth + 'px)'),
      }));
    if (!queries.length) return;
    const apply = (): void => {
      const match = queries.find(({ query }) => query?.matches)?.point;
      const next = {
        position: match?.position ?? this.config.position,
        width: match?.width ?? this.config.width,
      };
      const previous = this.placement();
      if (previous.position === next.position && previous.width === next.width) return;
      this.placement.set(next);
      if (previous.position !== next.position) {
        this.overlayRef?.updatePositionStrategy(
          this.positionStrategy(next.position ?? 'bottom-end'),
        );
      }
    };
    apply();
    for (const { query } of queries) query?.addEventListener('change', apply);
    this.stopResponsive = () => {
      for (const { query } of queries) query?.removeEventListener('change', apply);
    };
  }
}
