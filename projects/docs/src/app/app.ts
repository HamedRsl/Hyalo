import { ChangeDetectionStrategy, Component, TemplateRef, inject, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  HY_DIALOG_PARTS,
  HY_NAVBAR,
  HyButton,
  HyDialogRef,
  HyDrawer,
  HyIcon,
  HyPopover,
  HySegmented,
  type HyFidelityTier,
} from '@hyalo/angular';
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
  private readonly drawer = inject(HyDrawer);
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
  protected readonly tiers = [
    { value: 'high' as HyFidelityTier, label: 'High' },
    { value: 'medium' as HyFidelityTier, label: 'Medium' },
    { value: 'low' as HyFidelityTier, label: 'Low' },
  ];

  protected openPages(): void {
    this.pagesRef = this.drawer.open(this.pagesTemplate(), { side: 'start', label: 'Pages' });
  }

  protected closePages(): void {
    this.pagesRef?.close();
    this.pagesRef = null;
  }
}
