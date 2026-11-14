import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/badge';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyBadge, HyChip } from '@hyalo/angular/badge';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-badge-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyBadge, HyChip, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'HyChip.selected',
      type: 'model<boolean>',
      default: 'false',
      description:
        'Two-way selectable chip state. The inner native toggle button exposes aria-pressed.',
    },
    {
      name: 'HyChip.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the selectable chip.',
    },
    { name: 'tone', type: 'HyTone', default: 'config', description: 'Semantic text color.' },
    { name: 'size', type: 'HySize', default: 'config', description: 'sm, md or lg.' },
    {
      name: 'material',
      type: 'HyMaterial',
      default: 'config',
      description: 'Glass material with fidelity fallback.',
    },
    {
      name: 'removable',
      type: 'boolean',
      default: 'false',
      description: 'Displays a native remove button.',
    },
    {
      name: 'removeLabel',
      type: 'string',
      default: 'Remove',
      description: 'Accessible name; include the chip value.',
    },
    {
      name: 'removed',
      type: 'output<void>',
      default: '',
      description: 'Application handles removal and focus placement.',
    },
  ];
  protected readonly chipVisible = signal(true);
  protected readonly steel = signal(true);
  protected readonly gold = signal(false);
}
