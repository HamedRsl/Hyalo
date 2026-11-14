import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/aspect-ratio';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyAspectRatio } from '@hyalo/angular/aspect-ratio';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-aspect-ratio-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyAspectRatio],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aspect-ratio.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'ratio',
      type: 'number',
      default: '16 / 9',
      description: 'Positive width divided by height. Invalid values use 16 / 9.',
    },
  ];
}
