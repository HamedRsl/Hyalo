import { EXAMPLE } from './examples/fab';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyFab } from '@hyalo/angular/fab';
import { HyIcon, provideHyaloRemoteIcons } from '@hyalo/angular/icon';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-fab-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyFab, HyIcon],
  providers: [provideHyaloRemoteIcons({ 'example:mark': { url: 'icon-mark.svg' } })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fab.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HyFabItemContext.$implicit',
      type: 'HyAction',
      default: 'data',
      description: 'Current item supplied to the template.',
    },
    {
      name: 'HyFabItemContext.index',
      type: 'number',
      default: 'data',
      description: 'Position in the current item collection.',
    },
    {
      name: 'HyFab.closeIcon',
      type: 'string',
      default: "''",
      description: 'Optional trigger icon while the speed dial is open.',
    },
    {
      name: 'HyFab.itemTemplate',
      type: 'TemplateRef<HyFabItemContext> | undefined',
      default: 'undefined',
      description: 'Custom item content inside the native link/button.',
    },
    {
      name: 'HyFab.shown',
      type: 'void',
      default: 'output',
      description: 'Emits when the speed dial opens.',
    },
    {
      name: 'HyFab.hidden',
      type: 'void',
      default: 'output',
      description: 'Omits a navigation item, or emits when the speed dial closes.',
    },
    {
      name: 'HyFab.show()',
      type: '() => void',
      default: 'method',
      description: 'Opens an enabled speed dial containing actions.',
    },
    {
      name: 'HyFab.hide()',
      type: '() => void',
      default: 'method',
      description: 'Closes the dial and restores trigger focus.',
    },
    {
      name: 'HyFab.toggle()',
      type: '() => void',
      default: 'method',
      description: 'Toggles a speed dial, or activates a single-action FAB.',
    },
    {
      name: 'HyFab.label',
      type: 'string',
      default: 'required',
      description: 'Accessible name for the control or region.',
    },
    {
      name: 'HyFab.icon',
      type: 'string',
      default: "'plus'",
      description: 'Name from the existing HyIcon registry.',
    },
    {
      name: 'HyFab.closeLabel',
      type: 'string',
      default: "'Close actions'",
      description: 'Localized text for close.',
    },
    {
      name: 'HyFab.actions',
      type: 'readonly HyAction[]',
      default: '[]',
      description: 'Immutable action list with stable IDs, labels and optional disabled/tone/icon.',
    },
    {
      name: 'HyFab.open',
      type: 'boolean',
      default: 'false',
      description: 'Controlled open state; supports two-way binding.',
    },
    {
      name: 'HyFab.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents interaction and new actions.',
    },
    {
      name: 'HyFab.mask',
      type: 'boolean',
      default: 'false',
      description: 'Displays an optional dismissal scrim.',
    },
    {
      name: 'HyFab.hideOnClickOutside',
      type: 'boolean',
      default: 'true',
      description: 'Closes an open speed dial when the pointer starts outside.',
    },
    {
      name: 'HyFab.closeOnSelect',
      type: 'boolean',
      default: 'true',
      description: 'Closes and restores trigger focus after an enabled action.',
    },
    {
      name: 'HyFab.direction',
      type: "'up' | 'down' | 'start' | 'end'",
      default: "'up'",
      description: 'Logical direction in which the speed dial expands.',
    },
    {
      name: 'HyFab.layout',
      type: "'linear' | 'circle' | 'semicircle' | 'quarter-circle'",
      default: "'linear'",
      description: 'Linear, circle, semicircle, or quarter-circle action placement.',
    },
    {
      name: 'HyFab.radius',
      type: 'number',
      default: '88',
      description: 'Radial action distance in pixels; minimum 44.',
    },
    {
      name: 'HyFab.size',
      type: 'HySize',
      default: 'this.config.size',
      description: 'Shared HyConfig control size.',
    },
    {
      name: 'HyFab.tone',
      type: 'HyTone',
      default: 'this.config.tone',
      description: 'Shared semantic HyTone color.',
    },
    {
      name: 'HyFab.selected',
      type: 'HyAction',
      default: 'output',
      description: 'Emits the selected data item; the host performs the work.',
    },
    {
      name: 'HyFab.activated',
      type: 'void',
      default: 'output',
      description: 'Emits when a single FAB with no action list is activated.',
    },
  ];
  protected readonly selection = signal('Choose an action');
  protected readonly actions = [
    { id: 'note', label: 'New note', icon: 'plus' },
    { id: 'message', label: 'New message', icon: 'message-circle' },
    { id: 'locked', label: 'Unavailable', disabled: true },
  ];
}
