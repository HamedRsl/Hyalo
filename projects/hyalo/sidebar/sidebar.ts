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
  styles:
    ':host{display:flex;align-items:center;justify-content:var(--hy-sidebar-item-justify,start);gap:.75rem;min-block-size:44px;padding:.5rem .75rem;border-radius:var(--hy-radius-s);color:var(--hy-ink-2);text-decoration:none;font-weight:500;box-sizing:border-box}.label{display:var(--hy-sidebar-label-display,inline);overflow-wrap:anywhere}:host(:hover){background:var(--hy-surface-3)}:host([aria-current=page]){background:var(--hy-primary-wash);color:var(--hy-primary)}:host(:focus-visible){outline:2px solid var(--hy-primary);outline-offset:2px}hy-icon{flex:none}',
})
export class HySidebarItem {
  readonly label = input.required<string>();
  readonly icon = input.required<string>();
  readonly active = input(false, { transform: booleanAttribute });
}
export const HY_SIDEBAR = [HySidebar, HySidebarItem] as const;
