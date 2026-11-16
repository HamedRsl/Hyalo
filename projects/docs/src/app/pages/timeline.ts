import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/timeline';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HY_TIMELINE } from '@hyalo/angular/timeline';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-timeline-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HY_TIMELINE],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timeline.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'HyTimeline.label',
      type: 'string',
      default: 'Timeline',
      description: 'Accessible name of the list.',
    },
    {
      name: 'HyTimelineItem.heading',
      type: 'string',
      default: 'required',
      description: 'Visible event heading.',
    },
    {
      name: 'date / dateTime',
      type: 'string / string | null',
      default: "'' / null",
      description: 'Display date and optional machine-readable datetime.',
    },
  ];
}
