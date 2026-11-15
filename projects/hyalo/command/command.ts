import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { normalizeSearch } from '@hyalo/angular/core';
import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
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
}
export interface HyCommandConfig<T = unknown> {
  readonly items: readonly HyCommandItem<T>[];
  readonly label?: string;
  readonly placeholder?: string;
  readonly emptyLabel?: string;
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
  private readonly indexed = this.data.items.map((item) => ({
    item,
    text: normalizeSearch([item.label, item.description, ...(item.keywords ?? [])].join(' ')),
  }));
  protected readonly matches = computed(() => {
    const words = normalizeSearch(this.query()).split(/\s+/).filter(Boolean);
    return this.indexed
      .filter((entry) => words.every((word) => entry.text.includes(word)))
      .map((entry) => entry.item);
  });
  protected readonly results = computed(() => this.matches().slice(0, 50));
  protected readonly selected = signal<HyCommandItem[]>([]);
  protected pick(values: readonly HyCommandItem[]): void {
    const item = values[values.length - 1];
    if (item && !item.disabled) this.ref.close(item);
  }
  protected search(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
  protected choose(item: HyCommandItem): void {
    if (!item.disabled) this.ref.close(item);
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
