import { Directive, computed, effect, input, resource, signal } from '@angular/core';
import { HyValueControl } from '@hyalo/angular/field';
import { normalizeSearch } from '@hyalo/angular/core';
import type { HySelectOption } from '@hyalo/angular/select';

export type HyOptionLoader<T> = (
  query: string,
  signal: AbortSignal,
) => Promise<readonly HySelectOption<T>[]>;
/** Cancels obsolete requests and keeps asynchronous status separate from selection. */
@Directive()
export abstract class HyOptionQuery<T> extends HyValueControl {
  readonly options = input<readonly HySelectOption<T>[]>([]);
  readonly loadOptions = input<HyOptionLoader<T>>();
  readonly locale = input('en');
  readonly placeholder = input('Search options');
  readonly emptyLabel = input('No matching options');
  readonly loadingLabel = input('Loading options');
  readonly errorLabel = input('Could not load options');
  protected readonly expanded = signal(false);
  constructor() {
    super();
    effect(() => {
      if (this.blocked()) this.expanded.set(false);
    });
  }
  readonly query = signal('');
  private readonly retained = signal<readonly HySelectOption<T>[]>([]);
  protected readonly knownOptions = computed(() => {
    const current = [...this.options(), ...this.retained()];
    return current.filter(
      (option, index) => current.findIndex((item) => item.value === option.value) === index,
    );
  });
  protected readonly request = resource({
    params: () => {
      const load = this.loadOptions();
      return this.expanded() && !this.blocked() && load ? { query: this.query(), load } : undefined;
    },
    loader: ({ params, abortSignal }) => params.load(params.query, abortSignal),
  });
  protected readonly busy = computed(() => this.request.isLoading());
  protected readonly failed = computed(() => this.request.status() === 'error');
  protected readonly results = computed(() => {
    const options = this.loadOptions()
      ? this.request.hasValue()
        ? this.request.value()
        : []
      : this.options();
    const query = normalizeSearch(this.query(), this.locale());
    const keys = new Set<string>();
    return options
      .filter(
        (option) =>
          this.loadOptions() || normalizeSearch(option.label, this.locale()).includes(query),
      )
      .map((option) => {
        if (option.key === undefined && typeof option.value === 'object')
          throw new Error('Object options require a stable key');
        const key = String(option.key ?? typeof option.value + ':' + String(option.value));
        if (keys.has(key)) throw new Error('Duplicate option key: ' + key);
        keys.add(key);
        return { key, option, disabled: !!(option.disabled || option.group?.disabled) };
      });
  });
  protected type(event: Event): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    this.query.set((event.target as HTMLInputElement).value);
    this.expanded.set(true);
  }
  protected expand(value: boolean): void {
    this.expanded.set(value && !this.blocked());
    if (!value) this.query.set('');
  }
  protected dismiss(): void {
    this.expanded.set(false);
    this.query.set('');
  }
  protected retry(): void {
    this.request.reload();
  }
  protected remember(values: readonly T[]): void {
    const metadata = this.results()
      .filter((item) => values.includes(item.option.value))
      .map((item) => item.option);
    this.retained.update((current) => [
      ...metadata,
      ...current.filter(
        (option) =>
          values.includes(option.value) && !metadata.some((item) => item.value === option.value),
      ),
    ]);
  }
  reset(): void {
    this.expanded.set(false);
    this.query.set('');
    this.retained.set([]);
  }
}
