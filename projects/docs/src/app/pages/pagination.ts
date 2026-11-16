import { EXAMPLE } from './examples/pagination';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyPagination } from '@hyalo/angular/pagination';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-pagination-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyPagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.html',
  styleUrl: './phase3.css',
})
export default class PaginationPage {
  protected readonly example = EXAMPLE;

  protected readonly page = signal(1);
  protected readonly rows: ApiRow[] = [
    { name: 'page', type: 'model<number>', default: '1', description: 'One-based selected page.' },
    {
      name: 'total / pageSize',
      type: 'number',
      default: 'required / 10',
      description: 'Total result count and rows per page.',
    },
    { name: 'locale', type: 'string', default: 'en', description: 'Locale used for page digits.' },
    {
      name: 'previousLabel / nextLabel',
      type: 'string',
      default: 'English labels',
      description: 'Accessible action names.',
    },
  ];
}
