import { EXAMPLE } from './examples/dock';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyDock } from '@hyalo/angular/dock';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-dock-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyDock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dock.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HyDock.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents new user and programmatic actions.',
    },
    {
      name: 'HyDock.showLabels',
      type: 'boolean',
      default: 'true',
      description:
        'Displays labels; accessible control names remain available when labels are hidden.',
    },
    {
      name: 'HyDock.itemTemplate',
      type: 'TemplateRef<HyNavigationContext> | undefined',
      default: 'undefined',
      description: 'Custom item content inside the native link/button.',
    },
    {
      name: 'HyDock.breakpoint',
      type: 'number',
      default: '640',
      description:
        'Viewport width in pixels below which the dock becomes a horizontal bottom dock.',
    },
    {
      name: 'HyDock.focusItem()',
      type: '(id: string) => boolean',
      default: 'method',
      description: 'Focuses an enabled visible navigation ID; returns whether a link was found.',
    },
    {
      name: 'material',
      type: 'HyMaterial',
      default: 'HyConfig.material',
      description:
        'Forwards the existing shared material/fidelity contract to the tab-bar surface.',
    },

    {
      name: 'HyDock.items',
      type: 'readonly HyNavigationItem[]',
      default: 'required',
      description: 'Immutable items with stable IDs; templates render each item.',
    },
    {
      name: 'HyDock.label',
      type: 'string',
      default: 'required',
      description: 'Accessible name for the control or region.',
    },
    {
      name: 'HyDock.activeId',
      type: 'string',
      default: 'undefined',
      description: 'Marks the matching navigation destination as the current page.',
    },
    {
      name: 'HyDock.position',
      type: "'top' | 'bottom' | 'start' | 'end'",
      default: "'bottom'",
      description: 'Logical viewport edge used by the dock.',
    },
    {
      name: 'HyDock.fixed',
      type: 'boolean',
      default: 'false',
      description: 'Pins chrome to the viewport with safe-area spacing.',
    },
    {
      name: 'HyDock.magnify',
      type: 'boolean',
      default: 'false',
      description: 'Opt-in icon scaling for fine hover pointers with motion enabled.',
    },
    {
      name: 'HyDock.magnification',
      type: 'number',
      default: '1.35',
      description: 'Maximum icon scale, bounded between 1 and 2.',
    },
    {
      name: 'HyDock.distance',
      type: 'number',
      default: '96',
      description: 'Pointer influence radius in pixels.',
    },
    {
      name: 'HyDock.selected',
      type: 'HyNavigationItem',
      default: 'output',
      description: 'Emits the selected data item; the host performs the work.',
    },
  ];
  protected readonly active = signal('home');
  protected readonly items = [
    { id: 'home', label: 'Home', href: '/components/dock', icon: 'home' },
    { id: 'messages', label: 'Messages', href: '/components/chat', icon: 'message-circle' },
    { id: 'settings', label: 'Settings', href: '/advanced-forms', icon: 'settings' },
  ];
}
