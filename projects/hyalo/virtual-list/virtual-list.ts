import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { rowWindow } from './window';

export type HyVirtualKey = string | number;
export interface HyVirtualItemContext<T> {
  readonly $implicit: T;
  readonly index: number;
  readonly count: number;
}

@Directive({ selector: 'ng-template[hyVirtualItem]' })
export class HyVirtualItem<T> {
  /** Bind the list reference so Angular can infer the template's item type. */
  readonly hyVirtualItem = input.required<HyVirtualList<T>>();
  readonly template = inject<TemplateRef<HyVirtualItemContext<T>>>(TemplateRef);
  static ngTemplateContextGuard<T>(
    _directive: HyVirtualItem<T>,
    context: unknown,
  ): context is HyVirtualItemContext<T> {
    return typeof context === 'object' && context !== null && '$implicit' in context;
  }
}
@Component({
  selector: 'hy-virtual-list',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './virtual-list.html',
  styleUrl: './virtual-list.css',
  host: {
    role: 'list',
    tabindex: '0',
    '[attr.aria-label]': 'label()',
    '[style.block-size]': 'height()',
    '(keydown)': 'keys($event)',
    '(focusin)': 'focusIn($event)',
    '(focusout)': 'focusOut($event)',
  },
})
export class HyVirtualList<T> {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  readonly items = input.required<readonly T[]>();
  readonly itemKey = input.required<(item: T) => HyVirtualKey>();
  readonly label = input.required<string>();
  readonly rowHeight = input.required<number>();
  readonly height = input('var(--hy-virtual-list-height, 20rem)');
  readonly overscan = input(4);
  /** The server and first client render use the same bounded slice. */
  readonly initialCount = input(10);
  protected readonly item = contentChild.required<HyVirtualItem<T>>(HyVirtualItem);
  private readonly offset = signal(0);
  private readonly viewport = signal(0);
  private readonly focusedKey = signal<HyVirtualKey | null>(null);
  private readonly pendingKey = signal<HyVirtualKey | null>(null);
  private rowHasFocus = false;
  protected readonly safeRowHeight = computed(() =>
    Number.isFinite(this.rowHeight()) && this.rowHeight() > 0 ? this.rowHeight() : 0,
  );
  protected readonly window = computed(
    () =>
      rowWindow(
        this.items().length,
        this.safeRowHeight(),
        this.offset(),
        this.viewport(),
        this.overscan(),
        this.initialCount(),
      ),
    {
      equal: (a, b) =>
        a.first === b.first && a.last === b.last && a.before === b.before && a.after === b.after,
    },
  );
  protected readonly rows = computed(() => {
    const { first, last } = this.window(),
      items = this.items(),
      key = this.itemKey();
    return items.slice(first, last).map((item, offset) => ({
      key: key(item),
      index: first + offset,
      context: { $implicit: item, index: first + offset, count: items.length },
    }));
  });

  constructor() {
    effect(() => {
      const items = this.items(),
        key = this.itemKey();
      const focused = untracked(this.focusedKey);
      if (!this.rowHasFocus || focused === null) return;
      const index = items.findIndex((item) => key(item) === focused);
      if (index < 0) this.parkFocus();
      else this.focusIndex(index);
    });
    afterRenderEffect(() => {
      const key = this.pendingKey(),
        rows = this.rows();
      if (key === null) return;
      const row = rows.find((row) => row.key === key);
      if (row) {
        this.element
          .querySelector<HTMLElement>('[data-hy-virtual-index="' + row.index + '"]')
          ?.focus({ preventScroll: true });
        this.pendingKey.set(null);
      }
    });
    afterNextRender(() => {
      const measureHeight = (height: number): void => {
        this.viewport.set(height);
        const focused = this.focusedKey();
        if (this.rowHasFocus && focused !== null) {
          const index = this.items().findIndex((item) => this.itemKey()(item) === focused);
          if (index >= 0) this.focusIndex(index);
        }
      };
      const measure = (): void => measureHeight(this.element.clientHeight);
      const scroll = (): void => {
        const next = rowWindow(
          this.items().length,
          this.safeRowHeight(),
          this.element.scrollTop,
          this.viewport(),
          this.overscan(),
          this.initialCount(),
        );
        const focused =
          this.document.activeElement?.closest<HTMLElement>('[data-hy-virtual-index]');
        // A keyboard jump scrolls before its destination mounts; preserve its pending focus.
        if (focused && this.element.contains(focused) && this.pendingKey() === null) {
          const index = Number(focused.dataset['hyVirtualIndex']);
          if (index < next.first || index >= next.last) this.parkFocus();
        }
        this.offset.set(this.element.scrollTop);
      };
      measure();
      this.element.addEventListener('scroll', scroll, { passive: true });
      const resize =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver((entries) => {
              const entry = entries[0];
              if (entry) measureHeight(entry.contentRect.height);
            });
      resize?.observe(this.element);
      this.document.defaultView?.addEventListener('resize', measure);
      this.destroy.onDestroy(() => {
        this.element.removeEventListener('scroll', scroll);
        this.document.defaultView?.removeEventListener('resize', measure);
        resize?.disconnect();
      });
    });
  }
  private parkFocus(): void {
    this.rowHasFocus = false;
    this.focusedKey.set(null);
    this.pendingKey.set(null);
    this.element.focus({ preventScroll: true });
  }
  protected focusIn(event: FocusEvent): void {
    const row = (event.target as Element).closest<HTMLElement>('[data-hy-virtual-index]');
    const index = row && this.element.contains(row) ? Number(row.dataset['hyVirtualIndex']) : -1;
    const item = this.items()[index];
    this.rowHasFocus = index >= 0 && index < this.items().length;
    this.focusedKey.set(this.rowHasFocus ? this.itemKey()(item as T) : null);
  }
  protected focusOut(event: FocusEvent): void {
    if (!this.element.contains(event.relatedTarget as Node | null)) {
      this.rowHasFocus = false;
      this.focusedKey.set(null);
    }
  }
  protected keys(event: KeyboardEvent): void {
    if (
      (event.target as Element).closest(
        'input, textarea, select, button, a, [contenteditable="true"]',
      )
    )
      return;
    const items = this.items(),
      key = this.itemKey(),
      focused = this.focusedKey();
    const index = focused === null ? -1 : items.findIndex((item) => key(item) === focused);
    const firstVisible =
      this.safeRowHeight() > 0 ? Math.floor(this.offset() / this.safeRowHeight()) : 0;
    const page = Math.max(1, Math.floor(this.viewport() / (this.safeRowHeight() || 1)));
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = index < 0 ? firstVisible : index + 1;
        break;
      case 'ArrowUp':
        next = index < 0 ? firstVisible : index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      case 'PageDown':
        next = (index < 0 ? firstVisible : index) + page;
        break;
      case 'PageUp':
        next = (index < 0 ? firstVisible : index) - page;
        break;
      default:
        return;
    }
    if (!items.length || this.safeRowHeight() === 0) return;
    event.preventDefault();
    this.focusIndex(Math.min(items.length - 1, Math.max(0, next)));
  }
  scrollToIndex(index: number): void {
    const height = this.safeRowHeight();
    if (!Number.isFinite(index) || index < 0 || index >= this.items().length || height === 0)
      return;
    const top = Math.trunc(index) * height;
    const viewport = this.viewport() || this.element.clientHeight || height;
    const offset = this.element.scrollTop;
    const next =
      top < offset ? top : top + height > offset + viewport ? top + height - viewport : offset;
    this.element.scrollTop = next;
    this.offset.set(next);
  }
  focusIndex(index: number): void {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= this.items().length ||
      this.safeRowHeight() === 0
    )
      return;
    this.scrollToIndex(index);
    this.pendingKey.set(this.itemKey()(this.items()[index] as T));
  }
}
export const HY_VIRTUAL_LIST = [HyVirtualList, HyVirtualItem] as const;
