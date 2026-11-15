import { EXAMPLE } from './examples/progress';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_PROGRESS } from '@hyalo/angular/progress';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-progress-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HY_PROGRESS, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress.html',
  styleUrl: './phase3.css',
})
export default class ProgressPage {
  protected readonly example = EXAMPLE;

  protected readonly progress = signal(40);
  protected readonly advance = (value: number): number => (value + 20) % 120;
  protected readonly rows: ApiRow[] = [
    {
      name: 'value',
      type: 'number | null',
      default: 'null',
      description: '0–100, or null for indeterminate.',
    },
    { name: 'variant', type: 'bar | circle', default: 'bar', description: 'Visual presentation.' },
    {
      name: 'label',
      type: 'string',
      default: 'required',
      description: 'Accessible progress name.',
    },
    {
      name: 'HySpinner.label',
      type: 'string',
      default: 'Loading',
      description: 'Accessible loading label.',
    },
  ];
}
