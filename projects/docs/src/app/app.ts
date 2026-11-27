import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  DestroyRef,
  afterNextRender,
  TemplateRef,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import type { DialogRef } from '@angular/cdk/dialog';
import type { HyCommandItem } from '@hyalo/angular/command';
import { HyKbd } from '@hyalo/angular/kbd';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HyButton } from '@hyalo/angular/button';
import { HY_DIALOG_PARTS, type HyDialogRef } from '@hyalo/angular/dialog';
import { HyIcon } from '@hyalo/angular/icon';
import { HY_NAVBAR } from '@hyalo/angular/navbar';
import { HyPopover } from '@hyalo/angular/popover';
import { HySelect } from '@hyalo/angular/select';
import { HySegmented } from '@hyalo/angular/segmented';
import type { HyFidelityTier } from '@hyalo/angular/core';
import type { HyPaletteName } from '@hyalo/angular/theme';
import { NAV } from './nav';
import { DocsSettings, type DirChoice, type MotionChoice, type ThemeChoice } from './settings';

@Component({
  selector: 'docs-root',
  imports: [
    NgTemplateOutlet,
    HyKbd,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HY_NAVBAR,
    HY_DIALOG_PARTS,
    HyButton,
    HyIcon,
    HyPopover,
    HySegmented,
    HySelect,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly settings = inject(DocsSettings);
  protected readonly locales = [{ value: 'en', label: 'English' }, { value: 'fa', label: 'فارسی' }];
  protected readonly materials = [
    { value: '', label: 'Component default' },
    { value: 'clear', label: 'Clear' },
    { value: 'frosted', label: 'Frosted' },
    { value: 'tinted', label: 'Tinted' },
    { value: 'solid', label: 'Solid' },
  ];
  private readonly injector = inject(Injector);
  private readonly pagesTemplate = viewChild.required<TemplateRef<unknown>>('pages');
  private pagesRef: HyDialogRef | null = null;

  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private commandRef: DialogRef<HyCommandItem<string>> | null = null;
  private commandLoading = false;
  private destroyed = false;
  constructor() {
    const abort = new AbortController();
    afterNextRender(() =>
      this.document.addEventListener(
        'keydown',
        (event) => {
          if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === 'k' &&
            !event.isComposing &&
            !event.repeat
          ) {
            event.preventDefault();
            void this.openSearch();
          }
        },
        { signal: abort.signal },
      ),
    );
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      abort.abort();
      this.commandRef?.close();
    });
  }
  protected async openSearch(): Promise<void> {
    if (this.commandLoading || this.commandRef) return;
    this.commandLoading = true;
    try {
      const { HyCommand } = await import('@hyalo/angular/command');
      if (this.destroyed) return;
      this.commandRef = this.injector.get(HyCommand).open({
        label: 'Search documentation',
        items: NAV.flatMap((group) =>
          group.items.map((item) => ({
            id: item.path,
            label: item.label,
            group: group.title,
            value: item.path,
          })),
        ),
      });
      this.commandRef.closed.subscribe((item) => {
        this.commandRef = null;
        if (item) void this.router.navigateByUrl(item.value);
      });
    } finally {
      this.commandLoading = false;
    }
  }
  protected readonly nav = NAV;
  protected readonly themes = [
    { value: 'system' as ThemeChoice, label: 'System' },
    { value: 'light' as ThemeChoice, label: 'Light' },
    { value: 'dark' as ThemeChoice, label: 'Dark' },
  ];
  protected readonly directions = [
    { value: 'ltr' as DirChoice, label: 'LTR' },
    { value: 'rtl' as DirChoice, label: 'RTL' },
  ];
  protected readonly motions = [
    { value: 'system' as MotionChoice, label: 'System' },
    { value: 'full' as MotionChoice, label: 'Full' },
    { value: 'reduced' as MotionChoice, label: 'Reduced' },
  ];
  /**
   * Swatches show the light and dark primary of each palette. They are
   * written out here because a palette's CSS is not loaded until it is picked.
   */
  protected readonly palettes: readonly {
    value: HyPaletteName | null;
    label: string;
    light: string;
    dark: string;
  }[] = [
    { value: null, label: 'Hyalo', light: '#3a4cd0', dark: '#8e9cff' },
    { value: 'aurora', label: 'Aurora', light: '#0f766e', dark: '#2dd4bf' },
    { value: 'ember', label: 'Ember', light: '#b33b0a', dark: '#fb923c' },
    { value: 'orchid', label: 'Orchid', light: '#7634cc', dark: '#c39bff' },
    { value: 'ocean', label: 'Ocean', light: '#0369a1', dark: '#38bdf8' },
    { value: 'rose', label: 'Rose', light: '#b8175a', dark: '#f472b6' },
    { value: 'graphite', label: 'Graphite', light: '#1f1f23', dark: '#ececef' },
  ];
  protected readonly paletteLabel = computed(
    () => this.palettes.find((p) => p.value === this.settings.palette())?.label ?? 'Hyalo',
  );
  protected readonly tiers = [
    { value: 'auto' as const, label: 'Auto' },
    { value: 'high' as HyFidelityTier, label: 'High' },
    { value: 'medium' as HyFidelityTier, label: 'Medium' },
    { value: 'low' as HyFidelityTier, label: 'Low' },
  ];

  /** The drawer is only used on narrow screens, so its code loads on the first tap. */
  protected async openPages(): Promise<void> {
    const { openPagesDrawer } = await import('./pages-drawer');
    this.pagesRef = openPagesDrawer(this.injector, this.pagesTemplate());
  }

  protected revealNavLink(link: HTMLAnchorElement): void {
    afterNextRender(
      () => {
        if (!link.isConnected) return;
        const nav = link.closest<HTMLElement>('nav');
        if (!nav || nav.scrollHeight <= nav.clientHeight) return;
        const bounds = nav.getBoundingClientRect(),
          selected = link.getBoundingClientRect();
        if (selected.top < bounds.top || selected.bottom > bounds.bottom)
          nav.scrollTop += selected.top - bounds.top - (nav.clientHeight - selected.height) / 2;
      },
      { injector: this.injector },
    );
  }

  protected closePages(): void {
    this.pagesRef?.close();
    this.pagesRef = null;
  }
}
