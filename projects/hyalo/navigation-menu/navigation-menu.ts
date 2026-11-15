import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { injectId } from '@hyalo/angular';
export interface HyNavigationLink {
  readonly label: string;
  readonly href: string;
  readonly description?: string;
}
export interface HyNavigationSection {
  readonly label: string;
  readonly links: readonly HyNavigationLink[];
}
export interface HyNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly href?: string;
  readonly sections?: readonly HyNavigationSection[];
}
@Component({
  selector: 'hy-navigation-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navigation-menu.html',
  styleUrl: './navigation-menu.css',
  host: { '(keydown.escape)': 'escape($event)', '(focusout)': 'focusOut($event)' },
})
export class HyNavigationMenu {
  readonly items = input.required<readonly HyNavigationItem[]>();
  readonly label = input('Main navigation');
  readonly open = signal<string | null>(null);
  protected readonly id = injectId('navigation');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private trigger: HTMLElement | null = null;
  constructor() {
    const abort = new AbortController();
    afterNextRender(() =>
      this.document.addEventListener(
        'pointerdown',
        (event) => {
          if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(null);
        },
        { signal: abort.signal },
      ),
    );
    inject(DestroyRef).onDestroy(() => abort.abort());
  }
  toggle(id: string, event: Event): void {
    this.trigger = event.currentTarget as HTMLElement;
    this.open.update((value) => (value === id ? null : id));
  }
  escape(event: Event): void {
    if (this.open()) {
      event.preventDefault();
      event.stopPropagation();
      this.open.set(null);
      this.trigger?.focus();
    }
  }
  focusOut(event: FocusEvent): void {
    if (event.relatedTarget && !this.host.nativeElement.contains(event.relatedTarget as Node))
      this.open.set(null);
  }
}
