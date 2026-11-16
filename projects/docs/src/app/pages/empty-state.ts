import { EXAMPLE } from './examples/empty-state';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyEmptyState } from '@hyalo/angular/empty-state';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-empty-state-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyEmptyState, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.html',
  styleUrl: './phase3.css',
})
export default class EmptyStatePage {
  protected readonly example = EXAMPLE;

  protected readonly created = signal(false);
  protected readonly rows: ApiRow[] = [{name:'headingLevel',type:'2 | 3 | 4 | 5 | 6',default:'2',description:'Matches the surrounding heading hierarchy.'},
    {
      name: 'heading / description',
      type: 'string',
      default: 'required / empty',
      description: 'Explain the state and next step.',
    },
    {
      name: 'icon',
      type: 'string',
      default: '',
      description: 'Optional registered decorative icon.',
    },
    {
      name: 'content',
      type: 'projection',
      default: '',
      description: 'Native links and buttons for next actions.',
    },
  ];
}
