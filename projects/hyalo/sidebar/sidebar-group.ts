import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { injectId } from '@hyalo/angular/core';
import { HySidebarItem } from './sidebar-item';

export interface HySidebarNavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
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
  imports: [HySidebarGroup, HySidebarItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar-groups.html',
  styles: ':host { display: grid; gap: var(--hy-sidebar-group-gap, var(--hy-space-5)); }',
})
export class HySidebarGroups {
  readonly groups = input.required<readonly HySidebarNavGroup[]>();
  readonly activeId = input<string>();
  readonly selected = output<HySidebarNavItem>();
  protected readonly visibleGroups = computed(() =>
    this.groups().filter((group) => group.items.length > 0),
  );
}
