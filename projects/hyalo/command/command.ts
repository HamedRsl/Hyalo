import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { normalizeSearch } from '@hyalo/angular/core';
import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  DestroyRef,
  effect,
  computed,
  inject,
  signal,
} from '@angular/core';
import { injectId } from '@hyalo/angular/core';
export interface HyCommandItem<T = unknown> {
  readonly id: string;
  readonly label: string;
  readonly value: T;
  readonly description?: string;
  readonly keywords?: readonly string[];
  readonly group?: string;
  readonly shortcut?: string;
  readonly disabled?: boolean;
  readonly children?: readonly HyCommandItem<T>[];
}
export interface HyCommandConfig<T = unknown> {
  readonly items: readonly HyCommandItem<T>[];
  readonly label?: string;
  readonly placeholder?: string;
  readonly emptyLabel?: string;
  readonly backLabel?: string;
  readonly loadingLabel?: string;
  readonly errorLabel?: string;
  readonly loadItems?: (query: string, signal: AbortSignal) => Promise<readonly HyCommandItem<T>[]>;
}
@Component({
  selector: 'hy-command-panel',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './command.html',
  styleUrl: './command.css',
})
export class HyCommandPanel {
  protected readonly data = inject(DIALOG_DATA) as HyCommandConfig;
  private readonly ref = inject<DialogRef<HyCommandItem>>(DialogRef);
  protected readonly id = injectId('command');
  protected readonly query = signal('');
  protected readonly pages = signal<readonly (readonly HyCommandItem[])[]>([]);
  private readonly remote = signal<readonly HyCommandItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);
  constructor() {
    let generation = 0;
    let controller: AbortController | undefined;
    inject(DestroyRef).onDestroy(() => {
      generation++;
      controller?.abort();
    });
    effect((onCleanup) => {
      const query = this.query(),
        pages = this.pages(),
        load = this.data.loadItems;
      if (!load || pages.length) return;
      const request = ++generation;
      controller = new AbortController();
      const active = controller;
      onCleanup(() => active.abort());
      this.loading.set(true);
      this.failed.set(false);
      this.remote.set([]);
      void Promise.resolve()
        .then(() => load(query, active.signal))
        .then(
          (items) => {
            if (active.signal.aborted || generation !== request) return;
            this.remote.set(items);
            this.loading.set(false);
          },
          () => {
            if (active.signal.aborted || generation !== request) return;
            this.failed.set(true);
            this.loading.set(false);
          },
        );
    });
  }
  private readonly indexed = computed(() => {
    const pages = this.pages();
    const items = pages.at(-1) ?? (this.data.loadItems ? this.remote() : this.data.items);
    return items.map((item) => ({
      item,
      text: normalizeSearch([item.label, item.description, ...(item.keywords ?? [])].join(' ')),
    }));
  });
  protected readonly matches = computed(() => {
    const words = normalizeSearch(this.query()).split(/\s+/).filter(Boolean);
    return this.indexed()
      .filter((entry) => words.every((word) => entry.text.includes(word)))
      .map((entry) => entry.item);
  });
  protected readonly results = computed(() => this.matches().slice(0, 50));
  protected readonly selected = signal<HyCommandItem[]>([]);
  protected pick(values: readonly HyCommandItem[]): void {
    const item = values[values.length - 1];
    if (item) this.choose(item);
  }
  protected search(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
  protected choose(item: HyCommandItem): void {
    if (item.disabled) return;
    const children = item.children;
    if (children) {
      this.pages.update((pages) => [...pages, children]);
      this.query.set('');
      this.selected.set([]);
    } else this.ref.close(item);
  }
  protected back(): void {
    this.pages.update((pages) => pages.slice(0, -1));
    this.query.set('');
    this.selected.set([]);
  }
  protected dismiss(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.close();
  }
  protected close(): void {
    this.ref.close();
  }
}

@Injectable({ providedIn: 'root' })
export class HyCommand {
  private readonly dialog = inject(Dialog);
  open<T>(config: HyCommandConfig<T>): DialogRef<HyCommandItem<T>> {
    return this.dialog.open<HyCommandItem<T>>(HyCommandPanel, {
      data: config,
      ariaLabel: config.label ?? 'Command palette',
      autoFocus: 'input',
      restoreFocus: true,
      width: '36rem',
      maxWidth: 'calc(100vw - 2rem)',
      maxHeight: 'calc(100dvh - 2rem)',
    });
  }
}
