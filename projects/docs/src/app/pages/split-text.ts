import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/split-text';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HySplitText } from '@hyalo/angular/split-text';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-split-text-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HySplitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './split-text.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'text',
      type: 'string',
      default: 'required',
      description: 'Plain text to measure and reveal. Put the component inside a semantic heading.',
    },
  ];
}
