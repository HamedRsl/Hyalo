import { EXAMPLE } from './examples/meter';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyMeter } from '@hyalo/angular/meter';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsTokens } from '../shared/tokens-table';
@Component({
  selector: 'docs-meter-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, DocsTokens, HyMeter, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './meter.html',
  styleUrl: './additions.css',
})
export default class MeterPage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'label',
      type: 'string',
      default: 'required',
      description: 'Accessible measurement name.',
    },
    {
      name: 'value',
      type: 'number | null',
      default: 'required',
      description: 'Clamped reading. Null and non-finite values are unavailable.',
    },
    {
      name: 'min / max',
      type: 'number',
      default: '0 / 100',
      description: 'Invalid ranges fall back to 0 through 100.',
    },
    {
      name: 'valueText',
      type: 'string',
      default: 'empty',
      description: 'Include units and meaningful threshold wording.',
    },
    {
      name: 'emptyLabel',
      type: 'string',
      default: 'No reading',
      description: 'Accessible wording for missing measurements.',
    },
    { name: 'tone', type: 'HyTone', default: 'primary', description: 'Semantic fill color.' },
  ];
  protected readonly used = signal(6);
}
