import { EXAMPLE } from './examples/action-sheet';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyActionSheet } from '@hyalo/angular/action-sheet';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-action-sheet-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyActionSheet, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './action-sheet.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HySheetAction.data',
      type: 'unknown',
      default: 'data',
      description: 'Application data carried by the selected action.',
    },
    {
      name: 'HySheetAction.handler',
      type: '() => boolean | void | Promise<boolean | void>',
      default: 'data',
      description:
        'Action handler; return false to keep the sheet open. Async handlers serialize button execution.',
    },
    {
      name: 'HyActionSheet.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents new user and programmatic actions.',
    },
    {
      name: 'HyActionSheet.closeOnSelect',
      type: 'boolean',
      default: 'true',
      description: 'Controls whether selection also closes the surface.',
    },
    {
      name: 'HyActionSheet.pending',
      type: 'string | null',
      default: 'signal',
      description: 'Pending execution state; prevents further interaction.',
    },
    {
      name: 'HyActionSheet.actionError',
      type: '{\n    readonly action: HySheetAction;\n    readonly error: unknown;\n  }',
      default: 'output',
      description: 'Failed handler and its action; the sheet remains available for retry.',
    },
    {
      name: 'HyActionSheet.choose()',
      type: '(action: HySheetAction) => Promise<void>',
      default: 'method',
      description: 'Runs an enabled action handler and emits selection only when accepted.',
    },
    {
      name: 'HyActionSheet.open',
      type: 'boolean',
      default: 'false',
      description: 'Controlled open state; supports two-way binding.',
    },
    {
      name: 'HyActionSheet.heading',
      type: 'string',
      default: 'required',
      description: 'Visible section heading and accessible surface name.',
    },
    {
      name: 'HyActionSheet.description',
      type: 'string',
      default: "''",
      description: 'Supporting text below the heading.',
    },
    {
      name: 'HyActionSheet.actions',
      type: 'readonly HySheetAction[]',
      default: 'required',
      description: 'Immutable action list with stable IDs, labels and optional disabled/tone/icon.',
    },
    {
      name: 'HyActionSheet.options',
      type: 'HyBottomSheetConfig',
      default:
        "{\n    breakpoints: [1],\n    initialBreakpoint: 1,\n    size: 'min(32rem, 85dvh)',\n  }",
      description: 'Sheet configuration; shares the drawer material, focus and data contract.',
    },
    {
      name: 'HyActionSheet.cancelLabel',
      type: 'string',
      default: "'Cancel'",
      description: 'Localized text for cancel.',
    },
    {
      name: 'HyActionSheet.selected',
      type: 'HySheetAction',
      default: 'output',
      description: 'Emits the selected data item; the host performs the work.',
    },
    {
      name: 'HyActionSheet.dismissed',
      type: 'void',
      default: 'output',
      description: 'Requests dismissal; controlled data remains owned by the host.',
    },
    {
      name: 'HySheetAction',
      type: 'HyAction & { role? }',
      default: 'data',
      description:
        'Stable id, label, optional icon, description, tone, disabled, and default/destructive/cancel role.',
    },
  ];
  protected readonly open = signal(false);
  protected readonly selection = signal('No action chosen');
  protected readonly actions = [
    { id: 'save', label: 'Save conversation' },
    { id: 'delete', label: 'Delete conversation', role: 'destructive' as const },
    { id: 'cancel', label: 'Cancel', role: 'cancel' as const },
  ];
}
