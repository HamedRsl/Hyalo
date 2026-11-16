import { EXAMPLE } from './examples/gauge';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyGauge, type HyGaugeBand } from '@hyalo/angular/gauge';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsTokens } from '../shared/tokens-table';
@Component({
  selector: 'docs-gauge-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, DocsTokens, HyGauge, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gauge.html',
  styleUrl: './additions.css',
})
export default class GaugePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'label / value',
      type: 'string / number | null',
      default: 'required',
      description: 'Accessible name and numeric reading.',
    },
    {
      name: 'min / max',
      type: 'number',
      default: '0 / 100',
      description: 'Measurement range, normalized as for a meter.',
    },
    {
      name: 'variant',
      type: "'radial' | 'semicircle'",
      default: 'radial',
      description: 'Dial geometry.',
    },
    {
      name: 'bands',
      type: 'readonly HyGaugeBand[]',
      default: '[]',
      description: 'Inclusive upper bounds and tones; first matching bound wins.',
    },
    {
      name: 'tone',
      type: 'HyTone',
      default: 'primary',
      description: 'Fallback tone above the configured bands.',
    },
    {
      name: 'ticks',
      type: 'number',
      default: '5',
      description: 'Number of intervals, bounded to 0 through 20. Zero hides ticks.',
    },
    {
      name: 'needle / showRange',
      type: 'boolean',
      default: 'false / true',
      description: 'Optional needle and range labels.',
    },
    {
      name: 'locale / format',
      type: 'string / Intl.NumberFormatOptions',
      default: 'global / 1 fractional digit',
      description: 'Localized formatting.',
    },
    {
      name: 'unit / valueText / emptyLabel',
      type: 'string',
      default: 'empty / empty / No reading',
      description: 'Units, accessible threshold wording, and missing-data text.',
    },
  ];
  protected readonly value = signal(40);
  protected readonly bands: readonly HyGaugeBand[] = [
    { to: 60, tone: 'success' },
    { to: 85, tone: 'warning' },
    { to: 100, tone: 'danger' },
  ];
}
