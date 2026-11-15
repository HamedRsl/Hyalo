import { EXAMPLE } from './examples/list';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_LIST } from '@hyalo/angular/list';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-list-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HY_LIST, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list.html',
  styleUrl: './phase3.css',
})
export default class ListPage {
  protected readonly example = EXAMPLE;

  protected readonly selected = signal('');
  protected readonly rows: ApiRow[] = [
    {
      name: 'HyList.label',
      type: 'string',
      default: 'required',
      description: 'Accessible list name.',
    },
    {
      name: 'HyListItem.heading / description',
      type: 'string',
      default: 'required / empty',
      description: 'Row title and secondary text.',
    },
    { name: 'content', type: 'projection', default: '', description: 'Trailing native actions.' },
  ];
}
