import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_TABS, HySegmented } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-tabs-page',
  imports: [DocsPage, DocsTokens, DocsExample, DocsApiTable, HY_TABS, HySegmented],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabs.html',
})
export default class TabsPage {
  protected readonly tab = signal<string | undefined>(undefined);
  protected readonly period = signal<string | undefined>('month');
  protected readonly view = signal<string | undefined>('grid');
  protected readonly periods = [
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' },
  ];
  protected readonly views = [
    { value: 'grid', label: 'Grid' },
    { value: 'list', label: 'List' },
    { value: 'map', label: 'Map' },
  ];

  protected readonly tabsCode = `<hy-tabs label="Watch details" [(selected)]="tab">
  <hy-tab value="overview" label="Overview">...</hy-tab>
  <hy-tab value="specs" label="Specifications">...</hy-tab>
  <hy-tab value="reviews" label="Reviews" disabled>...</hy-tab>
</hy-tabs>`;
  protected readonly segmentedCode = `periods = [
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];

<hy-segmented label="Billing period" [options]="periods" [(value)]="period" />`;
  protected readonly tabsRows: ApiRow[] = [
    { name: 'label', type: 'string', description: 'Accessible name of the tab list.' },
    {
      name: 'selected',
      type: 'model<string | undefined>',
      description: 'Value of the selected tab. Falls back to the first enabled one.',
    },
    {
      name: 'selectionMode',
      type: "'follow' | 'explicit'",
      default: "'follow'",
      description: 'Whether focus selects.',
    },
    {
      name: 'stretch',
      type: 'boolean',
      default: 'false',
      description: 'Tabs share the full width.',
    },
  ];
  protected readonly tabRows: ApiRow[] = [
    { name: 'value', type: 'string', description: 'Required. Identifies the tab.' },
    { name: 'label', type: 'string', description: 'Required. Text of the tab button.' },
    { name: 'icon', type: 'string', description: 'Icon name shown before the label.' },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Skipped by the keyboard.',
    },
  ];
  protected readonly segmentedRows: ApiRow[] = [
    {
      name: 'options',
      type: 'HySegmentedOption<T>[]',
      description: 'Required. value, label, icon and disabled.',
    },
    {
      name: 'value',
      type: 'model<T | undefined>',
      description: 'Selected value. Works with [formField].',
    },
    { name: 'label', type: 'string', description: 'Accessible name of the group.' },
    { name: 'size', type: 'HySize', default: "'md'", description: 'Height of the control.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every option.' },
  ];
}
