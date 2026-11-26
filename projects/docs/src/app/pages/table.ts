import { EXAMPLE } from './examples/table';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyTable, type HyTableColumn } from '@hyalo/angular/table';
import { HyButton } from '@hyalo/angular/button';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';

interface Project {
  id: string;
  name: string;
  owner: string;
  budget: number;
}

@Component({
  selector: 'docs-table-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyTable, HyButton],
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
  protected readonly columns = [
    { id: 'name', header: 'Project', cell: (row) => row.name, sortable: true },
    { id: 'owner', header: 'Owner', cell: (row) => row.owner, sortable: true },
    { id: 'budget', header: 'Budget ($)', cell: (row) => row.budget, sortable: true, align: 'end' },
  ] as const satisfies readonly HyTableColumn<Project>[];
  protected readonly key = (row: { id: string }): string => row.id;
  protected readonly rowLabel = (row: { name: string }): string => 'Select ' + row.name;
  protected readonly selected = signal<readonly (string | number)[]>([]);
  protected readonly preview = signal<'data' | 'loading' | 'empty'>('data');
  protected readonly reorderedProjects = signal<readonly (typeof this.projects)[number][]>(this.projects);
  protected readonly groupedHeaders = [
    [{ label: 'Project details', rowspan: 2 }, { label: 'Allocation', colspan: 2 }],
    [{ label: 'Staffing' }, { label: 'Finance' }],
  ];
  protected readonly cycle = ['desc', 'asc', null] as const;
  protected readonly pinnedProjects = Array.from({ length: 100 }, (_, index) => ({
    id: String(index + 1),
    name: 'Project ' + (index + 1),
    owner: this.projects[index % this.projects.length]?.owner ?? 'Mina',
    budget: 12000 + index * 250,
  }));
  protected readonly pinnedColumns: readonly HyTableColumn<Project>[] = [
    { ...this.columns[0], frozen: 'start', width: 110 },
    { ...this.columns[1], frozen: 'start', width: 90 },
    { id: 'reference', header: 'Reference', cell: (row) => 'TRK-' + row.id, width: 620 },
    { ...this.columns[2], frozen: 'end', width: 100 },
  ];
  protected readonly pinnedHeaders = [[
    { label: 'Project work', colspan: 3 }, { label: 'Finance' },
  ]];
  protected readonly projectGroup = (row: { id: string }): string =>
    'Batch ' + (Math.floor((Number(row.id) - 1) / 5) + 1);
  protected readonly expandedProjects = signal<readonly (string | number)[]>([]);
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
