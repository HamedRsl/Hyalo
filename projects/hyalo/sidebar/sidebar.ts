import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { HySidebarItem } from './sidebar-item';
import { HySidebarGroup, HySidebarGroups } from './sidebar-group';
export { HySidebarItem } from './sidebar-item';
export * from './sidebar-group';

@Component({
  selector: 'hy-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  host: {
    '[attr.data-collapsed]': 'collapsed()',
    '[style.--hy-sidebar-label-display]': 'collapsed() ? "none" : null',
    '[style.--hy-sidebar-item-justify]': 'collapsed() ? "center" : null',
  },
})
export class HySidebar {
  readonly collapsed = model(false);
  protected readonly toggle = (value: boolean): boolean => !value;
  readonly label = input('Main navigation');
  readonly collapseLabel = input('Collapse navigation');
  readonly expandLabel = input('Expand navigation');
}
export const HY_SIDEBAR = [HySidebar, HySidebarItem, HySidebarGroup, HySidebarGroups] as const;
