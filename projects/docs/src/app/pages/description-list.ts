import { EXAMPLE } from './examples/description-list';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyDescriptionList } from '@hyalo/angular/description-list';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-description-list-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyDescriptionList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './description-list.html',
  styleUrl: './phase3.css',
})
export default class DescriptionListPage {
  protected readonly example = EXAMPLE;

  protected readonly details = [
    { term: 'Workspace', detail: 'Atelier' },
    { term: 'Owner', detail: 'Mina Rahimi' },
    { term: 'Plan', detail: 'Team · Monthly' },
    { term: 'Region', detail: 'Europe' },
  ];
  protected readonly rows: ApiRow[] = [
    {
      name: 'items',
      type: 'readonly HyDescription[]',
      default: 'required',
      description: 'Term and detail pairs in reading order.',
    },
  ];
}
