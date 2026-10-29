import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HY_CARD, HyButton, HyTilt } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-card-page',
  imports: [DocsPage, DocsTokens, DocsExample, DocsApiTable, HY_CARD, HyButton, HyTilt],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.html',
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
