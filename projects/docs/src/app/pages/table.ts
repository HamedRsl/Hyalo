import { EXAMPLE } from './examples/table';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyTable, type HyTableColumn } from '@hyalo/angular/table';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-table-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.html',
  styleUrl: './phase3.css',
})
export default class TablePage {
  protected readonly example = EXAMPLE;

  protected readonly projects = [
    { id: '1', name: 'Website refresh', owner: 'Mina', budget: 12400 },
    { id: '2', name: 'Design system', owner: 'Arman', budget: 8600 },
    { id: '3', name: 'Mobile launch', owner: 'Sara', budget: 19200 },
  ];
  protected readonly columns: readonly HyTableColumn<{
    id: string;
    name: string;
    owner: string;
    budget: number;
  }>[] = [
    { id: 'name', header: 'Project', cell: (row) => row.name, sortable: true },
    { id: 'owner', header: 'Owner', cell: (row) => row.owner, sortable: true },
    { id: 'budget', header: 'Budget ($)', cell: (row) => row.budget, sortable: true, align: 'end' },
  ];
  protected readonly key = (row: { id: string }): string => row.id;
  protected readonly rowLabel = (row: { name: string }): string => 'Select ' + row.name;
  protected readonly selected = signal<readonly (string | number)[]>([]);
  protected readonly rows: ApiRow[] = [
    {
      name: 'data / columns / rowKey',
      type: 'readonly T[] / readonly HyTableColumn<T>[] / (row:T) => string | number',
      default: 'required',
      description: 'Immutable data, cell definitions, and stable unique keys.',
    },
    {
      name: 'caption',
      type: 'string',
      default: 'required',
      description: 'Visible accessible table name.',
    },
    {
      name: 'sort',
      type: 'model<HyTableSort | null>',
      default: 'null',
      description: 'Ascending, descending, then unsorted.',
    },
    {
      name: 'selected',
      type: 'model<readonly HyRowKey[]>',
      default: '[]',
      description: 'Selection owned by the caller.',
    },
    {
      name: 'selectable / stickyHeader / loading',
      type: 'boolean',
      default: 'false',
      description: 'Selection controls, sticky column labels, and busy state.',
    },
    {
      name: 'column.template',
      type: 'TemplateRef<HyTableCellContext<T>>',
      default: '',
      description: 'Custom cell with $implicit row and value.',
    },
  ];
}
