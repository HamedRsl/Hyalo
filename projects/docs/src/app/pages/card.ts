import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HY_CARD, HyButton, HyTilt } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-card-page',
  imports: [DocsPage, DocsExample, DocsApiTable, HY_CARD, HyButton, HyTilt],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page
      heading="Card"
      lead="The signature glass surface, with optional media, header, body and footer."
    >
      <docs-example [code]="code">
        <div class="docs-grid">
          <hy-card hyTilt>
            <div hyCardMedia class="media"></div>
            <h3 hyCardHeader><a hyCardLink href="#slots">Calibre 7</a></h3>
            <p>Hand-wound movement, 42 mm case, sapphire caseback.</p>
            <div hyCardFooter>
              <strong>4 200 EUR</strong>
              <button hyButton size="sm" variant="soft">Save</button>
            </div>
          </hy-card>
          <hy-card material="clear" padding="lg">
            <h3 hyCardHeader>Clear</h3>
            <p>A light veil over the background.</p>
          </hy-card>
          <hy-card material="solid" padding="sm">
            <h3 hyCardHeader>Solid</h3>
            <p>Opaque, for dense content.</p>
          </hy-card>
        </div>
      </docs-example>

      <h2 id="slots">Slots</h2>
      <ul>
        <li>
          <code>hyCardMedia</code>: full-bleed media at the top. Set
          <code>--hy-card-media-ratio</code> to change its shape.
        </li>
        <li>
          <code>hyCardHeader</code>: the title. Use a real heading element at the right level.
        </li>
        <li><code>hyCardFooter</code>: price, meta or actions.</li>
        <li>
          <code>hyCardLink</code>: stretches one link over the whole card. Other buttons inside stay
          clickable.
        </li>
      </ul>
      <p>
        A stretched link keeps one clear, well-named link for screen readers instead of making the
        whole card a giant link with all its text as the name.
      </p>

      <h2>API</h2>
      <docs-api-table [rows]="rows" />
    </docs-page>
  `,
  styles: `
    .media {
      background: linear-gradient(135deg, #1f2937, #4b5563 40%, #9ca3af);
    }
  `,
})
export default class CardPage {
  protected readonly code = `<hy-card hyTilt>
  <img hyCardMedia src="calibre.avif" alt="" />
  <h3 hyCardHeader><a hyCardLink routerLink="/watch/7">Calibre 7</a></h3>
  <p>Hand-wound movement, 42 mm case.</p>
  <div hyCardFooter>
    <strong>4 200 EUR</strong>
    <button hyButton size="sm" variant="soft">Save</button>
  </div>
</hy-card>`;
  protected readonly rows: ApiRow[] = [
    {
      name: 'material',
      type: 'HyMaterial',
      default: 'config',
      description: 'Glass material of the surface.',
    },
    {
      name: 'padding',
      type: "'none' | 'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Inner spacing. Media stays full bleed.',
    },
  ];
}
