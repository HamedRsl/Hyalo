import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/scroll-to-top';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyScrollToTop } from '@hyalo/angular/scroll-to-top';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-scroll-to-top-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyScrollToTop],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-to-top.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'threshold',
      type: 'number',
      default: '400',
      description: 'Scroll distance in pixels before the button appears.',
    },
    {
      name: 'targetId',
      type: 'string | null',
      default: 'null',
      description: 'Optional focus target. Defaults to the first h1 or main landmark.',
    },
    { name: 'label', type: 'string', default: 'Back to top', description: 'Visible button label.' },
    {
      name: 'scroll()',
      type: 'method',
      default: '',
      description: 'Scroll to the page start and focus its heading.',
    },
  ];
}
