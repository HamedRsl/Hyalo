import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HY_NAVBAR } from '@hyalo/angular/navbar';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-navbar-page',
  imports: [DocsPage, DocsTokens, DocsExample, DocsApiTable, HY_NAVBAR, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.html',
  styles: `
    .narrow {
      max-inline-size: 22rem;
      min-block-size: 12rem;
    }
  `,
})
export default class NavbarPage {
  protected readonly open = signal(false);
  protected readonly code = `<hy-navbar label="Main" hideOnScroll>
  <a hyNavbarBrand routerLink="/">Atelier</a>
  <a routerLink="/watches" routerLinkActive ariaCurrentWhenActive="page">Watches</a>
  <a routerLink="/journal" routerLinkActive ariaCurrentWhenActive="page">Journal</a>
  <div hyNavbarActions><button hyButton size="sm">Book a visit</button></div>
</hy-navbar>`;
  protected readonly rows: ApiRow[] = [
    {
      name: 'label',
      type: 'string',
      default: "'Main'",
      description: 'Accessible name of the nav landmark.',
    },
    {
      name: 'menuLabel',
      type: 'string',
      default: "'Menu'",
      description: 'Name of the menu button.',
    },
    {
      name: 'appearance',
      type: "'floating' | 'full'",
      default: "'floating'",
      description: 'Detached pill or full-width bar.',
    },
    {
      name: 'position',
      type: "'sticky' | 'fixed' | 'static'",
      default: "'sticky'",
      description: 'CSS positioning.',
    },
    { name: 'material', type: 'HyMaterial', default: 'config', description: 'Glass of the bar.' },
    {
      name: 'hideOnScroll',
      type: 'boolean',
      default: 'false',
      description: 'Slide away while scrolling down.',
    },
    {
      name: 'scrollThreshold',
      type: 'number',
      default: '8',
      description: 'Pixels before the bar compacts.',
    },
    {
      name: 'menuOpen',
      type: 'model<boolean>',
      default: 'false',
      description: 'Collapsed menu state.',
    },
  ];
}
