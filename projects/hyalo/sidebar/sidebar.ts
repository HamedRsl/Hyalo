import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';
import { HyIcon } from '@hyalo/angular/icon';
@Component({
  selector: 'hy-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  host: {
    '[attr.data-collapsed]': 'collapsed()',
    '[style.--hy-sidebar-label-display]': 'collapsed()?"none":null',
    '[style.--hy-sidebar-item-justify]': 'collapsed()?"center":null',
  },
})
export class HySidebar {
  readonly collapsed = model(false);
  protected readonly toggle = (value: boolean): boolean => !value;
  readonly label = input('Main navigation');
  readonly collapseLabel = input('Collapse navigation');
  readonly expandLabel = input('Expand navigation');
}
@Component({
  // Native elements preserve link, list, key, and button semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[hySidebarItem]',
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<hy-icon [name]="icon()" /><span class="label">{{label()}}</span><ng-content />',
  host: {
    '[attr.aria-label]': 'label()',
    '[attr.title]': 'label()',
    '[attr.aria-current]': 'active()?"page":null',
  },
  styleUrl: './sidebar-item.css',
})
export class HySidebarItem {
  readonly label = input.required<string>();
  readonly icon = input.required<string>();
  readonly active = input(false, { transform: booleanAttribute });
}
export const HY_SIDEBAR = [HySidebar, HySidebarItem] as const;
