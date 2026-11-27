import { RouterLink, type Params, type UrlTree } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { injectId } from '@hyalo/angular/core';
import { HySidebarItem } from './sidebar-item';

export interface HySidebarNavItem {
  readonly id: string;
  readonly label: string;
  readonly href?: string;
  readonly routerLink?: string | readonly unknown[] | UrlTree;
  readonly queryParams?: Params;
  readonly fragment?: string;
  readonly state?: Record<string, unknown>;
  readonly children?: readonly HySidebarNavItem[];
  readonly disabled?: boolean;
  readonly visible?: boolean;
  readonly icon?: string;
  readonly description?: string;
  readonly count?: number | null;
  readonly countLabel?: string;
}
export interface HySidebarNavGroup {
  readonly id: string;
  readonly label: string;
  readonly items: readonly HySidebarNavItem[];
}

@Component({
  selector: 'hy-sidebar-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p class="heading" [id]="headingId">{{ label() }}</p><ng-content />',
  styleUrl: './sidebar-group.css',
  host: { role: 'group', '[attr.aria-labelledby]': 'headingId' },
})
export class HySidebarGroup {
  readonly label = input.required<string>();
  protected readonly headingId = injectId('sidebar-group');
}

@Component({
  selector: 'hy-sidebar-groups',
  imports: [RouterLink, NgTemplateOutlet, HySidebarGroup, HySidebarItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar-groups.html',
  styleUrl: './sidebar-groups.css',
})
export class HySidebarGroups {
  readonly groups = input.required<readonly HySidebarNavGroup[]>();
  readonly activeId = input<string>();
  readonly selected = output<HySidebarNavItem>();
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());
  protected toggle(id: string): void {
    this.expanded.update(set => { const next = new Set(set); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  protected close(event: Event, id: string): void {
    event.stopPropagation(); this.expanded.update(set => { const next = new Set(set); next.delete(id); return next; });
    (event.target as HTMLElement).closest('li')?.querySelector('button')?.focus();
  }
  protected activate(event: Event, item: HySidebarNavItem): void {
    if (item.disabled) event.preventDefault(); else this.selected.emit(item);
  }
  protected readonly visibleGroups = computed(() =>
    this.groups().filter((group) => group.items.length > 0),
  );
}
