import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injectable,
  afterRenderEffect,
  computed,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { injectId } from '@hyalo/angular';
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
const normalize = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .toLocaleLowerCase();
@Component({
  selector: 'hy-command-panel',
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
    text: normalize([item.label, item.description, ...(item.keywords ?? [])].join(' ')),
  }));
  protected readonly matches = computed(() => {
    const words = normalize(this.query()).split(/\s+/).filter(Boolean);
    return this.indexed
      .filter((entry) => words.every((word) => entry.text.includes(word)))
      .map((entry) => entry.item);
  });
  protected readonly results = computed(() => this.matches().slice(0, 50));
  protected readonly active = linkedSignal({
    source: this.results,
    computation: (items) => items.findIndex((item) => !item.disabled),
  });
  protected readonly activeId = computed(() =>
    this.active() >= 0 ? this.id + '-' + this.active() : null,
  );
  private readonly container = viewChild<ElementRef<HTMLElement>>('resultList');
  constructor() {
    afterRenderEffect(() => {
      const index = this.active();
      this.container()
        ?.nativeElement.querySelector<HTMLElement>('[data-index="' + index + '"]')
        ?.scrollIntoView?.({ block: 'nearest' });
    });
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
  protected keydown(event: KeyboardEvent): void {
    const enabled = this.results()
      .map((item, index) => (item.disabled ? -1 : index))
      .filter((index) => index >= 0);
    if (event.key === 'Enter') {
      event.preventDefault();
      const item = this.results()[this.active()];
      if (item) this.choose(item);
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (!enabled.length) return;
    let index = enabled.indexOf(this.active());
    if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = enabled.length - 1;
    else index = (index + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
    this.active.set(enabled[index] ?? -1);
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
