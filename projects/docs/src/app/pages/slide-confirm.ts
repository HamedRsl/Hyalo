import { DocsTokens } from '../shared/tokens-table';
import { EXAMPLE } from './examples/slide-confirm';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HySlideConfirm } from '@hyalo/angular/slide-confirm';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-slide-confirm-page',
  imports: [DocsTokens, DocsPage, DocsExample, DocsImport, DocsApiTable, HySlideConfirm, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slide-confirm.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HySlideConfirm.loadingLabel',
      type: 'string',
      default: "'Confirming'",
      description: 'Localized loading text.',
    },
    {
      name: 'HySlideConfirm.confirm()',
      type: '() => void',
      default: 'method',
      description: 'Commits confirmation once, respecting disabled, readonly and loading.',
    },
    {
      name: 'HySlideConfirm.value',
      type: 'boolean',
      default: 'false',
      description: 'Canonical controlled value; supports two-way binding and Signal Forms.',
    },
    {
      name: 'HySlideConfirm.loading',
      type: 'boolean',
      default: 'false',
      description: 'Keeps content visible while preventing repeated requests.',
    },
    {
      name: 'HySlideConfirm.threshold',
      type: 'number',
      default: '0.9',
      description: 'Minimum gesture travel required before a release can commit.',
    },
    {
      name: 'HySlideConfirm.confirmLabel',
      type: 'string',
      default: "'Confirm'",
      description: 'Localized text for confirm.',
    },
    {
      name: 'HySlideConfirm.completedLabel',
      type: 'string',
      default: "'Confirmed'",
      description: 'Localized text for completed.',
    },
    {
      name: 'HySlideConfirm.confirmed',
      type: 'void',
      default: 'output',
      description: 'Emits once after an enabled confirmation.',
    },
    {
      name: 'Signal Forms metadata',
      type: 'label, name, disabled, readonly, required, invalid, touched, errors',
      default: 'shared field contract',
      description: 'Use [formField] for value, validation, focus, and reset integration.',
    },
    {
      name: 'reset() / focus()',
      type: 'void',
      default: 'methods',
      description: 'Reset the confirmation value and presentation, or focus the native handle.',
    },
  ];
  protected readonly confirmed = signal(false);
}
