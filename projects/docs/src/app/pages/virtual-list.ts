import { EXAMPLE } from './examples/virtual-list';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_VIRTUAL_LIST } from '@hyalo/angular/virtual-list';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsTokens } from '../shared/tokens-table';
@Component({
  selector: 'docs-virtual-list-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, DocsTokens, HY_VIRTUAL_LIST, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './virtual-list.html',
  styleUrl: './additions.css',
})
export default class VirtualListPage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    { name: 'items', type: 'readonly T[]', default: 'required', description: 'Caller-owned data.' },
    {
      name: 'itemKey',
      type: '(item: T) => string | number',
      default: 'required',
      description: 'Unique stable row keys.',
    },
    { name: 'label', type: 'string', default: 'required', description: 'Accessible list name.' },
    {
      name: 'rowHeight',
      type: 'number',
      default: 'required',
      description: 'Exact row height in CSS pixels. Invalid heights render no rows.',
    },
    {
      name: 'height',
      type: 'string',
      default: 'var(--hy-virtual-list-height, 20rem)',
      description: 'Viewport height.',
    },
    {
      name: 'overscan',
      type: 'number',
      default: '4',
      description: 'Extra rows per edge, bounded to 0 through 100.',
    },
    {
      name: 'initialCount',
      type: 'number',
      default: '10',
      description: 'Deterministic initial rows before measurement, plus overscan.',
    },
    {
      name: 'hyVirtualItem',
      type: 'HyVirtualList<T>',
      default: 'required',
      description: 'List reference for a typed template. Context: item, index, count.',
    },
    {
      name: 'scrollToIndex(index)',
      type: 'method',
      default: '',
      description: 'Reveals a row without moving focus.',
    },
    {
      name: 'focusIndex(index)',
      type: 'method',
      default: '',
      description: 'Reveals and focuses a row.',
    },
  ];
  protected readonly allEvents = Array.from({ length: 10000 }, (_, id) => ({
    id,
    label: 'Activity event ' + (id + 1),
  }));
  protected readonly events = signal(this.allEvents);
  protected readonly key = (event: { readonly id: number }): number => event.id;
}
