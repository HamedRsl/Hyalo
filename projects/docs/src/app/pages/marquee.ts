import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/marquee';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HY_MARQUEE } from '@hyalo/angular/marquee';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-marquee-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HY_MARQUEE],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './marquee.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'duration',
      type: 'string',
      default: '30s',
      description: 'CSS duration of one full cycle.',
    },
    {
      name: 'reverse',
      type: 'boolean',
      default: 'false',
      description: 'Reverses travel direction.',
    },
    {
      name: 'label',
      type: 'string',
      default: 'Partners',
      description: 'Accessible name of the original content.',
    },
    {
      name: 'hyMarqueeItem',
      type: 'template directive',
      default: '',
      description: 'One item template. Avoid IDs inside repeated templates.',
    },
    {
      name: 'pauseLabel / playLabel',
      type: 'string',
      default: 'Pause animation / Play animation',
      description: 'Localizable motion controls.',
    },
  ];
}
