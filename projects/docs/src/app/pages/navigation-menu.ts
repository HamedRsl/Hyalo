import { EXAMPLE } from './examples/navigation-menu';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyNavigationMenu } from '@hyalo/angular/navigation-menu';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-navigation-menu-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyNavigationMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navigation-menu.html',
  styleUrl: './phase3.css',
})
export default class NavigationMenuPage {
  protected readonly example = EXAMPLE;

  protected readonly navigation = [
    {
      id: 'product',
      label: 'Product',
      sections: [
        {
          label: 'Build',
          links: [
            {
              label: 'Components',
              href: '/components',
              description: 'Explore every building block',
            },
            {
              label: 'Foundations',
              href: '/foundations',
              description: 'Tokens and visual language',
            },
          ],
        },
        {
          label: 'Learn',
          links: [
            { label: 'Motion', href: '/motion', description: 'Purposeful, interruptible movement' },
            { label: 'Theming', href: '/theming', description: 'Make it your own' },
          ],
        },
      ],
    },
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  ];
  protected readonly rows: ApiRow[] = [
    {
      name: 'items',
      type: 'readonly HyNavigationItem[]',
      default: 'required',
      description: 'Stable id, label, href or sections of labelled links.',
    },
    { name: 'label', type: 'string', default: 'Main navigation', description: 'Accessible name.' },
    {
      name: 'open',
      type: 'WritableSignal<string | null>',
      default: 'null',
      description: 'Current disclosure id.',
    },
  ];
}
