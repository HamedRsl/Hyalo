import {
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  Injectable,
  afterNextRender,
  effect,
  inject,
} from '@angular/core';
import { HyMotion } from './runtime/motion';

export interface HyPointerHandlers {
  enter?(event: PointerEvent, rect: DOMRect): void;
  move(event: PointerEvent, rect: DOMRect): void;
  leave?(): void;
  destroy?(): void;
}
interface Participant {
  host: HTMLElement;
  handlers: HyPointerHandlers;
  scene: boolean;
  root: Element | null;
  intersecting: boolean;
  active: boolean;
  rect?: DOMRect;
}

/** One sampler per document; style writes stay on opted-in surfaces. */
@Injectable({ providedIn: 'root' })
export class HySceneLight {
  private readonly document = inject(DOCUMENT);
  private readonly motion = inject(HyMotion);
  private readonly entries = new Map<HTMLElement, Participant[]>();
  private readonly observers = new Map<Element | null, IntersectionObserver>();
  private resize?: ResizeObserver;
  private abort?: AbortController;
  private event?: PointerEvent;
  private frame = 0;
  private dirty = true;
  constructor() {
    effect(() => {
      if (!this.motion.enabled()) this.reset();
    });
    inject(DestroyRef).onDestroy(() => {
      this.reset();
      this.abort?.abort();
      this.resize?.disconnect();
      this.observers.forEach((o) => o.disconnect());
    });
  }
  register(
    host: HTMLElement,
    handlers: HyPointerHandlers,
    scene = false,
    root: Element | null = null,
  ): () => void {
    if (
      typeof IntersectionObserver !== 'function' ||
      !this.document.defaultView?.matchMedia('(hover: hover) and (pointer: fine)').matches
    )
      return () => handlers.destroy?.();
    this.start();
    const entry: Participant = { host, handlers, scene, root, active: false, intersecting: false };
    const group = this.entries.get(host) ?? [];
    group.push(entry);
    this.entries.set(host, group);
    let observer = this.observers.get(root);
    if (!observer) {
      observer = new IntersectionObserver(
        (changes) => {
          for (const change of changes)
            for (const item of this.entries.get(change.target as HTMLElement) ?? []) {
              if (item.root !== root) continue;
              item.intersecting = change.isIntersecting;
              item.rect = undefined;
              if (!item.intersecting) this.leave(item);
            }
          this.schedule();
        },
        { root },
      );
      this.observers.set(root, observer);
    }
    observer.observe(host);
    this.resize?.observe(host);
    return () => {
      this.leave(entry);
      handlers.destroy?.();
      const remaining = (this.entries.get(host) ?? []).filter((item) => item !== entry);
      if (!remaining.some((item) => item.root === root)) observer.unobserve(host);
      if (remaining.length) this.entries.set(host, remaining);
      else {
        this.entries.delete(host);
        this.resize?.unobserve(host);
      }
      if (!this.entries.size) {
        this.reset();
        this.abort?.abort();
        this.abort = undefined;
        this.resize?.disconnect();
        this.resize = undefined;
        this.observers.forEach((o) => o.disconnect());
        this.observers.clear();
      }
    };
  }
  private start(): void {
    if (this.abort) return;
    const abort = (this.abort = new AbortController());
    const options = { passive: true, capture: true, signal: abort.signal };
    this.document.addEventListener(
      'pointermove',
      (event) => {
        if (event.pointerType === 'touch') return;
        this.event = event;
        this.schedule();
      },
      options,
    );
    this.document.addEventListener(
      'pointerout',
      (event) => {
        if (!event.relatedTarget) this.reset();
      },
      options,
    );
    this.document.addEventListener('pointercancel', () => this.reset(), options);
    this.document.addEventListener(
      'scroll',
      () => {
        this.dirty = true;
        this.schedule();
      },
      options,
    );
    this.document.defaultView?.addEventListener(
      'resize',
      () => {
        this.dirty = true;
        this.schedule();
      },
      options,
    );
    this.document.addEventListener(
      'visibilitychange',
      () => {
        if (this.document.hidden) this.reset();
      },
      options,
    );
    this.resize =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => {
            this.dirty = true;
            this.schedule();
          })
        : undefined;
  }
  private schedule(): void {
    if (!this.frame && this.event && this.motion.enabled() && !this.document.hidden)
      this.frame = requestAnimationFrame(() => this.draw());
  }
  private draw(): void {
    this.frame = 0;
    const event = this.event;
    if (!event || !this.motion.enabled() || this.document.hidden) return;
    const work: { entry: Participant; rect: DOMRect; inside: boolean }[] = [];
    const inactive: Participant[] = [];
    for (const group of this.entries.values())
      for (const entry of group) {
        if (!entry.intersecting || !entry.host.isConnected || work.length >= 64) {
          inactive.push(entry);
          continue;
        }
        if (this.dirty || !entry.rect) entry.rect = entry.host.getBoundingClientRect();
        const rect = entry.rect;
        const inside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;
        work.push({ entry, rect, inside });
      }
    this.dirty = false;
    // Finish geometry reads before invoking handlers that write styles.
    for (const entry of inactive) this.leave(entry);
    for (const { entry, rect, inside } of work) {
      if (!inside && !entry.scene) {
        this.leave(entry);
        continue;
      }
      if (!rect.width || !rect.height) continue;
      if (!entry.active) {
        entry.active = true;
        entry.handlers.enter?.(event, rect);
      }
      entry.handlers.move(event, rect);
    }
  }
  private leave(entry: Participant): void {
    if (entry.active) {
      entry.active = false;
      entry.handlers.leave?.();
    }
  }
  private reset(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.event = undefined;
    for (const group of this.entries.values()) for (const entry of group) this.leave(entry);
  }
}

@Directive({ selector: '[hySceneLight]' })
export class HySceneLightDirective {
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const scene = inject(HySceneLight),
      destroy = inject(DestroyRef);
    afterNextRender(() => {
      let lastX = '',
        lastY = '';
      const unregister = scene.register(
        host,
        {
          move: (event, rect) => {
            const x = `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`;
            const y = `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`;
            if (x !== lastX) host.style.setProperty('--hy-px', (lastX = x));
            if (y !== lastY) host.style.setProperty('--hy-py', (lastY = y));
            host.style.setProperty('--hy-glow', '0.18');
          },
          leave: () => host.style.setProperty('--hy-glow', '0'),
        },
        true,
      );
      destroy.onDestroy(unregister);
    });
  }
}
