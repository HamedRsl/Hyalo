import { HyButton } from '@hyalo/angular/button';
import { EXAMPLE } from './examples/breadcrumb';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { HyBreadcrumb } from '@hyalo/angular/breadcrumb';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-breadcrumb-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyBreadcrumb, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './breadcrumb.html',
  styleUrl: './phase3.css',
})
export default class BreadcrumbPage {
  protected readonly example = EXAMPLE;

  protected readonly current = signal('Breadcrumb');
  private readonly destinations = [
    { label: 'Workspace', href: '#breadcrumb-workspace' },
    { label: 'Components', href: '#breadcrumb-components' },
    { label: 'Breadcrumb', href: '#breadcrumb-example' },
  ];
  protected readonly trail = computed(() => {
    const index = this.destinations.findIndex((item) => item.label === this.current());
    return this.destinations.slice(0, index + 1);
  });
  protected follow(event: MouseEvent): void {
    const link = (event.target as Element).closest('a');
    const destination = this.destinations.find((item) => item.href === link?.getAttribute('href'));
    if (!destination) return;
    event.preventDefault();
    this.current.set(destination.label);
  }
  protected readonly rows: ApiRow[] = [
    {
      name: 'items',
      type: 'readonly HyBreadcrumbItem[]',
      default: 'required',
      description: 'Label and optional href per step; the last step is the current page.',
    },
    {
      name: 'label',
      type: 'string',
      default: 'Breadcrumb',
      description: 'Accessible navigation name.',
    },
  ];
}
