import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
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
export interface HyNavigationMetadata {
  readonly description?: string;
  readonly icon?: string;
  readonly badge?: string;
  readonly title?: string;
  readonly target?: string;
  readonly rel?: string;
  readonly disabled?: boolean;
  readonly visible?: boolean;
  readonly command?: (event: HyNavigationCommandEvent) => void;
}
export interface HyNavigationCommandEvent {
  readonly item: HyNavigationItem | HyNavigationLink;
  readonly originalEvent: MouseEvent;
}
export interface HyNavigationLink extends HyNavigationMetadata {
  readonly label: string;
  readonly href: string;
}
export interface HyNavigationSection {
  readonly label: string;
  readonly links: readonly HyNavigationLink[];
}
export interface HyNavigationItem extends HyNavigationMetadata {
  readonly id: string;
  readonly label: string;
  readonly href?: string;
  readonly sections?: readonly HyNavigationSection[];
  /** Child disclosures. IDs must be unique within each sibling list. */
  readonly children?: readonly HyNavigationItem[];
}
@Component({
  selector: 'hy-navigation-menu',
  imports: [NgTemplateOutlet, HyIcon, CdkConnectedOverlay, CdkOverlayOrigin],
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
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private trigger: HTMLElement | null = null;
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
  ];
  protected outside(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }
  private panel(): HTMLElement | null {
    const open = this.open();
    return open === null ? null : this.document.getElementById(this.id + '-' + open);
  }
  private panelStops(): HTMLElement[] {
    return [
      ...(this.panel()?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)') ?? []),
    ];
  }
  protected enterPanel(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || event.shiftKey || event.currentTarget !== this.trigger) return;
    const [first] = this.panelStops();
    if (first) {
      event.preventDefault();
      first.focus();
    }
  }
  protected panelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      const branch = (event.target as HTMLElement).closest<HTMLElement>('[data-branch]');
      const branchId = branch?.dataset['branch'];
      if (branchId && this.expanded().has(branchId)) {
        event.preventDefault();
        event.stopPropagation();
        this.document.getElementById(branchId + ':trigger')?.focus();
        this.toggleBranch(branchId);
        return;
      }
      this.escape(event);
      return;
    }
    if (event.key !== 'Tab') return;
    const links = this.panelStops();
    if (event.shiftKey && event.target === links[0]) {
      event.preventDefault();
      this.trigger?.focus();
    } else if (!event.shiftKey && event.target === links[links.length - 1]) {
      const panel = this.panel();
      const targets = [
        ...this.document.querySelectorAll<HTMLElement>(
          'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
        ),
      ].filter(
        (el) =>
          !panel?.contains(el) && !el.closest('[hidden],[inert]') && el.getClientRects().length > 0,
      );
      const triggerIndex = this.trigger ? targets.indexOf(this.trigger) : -1;
      const next = triggerIndex < 0 ? undefined : targets[triggerIndex + 1];
      if (next) {
        event.preventDefault();
        this.close();
        next.focus();
      }
    }
  }
  toggle(id: string, event: Event): void {
    const item = this.items().find((item) => item.id === id);
    if (!item || item.disabled || item.visible === false) return;
    this.trigger = event.currentTarget as HTMLElement;
    this.expanded.set(new Set());
    this.open.update((value) => (value === id ? null : id));
  }
  protected branchId(parent: string, item: HyNavigationItem): string {
    return parent + '/' + encodeURIComponent(item.id);
  }
  protected activate(item: HyNavigationItem | HyNavigationLink, event: MouseEvent): void {
    if (item.disabled || item.visible === false) {
      event.preventDefault();
      return;
    }
    item.command?.({ item, originalEvent: event });
    this.close();
  }
  protected linkRel(item: HyNavigationMetadata): string | undefined {
    return item.target === '_blank'
      ? [
          ...new Set([...(item.rel?.split(/\s+/).filter(Boolean) ?? []), 'noopener', 'noreferrer']),
        ].join(' ')
      : item.rel;
  }
  protected toggleBranch(id: string): void {
    this.expanded.update((expanded) => {
      if (!expanded.has(id)) return new Set([...expanded, id]);
      return new Set(
        [...expanded].filter((branch) => branch !== id && !branch.startsWith(id + '/')),
      );
    });
  }
  protected close(): void {
    this.expanded.set(new Set());
    this.open.set(null);
  }
  escape(event: Event): void {
    if (this.open() !== null) {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      this.trigger?.focus();
    }
  }
  focusOut(event: FocusEvent): void {
    if (
      event.relatedTarget &&
      !this.host.nativeElement.contains(event.relatedTarget as Node) &&
      !this.panel()?.contains(event.relatedTarget as Node)
    )
      this.close();
  }
}
