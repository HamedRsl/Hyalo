import { DocsTokens } from '../shared/tokens-table';
import { EXAMPLE } from './examples/sidebar';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_SIDEBAR, type HySidebarNavGroup } from '@hyalo/angular/sidebar';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-sidebar-page',
  imports: [DocsTokens, DocsPage, DocsExample, DocsImport, DocsApiTable, HY_SIDEBAR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './phase3.css',
})
export default class SidebarPage {
  protected readonly example = EXAMPLE;

  protected readonly collapsed = signal(false);
  protected readonly selected = signal('Overview');
  protected readonly groups: readonly HySidebarNavGroup[] = [
    {
      id: 'work',
      label: 'Workspace',
      items: [
        { id: 'Overview', label: 'Overview', href: '#overview', icon: 'home' },
        {
          id: 'Projects',
          label: 'Projects',
          href: '#projects',
          icon: 'grid',
          description: 'Shared with your team',
          count: 3,
          countLabel: '3 active projects',
        },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      items: [{ id: 'Settings', label: 'Settings', href: '#settings', icon: 'settings' }],
    },
  ];
  protected previewNavigation(event: MouseEvent): void {
    event.preventDefault();
  }
  protected readonly rows: ApiRow[] = [
    {
      name: 'HySidebarGroup.label',
      type: 'string',
      default: 'required',
      description: 'Names projected native sidebar links.',
    },
    {
      name: 'HySidebarGroups.groups / activeId',
      type: 'readonly HySidebarNavGroup[] / string',
      default: 'required / undefined',
      description: 'Configured links and current page id. Empty groups are omitted.',
    },
    {
      name: 'HySidebarGroups.selected',
      type: 'output<HySidebarNavItem>',
      default: '',
      description: 'Reports activation without preventing native navigation.',
    },
    {
      name: 'HySidebarItem.description / count / countLabel',
      type: 'string / number | null / string',
      default: 'empty / null / empty',
      description: 'Supporting text and count, retained in accessible names when collapsed.',
    },
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
