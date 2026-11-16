import { EXAMPLE } from './examples/state';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_STATE } from '@hyalo/angular/state';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsTokens } from '../shared/tokens-table';
@Component({
  selector: 'docs-state-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, DocsTokens, HY_STATE],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './state.html',
  styleUrl: './additions.css',
})
export default class StatePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'HyErrorState.heading',
      type: 'string',
      default: 'required',
      description: 'Failure heading.',
    },
    {
      name: 'description',
      type: 'string',
      default: 'empty',
      description: 'Supporting context for either state.',
    },
    {
      name: 'headingLevel',
      type: '2 | 3 | 4 | 5 | 6',
      default: '2',
      description: 'Heading level in the full error block.',
    },
    {
      name: 'retryLabel / retrying',
      type: 'string / boolean',
      default: 'empty / false',
      description: 'Labeled retry action and host-owned busy state.',
    },
    {
      name: 'retry',
      type: 'output<void>',
      default: '',
      description: 'Requests retry; the component never fetches data.',
    },
    {
      name: 'HyLoadingState.label',
      type: 'string',
      default: 'required',
      description: 'Loading announcement.',
    },
    {
      name: 'compact',
      type: 'boolean',
      default: 'false',
      description: 'One-row layout for compact panels.',
    },
    {
      name: 'live',
      type: "'off' | 'polite' | 'assertive'",
      default: 'polite',
      description: 'Announcement urgency.',
    },
  ];
  protected readonly attempts = signal(0);
}
