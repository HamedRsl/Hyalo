import { EXAMPLE } from './examples/sidebar';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_SIDEBAR } from '@hyalo/angular/sidebar';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-sidebar-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HY_SIDEBAR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './phase3.css',
})
export default class SidebarPage {
  protected readonly example = EXAMPLE;

  protected readonly collapsed = signal(false);
  protected readonly selected = signal('Overview');
  protected select(event: MouseEvent, page: string): void {
    event.preventDefault();
    this.selected.set(page);
  }
  protected readonly rows: ApiRow[] = [
    {
      name: 'collapsed',
      type: 'model<boolean>',
      default: 'false',
      description: 'Collapses labels while preserving accessible link names.',
    },
    {
      name: 'label',
      type: 'string',
      default: 'Main navigation',
      description: 'Accessible name of the navigation landmark.',
    },
    {
      name: 'HySidebarItem.label / icon',
      type: 'string',
      default: 'required',
      description: 'Visible label and registered icon name.',
    },
    {
      name: 'HySidebarItem.active',
      type: 'boolean',
      default: 'false',
      description: 'Marks the current page.',
    },
  ];
}
