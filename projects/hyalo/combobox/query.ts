import {
  DestroyRef,
  Directive,
  afterNextRender,
  inject,
  TemplateRef,
  computed,
  effect,
  input,
  model,
  output,
  resource,
  signal,
} from '@angular/core';
import type { ConnectedPosition, ScrollStrategy } from '@angular/cdk/overlay';
import { HyValueControl } from '@hyalo/angular/field';
import { normalizeSearch } from '@hyalo/angular/core';
import type { HySelectOption } from '@hyalo/angular/select';
export type HyOptionLoader<T> = (
  query: string,
  signal: AbortSignal,
) => Promise<readonly HySelectOption<T>[]>;
export interface HyOptionPage<T> {
  readonly options: readonly HySelectOption<T>[];
  readonly hasMore: boolean;
}
export interface HyOptionPageRequest {
  readonly query: string;
  readonly offset: number;
  readonly limit: number;
  readonly signal: AbortSignal;
}
export type HyOptionPageLoader<T> = (request: HyOptionPageRequest) => Promise<HyOptionPage<T>>;
export interface HyOptionRenderContext<T> {
  readonly $implicit: HySelectOption<T>;
  readonly selected?: boolean;
}
export interface HyOptionRange {
  readonly start: number;
  readonly end: number;
  readonly total: number;
}
/** Shared cancellable search, identity, presentation and viewport-loading contracts. */
@Directive()
export abstract class HyOptionQuery<T> extends HyValueControl {
  readonly options = input<readonly HySelectOption<T>[]>([]);
  readonly loadOptions = input<HyOptionLoader<T>>();
  readonly loadPage = input<HyOptionPageLoader<T>>();
  readonly pageSize = input(50);
  readonly minQueryLength = input(0);
  readonly debounce = input(0);
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);
  readonly displayWith = input<(value: T) => string>();
  readonly filterOption = input<(option: HySelectOption<T>, query: string) => boolean>();
  readonly locale = input('en');
  readonly placeholder = input('Search options');
  readonly emptyLabel = input('No matching options');
  readonly loadingLabel = input('Loading options');
  readonly loadMoreLabel = input('Load more options');
  readonly errorLabel = input('Could not load options');
  readonly optionTemplate = input<TemplateRef<HyOptionRenderContext<T>>>();
  readonly selectedTemplate = input<TemplateRef<HyOptionRenderContext<T>>>();
  readonly groupTemplate = input<TemplateRef<{ $implicit: string }>>();
  readonly headerTemplate = input<TemplateRef<unknown>>();
  readonly footerTemplate = input<TemplateRef<unknown>>();
  readonly panelClass = input<string | string[]>('');
  readonly panelWidth = input<string | number>();
  readonly overlayPositions = input<ConnectedPosition[]>();
  readonly scrollStrategy = input<ScrollStrategy>();
  readonly offsetX = input(0);
  readonly offsetY = input(0);
  readonly closeOnOutside = input(true);
  readonly virtualized = input(false);
  readonly itemHeight = input(44);
  readonly viewportHeight = input(264);
  readonly opened = model(false);
  readonly visibilityChange = output<boolean>();
  readonly openedPanel = output<void>();
  readonly closedPanel = output<void>();
  /** The overlay pane and its content are mounted. */
  readonly panelAttached = output<void>();
  /** The mounted overlay was detached. */
  readonly panelDetached = output<void>();
  readonly queryChange = output<string>();
  readonly renderedRangeChange = output<HyOptionRange>();
  protected readonly expanded = this.opened;
  readonly query = signal('');
  private readonly search = signal('');
  private readonly pageOffset = signal(0);
  private readonly pageCache = signal<{
    query: string;
    options: readonly HySelectOption<T>[];
    hasMore: boolean;
  }>({ query: '', options: [], hasMore: false });
  private readonly retained = signal<readonly HySelectOption<T>[]>([]);
  protected readonly viewportOffset = signal(0);
  protected readonly activeIndex = signal(-1);
  protected readonly activeId = computed(() =>
    this.activeIndex() < 0 ? undefined : this.id() + '-option-' + this.activeIndex(),
  );
  protected readonly knownOptions = computed(() => {
    const current = [
      ...this.options(),
      ...this.results().map((item) => item.option),
      ...this.retained(),
    ];
    return current.filter(
      (option, index) => current.findIndex((item) => this.same(item.value, option.value)) === index,
    );
  });
  protected readonly request = resource({
    params: () => {
      const load = this.loadOptions(),
        paged = this.loadPage(),
        query = this.search();
      return this.expanded() &&
        !this.blocked() &&
        query === this.query() &&
        query.length >= this.minQueryLength() &&
        (load || paged)
        ? {
            query,
            load,
            paged,
            offset: this.pageOffset(),
            limit: Math.max(1, Math.floor(this.pageSize())),
          }
        : undefined;
    },
    loader: async ({ params, abortSignal }) =>
      params.paged
        ? {
            ...(await params.paged({
              query: params.query,
              offset: params.offset,
              limit: params.limit,
              signal: abortSignal,
            })),
            query: params.query,
            offset: params.offset,
          }
        : {
            options: (await params.load?.(params.query, abortSignal)) ?? [],
            hasMore: false,
            query: params.query,
            offset: 0,
          },
  });
  protected readonly busy = computed(() => this.request.isLoading());
  protected readonly canLoadMore = computed(() => {
    const page = this.pageCache();
    return (
      this.expanded() &&
      !this.blocked() &&
      !!this.loadPage() &&
      page.query === this.query() &&
      page.hasMore
    );
  });
  protected readonly failed = computed(() => this.request.status() === 'error');
  protected readonly results = computed(() => {
    const cache = this.pageCache(),
      remote = !!(this.loadOptions() || this.loadPage());
    const options = remote ? (cache.query === this.query() ? cache.options : []) : this.options();
    const query = normalizeSearch(this.query(), this.locale());
    if (this.query().length < this.minQueryLength()) return [];
    const keys = new Set<string>();
    const filter = this.filterOption();
    return options
      .filter(
        (option) =>
          remote ||
          (filter
            ? filter(option, this.query())
            : normalizeSearch(this.optionLabel(option), this.locale()).includes(query)),
      )
      .map((option, index) => {
        if (option.key === undefined && typeof option.value === 'object' && option.value !== null)
          throw new Error('Object options require a stable key');
        const key = String(option.key ?? typeof option.value + ':' + String(option.value));
        if (keys.has(key)) throw new Error('Duplicate option key: ' + key);
        keys.add(key);
        return {
          key,
          index,
          option,
          label: this.optionLabel(option),
          disabled: !!(option.disabled || option.group?.disabled),
          context: { $implicit: option },
        };
      });
  });
  protected readonly range = computed(() => {
    const total = this.results().length,
      height = Math.max(1, this.itemHeight());
    const start = this.virtualized()
      ? Math.min(
          Math.max(0, total - 1),
          Math.max(0, Math.floor(this.viewportOffset() / height) - 2),
        )
      : 0;
    return {
      start,
      end: this.virtualized()
        ? Math.min(total, start + Math.ceil(Math.max(1, this.viewportHeight()) / height) + 4)
        : total,
      total,
    };
  });
  protected readonly visibleResults = computed(() =>
    this.results().slice(this.range().start, this.range().end),
  );
  protected readonly beforeSize = computed(() =>
    this.virtualized() ? this.range().start * Math.max(1, this.itemHeight()) : 0,
  );
  protected readonly afterSize = computed(() =>
    this.virtualized()
      ? (this.range().total - this.range().end) * Math.max(1, this.itemHeight())
      : 0,
  );
  constructor() {
    super();
    effect(() => {
      if (this.blocked()) this.expanded.set(false);
    });
    effect((onCleanup) => {
      const query = this.query(),
        delay = Math.max(0, this.debounce());
      this.queryChange.emit(query);
      this.pageOffset.set(0);
      this.viewportOffset.set(0);
      this.activeIndex.set(-1);
      if (!delay) this.search.set(query);
      else {
        const timer = setTimeout(() => this.search.set(query), delay);
        onCleanup(() => clearTimeout(timer));
      }
    });
    effect(() => {
      if (!this.request.hasValue()) return;
      const page = this.request.value();
      this.pageCache.update((cache) => ({
        query: page.query,
        options:
          page.offset && cache.query === page.query
            ? [...cache.options.slice(0, page.offset), ...page.options]
            : page.options,
        hasMore: page.hasMore && page.options.length > 0,
      }));
    });
    let wasOpen = false;
    effect(() => {
      const open = this.expanded();
      if (open === wasOpen) return;
      wasOpen = open;
      this.visibilityChange.emit(open);
      if (open) this.openedPanel.emit();
      else this.closedPanel.emit();
    });
    effect(() => this.renderedRangeChange.emit(this.range()));
  }
  protected same(a: T, b: T): boolean {
    return this.compareWith()(a, b);
  }
  protected optionLabel(option: HySelectOption<T>): string {
    return this.displayWith()?.(option.value) ?? option.label;
  }
  protected type(event: Event): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    this.query.set((event.target as HTMLInputElement).value);
    this.expand(true);
  }
  override focus(): void {
    this.element.querySelector('input')?.focus();
  }
  show(): void {
    this.expand(true);
  }
  hide(): void {
    this.dismiss();
  }
  toggle(): void {
    this.expand(!this.expanded());
  }
  protected expand(value: boolean): void {
    this.expanded.set(value && !this.blocked());
    if (!value) this.query.set('');
  }
  protected dismiss(): void {
    this.expanded.set(false);
    this.query.set('');
  }
  retry(): void {
    this.request.reload();
  }
  loadMore(): void {
    if (this.canLoadMore() && !this.busy() && !this.failed()) {
      this.pageOffset.set(this.pageCache().options.length);
    }
  }
  private pageKey(event: KeyboardEvent): void {
    if (
      event.key !== 'PageDown' ||
      !this.canLoadMore() ||
      event.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    event.preventDefault();
    event.stopImmediatePropagation();
    this.loadMore();
  }
  protected scrollOptions(event: Event): void {
    const host = event.target as HTMLElement;
    this.viewportOffset.set(host.scrollTop);
    if (
      host.scrollTop + host.clientHeight >=
      host.scrollHeight - Math.max(1, this.itemHeight()) * 2
    )
      this.loadMore();
  }
  protected installOptionKeyboard(activate: (value: T) => void): void {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const input = this.element.querySelector('input');
      if (!input) return;
      const onKey = (event: KeyboardEvent): void => {
        this.pageKey(event);
        if (!event.defaultPrevented) this.virtualKeys(event, activate);
      };
      // Capture keys owned by the paging or virtual viewport before Angular Aria relays them.
      input.addEventListener('keydown', onKey, true);
      destroy.onDestroy(() => input.removeEventListener('keydown', onKey, true));
    });
  }
  private virtualKeys(event: KeyboardEvent, activate: (value: T) => void): void {
    if (!this.virtualized() || this.blocked() || event.isComposing) return;
    const items = this.results();
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.key === 'Escape') {
      this.dismiss();
      return;
    }
    if (event.key === 'Enter') {
      const item = items[this.activeIndex()];
      if (item && !item.disabled) activate(item.option.value);
      return;
    }
    this.expand(true);
    const direction = event.key === 'ArrowUp' || event.key === 'End' ? -1 : 1;
    let index =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : this.activeIndex() + direction;
    while (index >= 0 && index < items.length && items[index]?.disabled) index += direction;
    if (index < 0 || index >= items.length) return;
    this.activeIndex.set(index);
    this.viewportOffset.set(
      Math.max(0, index * Math.max(1, this.itemHeight()) - Math.max(1, this.viewportHeight()) / 2),
    );
    queueMicrotask(() => {
      const option = this.element.ownerDocument.getElementById(this.id() + '-option-' + index),
        viewport = option?.closest<HTMLElement>('.options');
      if (viewport) viewport.scrollTop = this.viewportOffset();
    });
  }
  protected remember(values: readonly T[]): void {
    const metadata = this.results()
      .filter((item) => values.some((value) => this.same(value, item.option.value)))
      .map((item) => item.option);
    this.retained.update((current) => [
      ...metadata,
      ...current.filter(
        (option) =>
          values.some((value) => this.same(value, option.value)) &&
          !metadata.some((item) => this.same(item.value, option.value)),
      ),
    ]);
  }
  reset(): void {
    this.dismiss();
    this.retained.set([]);
    this.pageOffset.set(0);
    this.pageCache.set({ query: '', options: [], hasMore: false });
  }
}
