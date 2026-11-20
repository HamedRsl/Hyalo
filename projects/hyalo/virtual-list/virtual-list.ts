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
  output,
  signal,
  untracked,
} from '@angular/core';
import { rowWindow } from './window';

export type HyVirtualKey = string | number;
export interface HyVirtualRange { readonly start: number; readonly end: number; }
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
  readonly columnCount = input(1); readonly columnWidth = input(160);
  readonly virtual = input(true); readonly appendOnly = input(false);
  readonly loadRange = input<(range: HyVirtualRange, signal: AbortSignal) => Promise<void>>();
  readonly rangeChange = output<HyVirtualRange>(); readonly loadError = output<unknown>();
  readonly loading = signal(false); readonly error = signal<unknown>(null);
  private readonly horizontalOffset = signal(0); private readonly viewportWidth = signal(0);
  private readonly retained = signal({ first: Number.MAX_SAFE_INTEGER, last: 0 });
  private request: AbortController | undefined;
  readonly columns = computed(() => this.orientation() === 'grid' ? Math.max(1, Math.trunc(this.columnCount()) || 1) : 1);
  readonly itemSize = computed(() => this.orientation() === 'horizontal' ? Math.max(1,this.columnWidth()) : this.safeRowHeight());
  readonly renderedRange = computed<HyVirtualRange>(() => ({ start: this.window().first, end: this.window().last }));
  readonly columnRange = computed(() => this.orientation() === 'grid' ? { start: Math.max(0,Math.floor(this.horizontalOffset()/Math.max(1,this.columnWidth()))-this.overscan()), end: Math.min(this.columns(),Math.ceil((this.horizontalOffset()+this.viewportWidth())/Math.max(1,this.columnWidth()))+this.overscan()+1) } : {start:0,end:1});
  readonly canvasHeight = computed(() => Math.ceil(this.items().length/this.columns())*this.safeRowHeight());
  readonly canvasWidth = computed(() => this.columns()*Math.max(1,this.columnWidth()));
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
    const total = this.items().length, columns = this.columns(), size = this.itemSize();
    if (!this.virtual()) return {first:0,last:total,before:0,after:0};
    const horizontal = this.orientation() === 'horizontal';
    const range = rowWindow(Math.ceil(total/columns), size, horizontal ? this.horizontalOffset() : this.offset(), horizontal ? this.viewportWidth() : this.viewport(), this.overscan(),this.initialCount());
    const current = { first:range.first*columns,last:Math.min(total,range.last*columns),before:range.before,after:range.after };
    if (!this.appendOnly()) return current;
    const retained = this.retained(), first = Math.min(current.first,retained.first), last = Math.min(total,Math.max(current.last,retained.last));
    return {first,last,before:Math.floor(first/columns)*size,after:Math.ceil((total-last)/columns)*size};
  });
  protected readonly rows = computed(() => {
    const { first, last } = this.window(), items = this.items(), key = this.itemKey(), cols = this.columns(), range = this.columnRange();
    return items.slice(first,last).flatMap((item,offset) => {
      const index = first+offset, col = index%cols;
      if (this.virtual() && this.orientation() === 'grid' && (col < range.start || col >= range.end)) return [];
      return [{key:key(item),index,top:Math.floor(index/cols)*this.safeRowHeight(),left:col*this.columnWidth(),context:{$implicit:item,index,count:items.length}}];
    });
  });
  constructor() {
    effect(() => {
      const range = this.renderedRange(), loader = this.loadRange();
      untracked(() => {
        this.rangeChange.emit(range);
        if (this.appendOnly()) this.retained.update(old => ({first:Math.min(old.first,range.start),last:Math.max(old.last,range.end)}));
        this.request?.abort();
        if (!loader || range.end <= range.start) { this.loading.set(false); return; }
        const request = new AbortController(); this.request = request; this.loading.set(true); this.error.set(null);
        Promise.resolve().then(() => loader(range,request.signal)).then(() => { if (!request.signal.aborted) this.loading.set(false); },error => { if (!request.signal.aborted) { this.loading.set(false); this.error.set(error); this.loadError.emit(error); } });
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
      const measure = (): void => { measureHeight(this.element.clientHeight); this.viewportWidth.set(this.element.clientWidth); };
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
        this.horizontalOffset.set(Math.abs(this.element.scrollLeft));
      };
      measure();
      this.element.addEventListener('scroll', scroll, { passive: true });
      const resize =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver((entries) => {
              const entry = entries[0];
              if (entry) { measureHeight(entry.contentRect.height); this.viewportWidth.set(entry.contentRect.width); }
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
      case 'ArrowRight':
        if (this.orientation() === 'vertical') return;
        next = index < 0 ? firstVisible : index + 1;
        break;
      case 'ArrowLeft':
        if (this.orientation() === 'vertical') return;
        next = index < 0 ? firstVisible : index - 1;
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
  scrollTo(offset: { readonly top?: number; readonly left?: number; readonly behavior?: ScrollBehavior }): void {
    const top = offset.top !== undefined && Number.isFinite(offset.top) ? Math.max(0, offset.top) : this.element.scrollTop;
    const left = offset.left !== undefined && Number.isFinite(offset.left) ? Math.max(0, offset.left) : Math.abs(this.element.scrollLeft);
    if (offset.behavior === 'smooth' && this.element.scrollTo) this.element.scrollTo({top,left,behavior:'smooth'});
    else { this.element.scrollTop = top; this.element.scrollLeft = left; }
    this.offset.set(top); this.horizontalOffset.set(left);
  }
  scrollToIndex(index: number, options: { readonly align?: 'auto' | 'start' | 'center' | 'end'; readonly behavior?: ScrollBehavior } = {}): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.items().length || this.itemSize() <= 0) return;
    const horizontal = this.orientation() === 'horizontal', size = this.itemSize(), position = Math.floor(index/this.columns())*size;
    const viewport = (horizontal ? this.viewportWidth() : this.viewport()) || size, offset = horizontal ? this.horizontalOffset() : this.offset();
    const align = options.align ?? 'auto';
    const next = align === 'start' ? position : align === 'center' ? position-(viewport-size)/2 : align === 'end' ? position+size-viewport : position < offset ? position : position+size > offset+viewport ? position+size-viewport : offset;
    const left = this.orientation() === 'grid' ? (index%this.columns())*this.columnWidth() : undefined;
    this.scrollTo(horizontal ? {left:next,behavior:options.behavior} : {top:next,left,behavior:options.behavior});
  }
  retry(): void {
    const loader = this.loadRange(); if (!loader) return;
    this.request?.abort(); const request = new AbortController(); this.request = request;
    this.loading.set(true); this.error.set(null);
    Promise.resolve().then(() => loader(this.renderedRange(),request.signal)).then(() => { if (!request.signal.aborted) this.loading.set(false); },error => { if (!request.signal.aborted) { this.loading.set(false); this.error.set(error); this.loadError.emit(error); } });
  }  focusIndex(index: number): void {
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
