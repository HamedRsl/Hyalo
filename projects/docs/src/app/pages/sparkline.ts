import { EXAMPLE } from './examples/sparkline';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HySparkline } from '@hyalo/angular/sparkline';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-sparkline-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HySparkline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sparkline.html',
  styleUrl: './phase3.css',
})
export default class SparklinePage {
  protected readonly example = EXAMPLE;

  protected readonly activity = [18, 22, 17, 26, 24, 32, 38, 35, 44, 49];
  protected readonly rows: ApiRow[] = [
    {
      name: 'data',
      type: 'readonly number[]',
      default: 'required',
      description: 'Finite values; invalid values are omitted.',
    },
    {
      name: 'label',
      type: 'string',
      default: 'required',
      description: 'Meaningful textual trend summary.',
    },
  ];
}
