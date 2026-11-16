import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/image-compare';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyImageCompare } from '@hyalo/angular/image-compare';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-image-compare-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyImageCompare],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-compare.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    { name: 'before / after', type: 'string', default: 'required', description: 'Image sources.' },
    {
      name: 'beforeAlt / afterAlt',
      type: 'string',
      default: 'required',
      description: 'Descriptions of the two images.',
    },
    {
      name: 'value',
      type: 'model<number>',
      default: '50',
      description: 'Reveal percentage, clamped from 0 to 100.',
    },
    {
      name: 'label',
      type: 'string',
      default: 'Reveal before image',
      description: 'Visible range label.',
    },
    {
      name: 'ratio',
      type: 'string',
      default: '16 / 9',
      description: 'CSS aspect ratio of the frame.',
    },
  ];
  protected readonly comparison = signal(50);
}
