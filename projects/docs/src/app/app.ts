import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  TemplateRef,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HyButton } from '@hyalo/angular/button';
import { HY_DIALOG_PARTS, type HyDialogRef } from '@hyalo/angular/dialog';
import { HyIcon } from '@hyalo/angular/icon';
import { HY_NAVBAR } from '@hyalo/angular/navbar';
import { HyPopover } from '@hyalo/angular/popover';
import { HySegmented } from '@hyalo/angular/segmented';
import type { HyFidelityTier } from '@hyalo/angular';
import type { HyPaletteName } from '@hyalo/angular/theme';
import { NAV } from './nav';
import { DocsSettings, type DirChoice, type MotionChoice, type ThemeChoice } from './settings';

@Component({
  selector: 'docs-root',
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HY_NAVBAR,
    HY_DIALOG_PARTS,
    HyButton,
    HyIcon,
    HyPopover,
    HySegmented,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly settings = inject(DocsSettings);
  private readonly injector = inject(Injector);
  private readonly pagesTemplate = viewChild.required<TemplateRef<unknown>>('pages');
  private pagesRef: HyDialogRef | null = null;

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
    { value: 'high' as HyFidelityTier, label: 'High' },
    { value: 'medium' as HyFidelityTier, label: 'Medium' },
    { value: 'low' as HyFidelityTier, label: 'Low' },
  ];

  /** The drawer is only used on narrow screens, so its code loads on the first tap. */
  protected async openPages(): Promise<void> {
    const { openPagesDrawer } = await import('./pages-drawer');
    this.pagesRef = openPagesDrawer(this.injector, this.pagesTemplate());
  }

  protected closePages(): void {
    this.pagesRef?.close();
    this.pagesRef = null;
  }
}
