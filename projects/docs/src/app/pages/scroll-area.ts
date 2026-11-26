import { EXAMPLE } from './examples/scroll-area';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyScrollArea } from '@hyalo/angular/scroll-area';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-scroll-area-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyScrollArea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-area.html',
  styleUrl: './phase3.css',
})
export default class ScrollAreaPage {
  protected readonly example = EXAMPLE;

  protected readonly events = [
    'Project created',
    'Mina joined the team',
    'Design uploaded',
    'Feedback added',
    'Version approved',
    'Release scheduled',
    'Report exported',
    'Workspace updated',
  ];
  protected readonly rows: ApiRow[] = [
    { name: 'label', type: 'string', default: 'required', description: 'Accessible region name.' },
    {
      name: 'scrollHost',
      type: 'HTMLElement | null',
      description: 'Optional native viewport for scrollTo and scrolled.',
    },
    {
      name: 'maxHeight',
      type: 'string',
      default: '20rem',
      description: 'Maximum logical block size.',
    },
  ];
}
