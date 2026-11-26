import { EXAMPLES } from './examples/tabs';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HySegmented } from '@hyalo/angular/segmented';
import { HY_TABS } from '@hyalo/angular/tabs';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-tabs-page',
  imports: [DocsPage, DocsTokens, DocsExample, DocsApiTable, HY_TABS, HySegmented, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabs.html',
})
export default class TabsPage {
  protected readonly examples = EXAMPLES;

  protected readonly tab = signal<string | undefined>(undefined);
  protected readonly releaseTab = signal<string | undefined>('overview');
  protected readonly completedTab = signal<string | undefined>(undefined);
  protected readonly milestones = [
    'Planning',
    'Requirements',
    'Design review',
    'Engineering',
    'Quality assurance',
    'Release',
  ];
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
    {
      name: 'dynamicHeight',
      type: 'boolean',
      default: 'false',
      description: 'Animates the height between active panels and respects reduced motion.',
    },
    {
      name: 'animationDuration',
      type: 'number',
      default: '220',
      description: 'Panel height motion duration in milliseconds. Set to zero for instant layout.',
    },
    {
      name: 'transitionComplete',
      type: 'output<string>',
      description: 'Emits the value of an accepted user selection after panel motion settles.',
    },
  ];
  protected readonly tabRows: ApiRow[] = [
    { name: 'compactLabel', type: 'string', description: 'Visible shorthand on narrow screens. The full accessible name remains available.' },
    { name: 'badge', type: 'string | number', description: 'A badge beside the tab label.' },
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
