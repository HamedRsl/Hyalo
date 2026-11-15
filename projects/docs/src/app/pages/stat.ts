import { EXAMPLE } from './examples/stat';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyStat } from '@hyalo/angular/stat';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-stat-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyStat, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat.html',
  styleUrl: './phase3.css',
})
export default class StatPage {
  protected readonly example = EXAMPLE;

  protected readonly revenue = signal(48250);
  protected readonly increase = (value: number): number => value + 1250;
  protected readonly rows: ApiRow[] = [
    {
      name: 'value / label',
      type: 'number / string',
      default: 'required',
      description: 'Finite metric and visible label.',
    },
    {
      name: 'locale / format',
      type: 'string / Intl.NumberFormatOptions',
      default: 'en / integer',
      description: 'Locale-aware number formatting.',
    },
    {
      name: 'animate',
      type: 'boolean',
      default: 'false',
      description: 'Springs between updates while visible and motion is enabled.',
    },
    {
      name: 'trend / prefix / suffix',
      type: 'string',
      default: '',
      description: 'Textual context and optional affixes.',
    },
  ];
}
