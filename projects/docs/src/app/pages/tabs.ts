import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_TABS, HySegmented } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-tabs-page',
  imports: [DocsPage, DocsExample, DocsApiTable, HY_TABS, HySegmented],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page
      heading="Tabs and segmented"
      lead="Tabs switch panels. A segmented control picks one value."
    >
      <h2>Tabs</h2>
      <docs-example [code]="tabsCode" column>
        <hy-tabs label="Watch details" [(selected)]="tab">
          <hy-tab value="overview" label="Overview">
            <p>A slim dress watch with a hand-wound movement and a 42 hour reserve.</p>
          </hy-tab>
          <hy-tab value="specs" label="Specifications">
            <p>42 mm steel case, sapphire crystal, 50 m water resistance.</p>
          </hy-tab>
          <hy-tab value="care" label="Care">
            <p>Wind it every morning. Service every five years.</p>
          </hy-tab>
          <hy-tab value="reviews" label="Reviews" disabled>Nothing yet.</hy-tab>
        </hy-tabs>
        <p class="hy-muted">Selected: {{ tab() ?? 'first enabled tab' }}</p>
      </docs-example>

      <h2>Segmented</h2>
      <docs-example [code]="segmentedCode">
        <hy-segmented label="Billing period" [options]="periods" [(value)]="period" />
        <hy-segmented label="View" size="sm" [options]="views" [(value)]="view" />
      </docs-example>
      <p>
        Use tabs when each option has its own panel. Use segmented when the choice is a value, like
        a filter or a setting. Segmented is a group of native radios, so it submits with forms and
        works with
        <code>[formField]</code>.
      </p>

      <h2>Accessibility</h2>
      <ul>
        <li>
          Tabs follow the APG tabs pattern. Arrow keys move and select, mirrored in RTL. Home and
          End jump.
        </li>
        <li>
          Set <code>selectionMode="explicit"</code> when a panel is expensive, so arrows only move
          focus and Enter selects.
        </li>
        <li>Hidden panels are <code>inert</code>, so their links leave the tab order.</li>
        <li>Give both a <code>label</code> when the page has more than one set.</li>
      </ul>

      <h2>API</h2>
      <p><code>hy-tabs</code></p>
      <docs-api-table [rows]="tabsRows" />
      <p><code>hy-tab</code></p>
      <docs-api-table [rows]="tabRows" />
      <p><code>hy-segmented</code></p>
      <docs-api-table [rows]="segmentedRows" />
    </docs-page>
  `,
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
