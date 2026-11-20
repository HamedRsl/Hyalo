import { DocsTokens } from '../shared/tokens-table';
import { EXAMPLE } from './examples/tab-bar';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyTabBar } from '@hyalo/angular/tab-bar';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-tab-bar-page',
  imports: [DocsTokens, DocsPage, DocsExample, DocsImport, DocsApiTable, HyTabBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tab-bar.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HyNavigationContext.$implicit',
      type: 'HyNavigationItem',
      default: 'data',
      description: 'Current item supplied to the template.',
    },
    {
      name: 'HyNavigationContext.active',
      type: 'boolean',
      default: 'data',
      description: 'Whether the navigation item or card is active.',
    },
    {
      name: 'HyNavigationContext.index',
      type: 'number',
      default: 'data',
      description: 'Position in the current item collection.',
    },
    {
      name: 'HyTabBar.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents new user and programmatic actions.',
    },
    {
      name: 'HyTabBar.showLabels',
      type: 'boolean',
      default: 'true',
      description:
        'Displays labels; accessible control names remain available when labels are hidden.',
    },
    {
      name: 'HyTabBar.itemTemplate',
      type: 'TemplateRef<HyNavigationContext> | undefined',
      default: 'undefined',
      description: 'Custom item content inside the native link/button.',
    },
    {
      name: 'HyTabBar.focusItem()',
      type: '(id: string) => boolean',
      default: 'method',
      description: 'Focuses an enabled visible navigation ID; returns whether a link was found.',
    },
    {
      name: 'HyTabBar.items',
      type: 'readonly HyNavigationItem[]',
      default: 'required',
      description: 'Immutable items with stable IDs; templates render each item.',
    },
    {
      name: 'HyTabBar.label',
      type: 'string',
      default: 'required',
      description: 'Accessible name for the control or region.',
    },
    {
      name: 'HyTabBar.activeId',
      type: 'string',
      default: 'undefined',
      description: 'Marks the matching navigation destination as the current page.',
    },
    {
      name: 'HyTabBar.orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Logical layout direction of the control.',
    },
    {
      name: 'HyTabBar.fixed',
      type: 'boolean',
      default: 'false',
      description: 'Pins chrome to the viewport with safe-area spacing.',
    },
    {
      name: 'HyTabBar.selected',
      type: 'HyNavigationItem',
      default: 'output',
      description: 'Emits the selected data item; the host performs the work.',
    },
    {
      name: 'HyNavigationItem',
      type: 'readonly object',
      default: 'data',
      description: 'Stable id, label, href, optional icon/badge and disabled.',
    },
    {
      name: 'material',
      type: 'HyMaterial',
      default: 'HyConfig.material',
      description: 'Uses the shared material directive, fidelity fallback, and token system.',
    },
  ];
  protected readonly active = signal('home');
  protected readonly items = [
    { id: 'home', label: 'Home', href: '/components/tab-bar', icon: 'home' },
    {
      id: 'appointments',
      label: 'Appointments',
      href: '/components/date-picker',
      icon: 'calendar',
      badge: 2,
    },
    { id: 'messages', label: 'Messages', href: '/components/chat', icon: 'message-circle' },
  ];
}
