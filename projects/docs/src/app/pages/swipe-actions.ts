import { DocsTokens } from '../shared/tokens-table';
import { EXAMPLE } from './examples/swipe-actions';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HySwipeActions } from '@hyalo/angular/swipe-actions';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-swipe-actions-page',
  imports: [DocsTokens, DocsPage, DocsExample, DocsImport, DocsApiTable, HySwipeActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './swipe-actions.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HySwipeActions.closeOnSelect',
      type: 'boolean',
      default: 'true',
      description: 'Controls whether selection also closes the surface.',
    },
    {
      name: 'HySwipeActions.fullSwipeThreshold',
      type: 'number',
      default: '1.5',
      description:
        'Full-swipe action threshold as a multiple of the revealed rail width; minimum one.',
    },
    {
      name: 'HySwipeActions.sliding',
      type: '{\n    readonly amount: number;\n    readonly ratio: number;\n  }',
      default: 'output',
      description: 'Physical displacement and signed logical rail ratio while moving.',
    },
    {
      name: 'HySwipeActions.reveal()',
      type: "(side: 'start' | 'end') => boolean",
      default: 'method',
      description: 'Opens an available enabled start/end rail; returns whether it exists.',
    },
    {
      name: 'HySwipeActions.getOpenAmount()',
      type: '() => number',
      default: 'method',
      description: 'Current physical horizontal displacement in pixels.',
    },
    {
      name: 'HySwipeActions.getSlidingRatio()',
      type: '() => number',
      default: 'method',
      description: 'Signed logical displacement divided by rail width; overswipe can exceed one.',
    },
    {
      name: 'HySwipeActions.label',
      type: 'string',
      default: 'required',
      description: 'Accessible name for the control or region.',
    },
    {
      name: 'HySwipeActions.startActions',
      type: 'readonly HyAction[]',
      default: '[]',
      description: 'Actions revealed at the logical start edge.',
    },
    {
      name: 'HySwipeActions.endActions',
      type: 'readonly HyAction[]',
      default: '[]',
      description: 'Actions revealed at the logical end edge.',
    },
    {
      name: 'HySwipeActions.open',
      type: "'start' | 'end' | null",
      default: 'null',
      description: 'Controlled open state; supports two-way binding.',
    },
    {
      name: 'HySwipeActions.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents interaction and new actions.',
    },
    {
      name: 'HySwipeActions.autoClose',
      type: 'boolean',
      default: 'true',
      description: 'Closes the rail on an outside pointer interaction.',
    },
    {
      name: 'HySwipeActions.fullSwipe',
      type: 'boolean',
      default: 'false',
      description: 'Opt-in release beyond 1.5 rail widths selects its first enabled action.',
    },
    {
      name: 'HySwipeActions.actionsLabel',
      type: 'string',
      default: "'Actions'",
      description: 'Localized text for actions.',
    },
    {
      name: 'HySwipeActions.closeLabel',
      type: 'string',
      default: "'Close actions'",
      description: 'Localized text for close.',
    },
    {
      name: 'HySwipeActions.actionWidth',
      type: 'number',
      default: '88',
      description: 'Per-action reveal width in pixels; minimum 44.',
    },
    {
      name: 'HySwipeActions.selected',
      type: 'HySwipeActionEvent',
      default: 'output',
      description: 'Emits the selected data item; the host performs the work.',
    },
    {
      name: 'HySwipeActionEvent',
      type: '{ action: HyAction; side: start | end }',
      default: 'event',
      description: 'The application decides whether to change or remove the row.',
    },
    {
      name: 'close()',
      type: 'void',
      default: 'method',
      description: 'Closes both rails and restores focus from their controls.',
    },
  ];
  protected readonly start = [{ id: 'read', label: 'Mark read', tone: 'success' as const }];
  protected readonly end = [
    { id: 'archive', label: 'Archive' },
    { id: 'delete', label: 'Delete', tone: 'danger' as const },
  ];
  protected readonly selection = signal('No action selected');
}
