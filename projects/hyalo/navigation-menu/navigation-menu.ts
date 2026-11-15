import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { injectId } from '@hyalo/angular/core';
import { HyIcon } from '@hyalo/angular/icon';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  type ConnectedPosition,
} from '@angular/cdk/overlay';
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
  imports: [HyIcon, CdkConnectedOverlay, CdkOverlayOrigin],
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
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
  ];
  protected outside(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(null);
  }
  private panel(): HTMLElement | null {
    return this.open() ? this.document.getElementById(this.id + '-' + this.open()) : null;
  }
  protected enterPanel(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || event.shiftKey || !this.open()) return;
    const first = this.panel()?.querySelector<HTMLAnchorElement>('a[href]');
    if (first) {
      event.preventDefault();
      first.focus();
    }
  }
  protected panelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.escape(event);
      return;
    }
    if (event.key !== 'Tab') return;
    const links = [...(this.panel()?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? [])];
    if (event.shiftKey && event.target === links[0]) {
      event.preventDefault();
      this.trigger?.focus();
    } else if (!event.shiftKey && event.target === links[links.length - 1]) {
      const targets = [
        ...this.document.querySelectorAll<HTMLElement>(
          'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
        ),
      ].filter((el) => !el.closest('[hidden],[inert]') && el.getClientRects().length > 0);
      const next = this.trigger ? targets[targets.indexOf(this.trigger) + 1] : undefined;
      if (next) {
        event.preventDefault();
        this.open.set(null);
        next.focus();
      }
    }
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
    if (
      event.relatedTarget &&
      !this.host.nativeElement.contains(event.relatedTarget as Node) &&
      !this.panel()?.contains(event.relatedTarget as Node)
    )
      this.open.set(null);
  }
}
