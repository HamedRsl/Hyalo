import { EXAMPLE } from './examples/chart';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyChart, type HyChartType } from '@hyalo/angular/chart';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-chart-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyChart, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
export default class ChartPage {
  protected readonly example = EXAMPLE;

  protected readonly type = signal<HyChartType>('line');
  protected readonly revenue = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { label: 'Revenue ($k)', values: [18, 22, 20, 27, 29, 32] },
      { label: 'Previous period ($k)', values: [14, 16, 19, 22, 24, 26] },
    ],
  };
  protected readonly rows: ApiRow[] = [
    {
      name: 'HY_CHART_LOADER',
      type: 'InjectionToken<() => Promise<ChartEngine>>',
      default: 'lazy Chart.js',
      description:
        'Override the engine loader when sharing a Chart.js chunk across the application.',
    },
    {
      name: 'data',
      type: 'HyChartData',
      default: 'required',
      description: 'Labels and series with numeric or null values.',
    },
    {
      name: 'type',
      type: 'line | area | bar | doughnut',
      default: 'line',
      description: 'Registered Chart.js controller.',
    },
    {
      name: 'label / summary',
      type: 'string',
      default: 'required / empty',
      description: 'Chart name and textual interpretation.',
    },
    {
      name: 'locale / tableLabel',
      type: 'string',
      default: 'en / View chart data',
      description: 'Number locale and fallback disclosure copy.',
    },
  ];
}
