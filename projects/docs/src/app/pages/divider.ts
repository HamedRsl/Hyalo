import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/divider';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyDivider } from '@hyalo/angular/divider';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-divider-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyDivider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './divider.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: 'horizontal',
      description: 'Visual and accessible separator orientation.',
    },
    {
      name: 'inset',
      type: 'string',
      default: '0',
      description: 'CSS length at the logical inline start.',
    },
  ];
}
