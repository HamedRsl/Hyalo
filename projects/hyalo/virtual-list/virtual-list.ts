import { DOCUMENT, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  PLATFORM_ID,
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
  linkedSignal,
  output,
  signal,
  untracked,
} from '@angular/core';
import { rowWindow } from './window';

export type HyVirtualKey = string | number;
export interface HyVirtualRange {
  readonly start: number;
  readonly end: number;
}
export type HyVirtualAlignment = 'auto' | 'nearest' | 'start' | 'center' | 'end';
const equalRange = (a: HyVirtualRange, b: HyVirtualRange): boolean =>
  a.start === b.start && a.end === b.end;

function alignedOffset(
  position: number,
  size: number,
  viewport: number,
  offset: number,
  align: HyVirtualAlignment,
): number {
  if (align === 'start') return position;
  if (align === 'center') return position - (viewport - size) / 2;
  if (align === 'end') return position + size - viewport;
  if (position < offset) return position;
  if (position + size > offset + viewport) return position + size - viewport;
  return offset;
}
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
    '[attr.data-orientation]': 'orientation()',
    '[attr.aria-busy]': 'loading()',
    '(keydown)': 'keys($event)',
    '(focusin)': 'focusIn($event)',
    '(focusout)': 'focusOut($event)',
  },
})
export class HyVirtualList<T> {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
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
  readonly orientation = input<'vertical' | 'horizontal' | 'grid'>('vertical');
  readonly columnCount = input(1);
  readonly columnWidth = input(160);
  readonly virtual = input(true);
  readonly appendOnly = input(false);
  readonly loadRange = input<(range: HyVirtualRange, signal: AbortSignal) => Promise<void>>();
  readonly rangeChange = output<HyVirtualRange>();
  readonly loadError = output<unknown>();
  readonly loading = signal(false);
  readonly error = signal<unknown>(null);
  private readonly horizontalOffset = signal(0);
  private readonly viewportWidth = signal(0);
  private readonly retained = linkedSignal({
    source: () => [
      this.items(),
      this.orientation(),
      this.columns(),
      this.virtual(),
      this.appendOnly(),
    ],
    computation: () => ({ first: Number.MAX_SAFE_INTEGER, last: 0 }),
  });
  private request: AbortController | undefined;
  readonly columns = computed(() =>
    this.orientation() === 'grid' && Number.isFinite(this.columnCount())
      ? Math.max(1, Math.trunc(this.columnCount()))
      : 1,
  );
  protected readonly safeColumnWidth = computed(() =>
    Number.isFinite(this.columnWidth()) && this.columnWidth() > 0 ? this.columnWidth() : 160,
  );
  readonly itemSize = computed(() =>
    this.orientation() === 'horizontal' ? this.safeColumnWidth() : this.safeRowHeight(),
  );
  readonly renderedRange = computed<HyVirtualRange>(
    () => ({ start: this.window().first, end: this.window().last }),
    { equal: equalRange },
  );
  readonly columnRange = computed<HyVirtualRange>(
    () => {
      if (this.orientation() !== 'grid' || !this.virtual())
        return { start: 0, end: this.columns() };
      const range = rowWindow(
        this.columns(),
        this.safeColumnWidth(),
        this.horizontalOffset(),
        this.viewportWidth(),
        this.overscan(),
        this.initialCount(),
      );
      return { start: range.first, end: range.last };
    },
    { equal: equalRange },
  );
  readonly canvasHeight = computed(
    () => Math.ceil(this.items().length / this.columns()) * this.safeRowHeight(),
  );
  readonly canvasWidth = computed(() => this.columns() * this.safeColumnWidth());
  protected readonly item = contentChild.required<HyVirtualItem<T>>(HyVirtualItem);
  private readonly offset = signal(0);
  private readonly viewport = signal(0);
  private readonly focusedKey = signal<HyVirtualKey | null>(null);
  private readonly pendingKey = signal<HyVirtualKey | null>(null);
  private rowHasFocus = false;
  protected readonly safeRowHeight = computed(() =>
    Number.isFinite(this.rowHeight()) && this.rowHeight() > 0 ? this.rowHeight() : 0,
  );
  protected readonly window = computed(() => {
    const total = this.items().length,
      columns = this.columns(),
      size = this.itemSize();
    if (!this.virtual()) return { first: 0, last: total, before: 0, after: 0 };
    const horizontal = this.orientation() === 'horizontal';
    const range = rowWindow(
      Math.ceil(total / columns),
      size,
      horizontal ? this.horizontalOffset() : this.offset(),
      horizontal ? this.viewportWidth() : this.viewport(),
      this.overscan(),
      this.initialCount(),
    );
    const current = {
      first: range.first * columns,
      last: Math.min(total, range.last * columns),
      before: range.before,
      after: range.after,
    };
    if (!this.appendOnly()) return current;
    const retained = this.retained(),
      first = Math.min(current.first, retained.first),
      last = Math.min(total, Math.max(current.last, retained.last));
    return {
      first,
      last,
      before: Math.floor(first / columns) * size,
      after: Math.ceil((total - last) / columns) * size,
    };
  });
  protected readonly rows = computed(() => {
    const { first, last } = this.window(),
      items = this.items(),
      key = this.itemKey(),
      cols = this.columns(),
      range = this.columnRange();
    const rows = [];
    for (let row = Math.floor(first / cols); row * cols < last; row++) {
      for (let col = range.start; col < range.end; col++) {
        const index = row * cols + col;
        if (index >= last) break;
        const item = items[index] as T;
        rows.push({
          key: key(item),
          index,
          top: row * this.safeRowHeight(),
          left: col * this.safeColumnWidth(),
          context: { $implicit: item, index, count: items.length },
        });
      }
    }
    return rows;
  });
  constructor() {
    effect(() => {
      if (!this.appendOnly() || !this.virtual()) return;
      const { start, end } = this.renderedRange();
      untracked(() =>
        this.retained.update((old) =>
          start >= old.first && end <= old.last
            ? old
            : { first: Math.min(start, old.first), last: Math.max(end, old.last) },
        ),
      );
    });
    effect(() => this.rangeChange.emit(this.renderedRange()));
    effect(() => {
      const range = this.renderedRange(),
        loader = this.loadRange();
      untracked(() => {
        if (this.browser && loader && range.end > range.start) this.requestRange(loader, range);
        else {
          this.request?.abort();
          this.loading.set(false);
          this.error.set(null);
        }
      });
    });
    this.destroy.onDestroy(() => this.request?.abort());
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
      const measure = (): void => {
        measureHeight(this.element.clientHeight);
        this.viewportWidth.set(this.element.clientWidth);
      };
      const scroll = (): void => {
        this.offset.set(this.element.scrollTop);
        this.horizontalOffset.set(Math.abs(this.element.scrollLeft));
        const next = this.renderedRange();
        const focused =
          this.document.activeElement?.closest<HTMLElement>('[data-hy-virtual-index]');
        // A keyboard jump scrolls before its destination mounts; preserve its pending focus.
        if (focused && this.element.contains(focused) && this.pendingKey() === null) {
          const index = Number(focused.dataset['hyVirtualIndex']);
          const col = index % this.columns(),
            columns = this.columnRange();
          if (index < next.start || index >= next.end || col < columns.start || col >= columns.end)
            this.parkFocus();
        }
      };
      measure();
      this.element.addEventListener('scroll', scroll, { passive: true });
      const resize =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver((entries) => {
              const entry = entries[0];
              if (entry) {
                measureHeight(entry.contentRect.height);
                this.viewportWidth.set(entry.contentRect.width);
              }
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
    const horizontal = this.orientation() === 'horizontal';
    const columns = this.columns();
    const unit = this.itemSize() || 1;
    const firstVisible = horizontal
      ? Math.floor(this.horizontalOffset() / unit)
      : Math.floor(this.offset() / unit) * columns +
        Math.floor(this.horizontalOffset() / this.safeColumnWidth());
    const page =
      Math.max(1, Math.floor((horizontal ? this.viewportWidth() : this.viewport()) / unit)) *
      columns;
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        if (this.orientation() === 'vertical') return;
        next = index < 0 ? firstVisible : index + (this.rtl() ? -1 : 1);
        break;
      case 'ArrowLeft':
        if (this.orientation() === 'vertical') return;
        next = index < 0 ? firstVisible : index + (this.rtl() ? 1 : -1);
        break;
      case 'ArrowDown':
        next = index < 0 ? firstVisible : index + this.columns();
        break;
      case 'ArrowUp':
        next = index < 0 ? firstVisible : index - this.columns();
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
  scrollTo(offset: {
    readonly top?: number;
    readonly left?: number;
    readonly behavior?: ScrollBehavior;
  }): void {
    const top =
      offset.top !== undefined && Number.isFinite(offset.top)
        ? Math.max(0, offset.top)
        : this.element.scrollTop;
    const left =
      offset.left !== undefined && Number.isFinite(offset.left)
        ? Math.max(0, offset.left)
        : Math.abs(this.element.scrollLeft);
    const physicalLeft = this.rtl() ? -left : left;
    if (offset.behavior === 'smooth' && this.element.scrollTo) {
      this.element.scrollTo({ top, left: physicalLeft, behavior: 'smooth' });
      return;
    }
    this.element.scrollTop = top;
    this.element.scrollLeft = physicalLeft;
    this.offset.set(this.element.scrollTop);
    this.horizontalOffset.set(Math.abs(this.element.scrollLeft));
  }
  scrollToIndex(
    index: number,
    options: { readonly align?: HyVirtualAlignment; readonly behavior?: ScrollBehavior } = {},
  ): void {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= this.items().length ||
      this.itemSize() <= 0
    )
      return;
    const horizontal = this.orientation() === 'horizontal',
      size = this.itemSize(),
      position = Math.floor(index / this.columns()) * size;
    const viewport = (horizontal ? this.viewportWidth() : this.viewport()) || size,
      offset = horizontal ? this.horizontalOffset() : this.offset();
    const align = options.align ?? 'auto';
    const next = alignedOffset(position, size, viewport, offset, align);
    const width = this.safeColumnWidth();
    const left =
      this.orientation() === 'grid'
        ? alignedOffset(
            (index % this.columns()) * width,
            width,
            this.viewportWidth() || width,
            this.horizontalOffset(),
            align,
          )
        : undefined;
    this.scrollTo(
      horizontal
        ? { left: next, behavior: options.behavior }
        : { top: next, left, behavior: options.behavior },
    );
  }
  retry(): void {
    const loader = this.loadRange();
    if (!this.browser || !loader) return;
    this.requestRange(loader, this.renderedRange());
  }
  private rtl(): boolean {
    return this.document.defaultView?.getComputedStyle(this.element).direction === 'rtl';
  }
  private requestRange(
    loader: NonNullable<ReturnType<typeof this.loadRange>>,
    range: HyVirtualRange,
  ): void {
    this.request?.abort();
    const request = new AbortController();
    this.request = request;
    this.loading.set(true);
    this.error.set(null);
    Promise.resolve()
      .then(() => (request.signal.aborted ? undefined : loader(range, request.signal)))
      .then(
        () => {
          if (!request.signal.aborted) this.loading.set(false);
        },
        (error) => {
          if (!request.signal.aborted) {
            this.loading.set(false);
            this.error.set(error);
            this.loadError.emit(error);
          }
        },
      );
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
