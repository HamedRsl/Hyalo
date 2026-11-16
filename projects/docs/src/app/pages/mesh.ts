import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/mesh';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyMesh } from '@hyalo/angular/mesh';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-mesh-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyMesh],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mesh.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'animated',
      type: 'boolean',
      default: 'false',
      description: 'Enables slow ambient movement with an explicit pause control.',
    },
    {
      name: '--hy-mesh-a / b / c',
      type: 'CSS colors',
      default: 'theme washes',
      description: 'Three ambient color stops.',
    },
    {
      name: '--hy-mesh-padding',
      type: 'CSS length',
      default: '--hy-space-9',
      description: 'Content spacing.',
    },
    {
      name: 'pauseLabel / playLabel',
      type: 'string',
      default: 'Pause background / Play background',
      description: 'Localizable motion controls.',
    },
  ];
}
