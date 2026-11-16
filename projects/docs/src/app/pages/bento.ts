import { EXAMPLE } from './examples/bento';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HY_BENTO } from '@hyalo/angular/bento';
import { HyStat } from '@hyalo/angular/stat';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-bento-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HY_BENTO, HyStat],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bento.html',
  styleUrl: './phase3.css',
})
export default class BentoPage {
  protected readonly example = EXAMPLE;

  protected readonly rows: ApiRow[] = [
    { name: 'hyBentoTile', type: 'directive', default: '', description: 'Marks a grid tile.' },
    {
      name: 'columns / rows',
      type: 'number',
      default: '1',
      description: 'Column span 1–3 and row span 1–6.',
    },
  ];
}
