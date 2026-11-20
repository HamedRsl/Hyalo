import { EXAMPLE } from './examples/meter';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyMeter, HyMeterGroup, HySegmentedProgress } from '@hyalo/angular/meter';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsTokens } from '../shared/tokens-table';
@Component({
  selector: 'docs-meter-page',
  imports: [
    DocsPage,
    DocsExample,
    DocsImport,
    DocsApiTable,
    DocsTokens,
    HyMeter,
    HyMeterGroup,
    HySegmentedProgress,
    HyButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './meter.html',
  styleUrl: './additions.css',
})
export default class MeterPage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'HyMeterGroup',
      type: 'component',
      default: 'label and values required',
      description:
        'values are readonly HyMeterSegment entries with id, label, value and optional tone. min/max default 0/100, orientation horizontal/vertical, labelPosition start/end, labelOrientation horizontal/vertical, locale and valueText. Allocates non-negative finite amounts within the shared range.',
    },
    {
      name: 'HySegmentedProgress',
      type: 'component',
      default: 'label and steps required',
      description:
        'steps are readonly HyProgressStep entries with id, label and pending/active/complete/error state. stateLabels translates each state. Accessible progress and a separate semantic stage list communicate progress without color.',
    },

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
  protected readonly segments = [
    { id: 'apps', label: 'Applications', value: 35, tone: 'primary' as const },
    { id: 'files', label: 'Files', value: 25, tone: 'success' as const },
  ];
  protected readonly steps = [
    { id: 'placed', label: 'Placed', state: 'complete' as const },
    { id: 'preparing', label: 'Preparing', state: 'active' as const },
    { id: 'delivered', label: 'Delivered', state: 'pending' as const },
  ];
}
