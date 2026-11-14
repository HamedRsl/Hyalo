import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { injectId } from '@hyalo/angular';
import { copyText } from './copy-text';

export type DocsCodeLanguage = 'html' | 'ts' | 'css';

/** A live demo with its source underneath. */
@Component({
  selector: 'docs-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './example.html',
  styleUrl: './example.css',
})
export class DocsExample {
  private readonly clipboard = inject(Clipboard);
  private readonly document = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly id = injectId('example');
  readonly code = input('');
  readonly language = input<DocsCodeLanguage>('html');
  readonly tsCode = input('');
  readonly cssCode = input('');
  readonly column = input(false, { transform: booleanAttribute });
  protected readonly selected = signal<DocsCodeLanguage>('html');
  protected readonly snippets = computed(() => {
    const snippets = [
      { language: this.language(), label: this.language().toUpperCase(), source: this.code() },
      { language: 'ts' as const, label: 'TypeScript', source: this.tsCode() },
      { language: 'css' as const, label: 'CSS', source: this.cssCode() },
    ].filter((snippet) => snippet.source.trim());
    return snippets.filter(
      (snippet, index) =>
        snippets.findIndex((other) => other.language === snippet.language) === index,
    );
  });
  protected readonly active = computed(
    () =>
      this.snippets().find((snippet) => snippet.language === this.selected()) ?? this.snippets()[0],
  );
  private readonly result = signal<{ source: string; state: 'copied' | 'error' } | null>(null);
  protected readonly copyState = computed(() =>
    this.result()?.source === this.active()?.source ? this.result()?.state : null,
  );
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroy.onDestroy(() => clearTimeout(this.timer));
  }

  protected select(language: DocsCodeLanguage): void {
    this.selected.set(language);
  }
  protected keydown(event: KeyboardEvent, index: number): void {
    const rtl = this.document.defaultView?.getComputedStyle(this.element).direction === 'rtl';
    let next = index;
    if (event.key === 'ArrowRight') next += rtl ? -1 : 1;
    else if (event.key === 'ArrowLeft') next += rtl ? 1 : -1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = this.snippets().length - 1;
    else return;
    event.preventDefault();
    next = (next + this.snippets().length) % this.snippets().length;
    const snippet = this.snippets()[next];
    if (!snippet) return;
    this.select(snippet.language);
    this.element.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();
  }
  protected async copy(): Promise<void> {
    const snippet = this.active();
    if (!snippet) return;
    const copied = await copyText(snippet.source, this.document, this.clipboard);
    if (this.destroy.destroyed) return;
    this.result.set({ source: snippet.source, state: copied ? 'copied' : 'error' });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.result.set(null), 2000);
  }
}
