import { EXAMPLE } from './examples/breadcrumb';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyBreadcrumb } from '@hyalo/angular/breadcrumb';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-breadcrumb-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyBreadcrumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './breadcrumb.html',
  styleUrl: './phase3.css',
})
export default class BreadcrumbPage {
  protected readonly example = EXAMPLE;

  protected readonly trail = [
    { label: 'Workspace', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Breadcrumb' },
  ];
  protected readonly rows: ApiRow[] = [
    {
      name: 'items',
      type: 'readonly HyBreadcrumbItem[]',
      default: 'required',
      description: 'Label and optional href per step; the last step is the current page.',
    },
    {
      name: 'label',
      type: 'string',
      default: 'Breadcrumb',
      description: 'Accessible navigation name.',
    },
  ];
}
