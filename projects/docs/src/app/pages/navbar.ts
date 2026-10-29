import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_NAVBAR, HyButton } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-navbar-page',
  imports: [DocsPage, DocsExample, DocsApiTable, HY_NAVBAR, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page
      heading="Navbar"
      lead="A glass app bar that compacts on scroll and collapses its links on narrow screens."
    >
      <p>
        The site header above is a <code>hy-navbar</code> with <code>appearance="full"</code>. Below
        is the floating style, in a frame narrow enough to show the collapsed menu.
      </p>
      <docs-example [code]="code" [column]="true">
        <hy-navbar label="Demo" position="static" [(menuOpen)]="open">
          <a hyNavbarBrand href="#api">Atelier</a>
          <a href="#api" aria-current="page">Watches</a>
          <a href="#api">Journal</a>
          <a href="#api">Boutiques</a>
          <div hyNavbarActions><button hyButton size="sm">Book a visit</button></div>
        </hy-navbar>
        <div class="narrow">
          <hy-navbar label="Demo, narrow" position="static">
            <a hyNavbarBrand href="#api">Atelier</a>
            <a href="#api">Watches</a>
            <a href="#api">Journal</a>
          </hy-navbar>
        </div>
      </docs-example>

      <h2>Behaviour</h2>
      <ul>
        <li>
          Links are wrapped in a <code>&lt;nav&gt;</code> named by <code>label</code>. Mark the
          current page with <code>aria-current="page"</code>, for example through
          <code>ariaCurrentWhenActive</code>.
        </li>
        <li>
          The collapse point is a container query on the navbar's own width (48rem), so it works
          inside any layout.
        </li>
        <li>
          Escape closes the menu and returns focus to the menu button. Choosing a link closes it
          too.
        </li>
        <li>
          With <code>hideOnScroll</code> the bar slides away while scrolling down. It never hides
          while the menu is open or focus is inside.
        </li>
        <li>
          To open your own drawer instead of the built-in panel, bind <code>[(menuOpen)]</code>.
        </li>
      </ul>

      <h2 id="api">API</h2>
      <docs-api-table [rows]="rows" />
    </docs-page>
  `,
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
