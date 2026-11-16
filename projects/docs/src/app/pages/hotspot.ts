import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/hotspot';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyHotspot, type HyHotspotMode } from '@hyalo/angular/hotspot';
import { HySegmented, type HySegmentedOption } from '@hyalo/angular/segmented';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-hotspot-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyHotspot, HySegmented],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hotspot.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'description',
      type: 'string',
      default: "''",
      description:
        'Detail text displayed in an anchored popover. Without it the hotspot emits a plain action.',
    },
    {
      name: 'mode',
      type: "'label' | 'pin'",
      default: 'label',
      description: 'Visible label or compact pin with an accessible name.',
    },
    {
      name: 'open',
      type: 'model<boolean>',
      default: 'false',
      description: 'Two-way popover state.',
    },
    {
      name: 'placement',
      type: 'HyPlacement',
      default: 'top',
      description: 'Preferred popover placement. Flips at viewport edges.',
    },
    {
      name: 'closeLabel',
      type: 'string',
      default: 'Close details',
      description: 'Localizable dismiss button label.',
    },
    {
      name: 'label',
      type: 'string',
      default: 'required',
      description: 'Visible and accessible button name.',
    },
    {
      name: 'position',
      type: 'HyHotspotPosition',
      default: 'required',
      description:
        'Percent x from inline start and percent y from block start; optional visible flag.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Native button disabled state.',
    },
    {
      name: 'activated',
      type: 'output<void>',
      default: '',
      description: 'Emitted on native button activation.',
    },
  ];
  protected readonly hotspotOpen = signal(false);
  protected readonly mode = signal<HyHotspotMode | undefined>('label');
  protected readonly modes: readonly HySegmentedOption<HyHotspotMode>[] = [
    { value: 'label', label: 'Label' },
    { value: 'pin', label: 'Pin' },
  ];
}
