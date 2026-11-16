import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/link';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyLink } from '@hyalo/angular/link';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-link-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './link.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [];
}
