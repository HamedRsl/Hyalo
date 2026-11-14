import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/chapter-nav';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyChapterNav } from '@hyalo/angular/chapter-nav';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-chapter-nav-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyChapterNav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chapter-nav.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'chapters',
      type: 'readonly HyChapter[]',
      default: 'required',
      description: 'Unique target IDs and visible labels.',
    },
    {
      name: 'label',
      type: 'string',
      default: 'On this page',
      description: 'Accessible navigation label.',
    },
  ];
  protected readonly chapters = [
    { id: 'chapter-material', label: 'Material' },
    { id: 'chapter-craft', label: 'Craft' },
    { id: 'chapter-care', label: 'Care' },
  ];
}
