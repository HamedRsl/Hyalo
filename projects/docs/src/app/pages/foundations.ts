import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyMaterialDirective, type HyMaterial } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-foundations',
  imports: [DocsPage, DocsExample, DocsApiTable, HyMaterialDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page
      eyebrow="Start"
      heading="Foundations"
      lead="Tokens, the glass material and the shared inputs every component understands."
    >
      <h2>Tokens</h2>
      <p>
        Every colour, size and duration is a CSS custom property starting with <code>--hy-</code>. A
        theme is just another set of values for the same names, so switching a whole page is a
        single attribute.
      </p>
      <div class="swatches">
        @for (s of swatches; track s) {
          <div class="swatch">
            <span [style.background]="'var(' + s + ')'"></span>
            <code>{{ s }}</code>
          </div>
        }
      </div>
      <p>
        Dark mode follows the operating system. Set <code>data-hy-theme="dark"</code> or
        <code>"light"</code> on <code>&lt;html&gt;</code> to force one. Under
        <code>prefers-contrast: more</code> lines get stronger and glass turns opaque.
      </p>

      <h3>Palettes</h3>
      <p>
        Six optional palettes ship next to the main stylesheet: Aurora, Ember, Orchid, Ocean, Rose
        and Graphite. Each is a separate file of about 450 bytes gzipped that covers both light and
        dark, so none of them adds to the initial CSS. Try them from the settings button in the
        navbar.
      </p>
      <p>
        <code>HyPalette</code> loads a palette the first time it is used, then sets
        <code>data-hy-palette</code> on <code>&lt;html&gt;</code> once the file is in, so the page
        never shows half a palette. Call <code>preload()</code> on hover to make the switch instant.
      </p>
      <pre><code>{{ paletteCode }}</code></pre>

      <h2>Glass material</h2>
      <p>
        The <code>hyMaterial</code> directive turns any element into glass. Components that have a
        surface take the same value through their <code>material</code> input.
      </p>
      <docs-example [code]="materialCode">
        <div class="docs-grid">
          @for (m of materials; track m) {
            <div class="tile" [hyMaterial]="m">{{ m }}</div>
          }
        </div>
      </docs-example>
      <p>
        Glass falls back to <code>solid</code> on its own when the browser has no
        <code>backdrop-filter</code>, when the user asks for reduced transparency, and on the low
        fidelity tier.
      </p>

      <h2>Shared inputs</h2>
      <p>
        Components use the same names for the same idea, and <code>provideHyalo()</code> sets the
        defaults. It merges with its parent, so a section of a page can switch to solid surfaces or
        large controls on its own.
      </p>
      <pre><code>{{ providerCode }}</code></pre>
      <docs-api-table [rows]="configRows" />

      <h2>Type</h2>
      <p>
        A fluid scale from <code>--hy-step--1</code> to <code>--hy-step-6</code>, built with
        <code>clamp()</code>. Persian and Arabic text switches to
        <code>--hy-font-fa</code> (Vazirmatn by default) with a taller line height, and letter
        spacing is removed from headings in those scripts. Helper classes: <code>hy-display</code>,
        <code>hy-h1</code> to <code>hy-h3</code>, <code>hy-lead</code>, <code>hy-muted</code>,
        <code>hy-clamp</code> and <code>hy-visually-hidden</code>.
      </p>
    </docs-page>
  `,
  styles: `
    .swatches {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
      gap: var(--hy-space-3);
      margin-block: var(--hy-space-5);
    }
    .swatch {
      display: flex;
      align-items: center;
      gap: var(--hy-space-2);
      font-size: var(--hy-step--1);
    }
    .swatch span {
      inline-size: 1.75rem;
      block-size: 1.75rem;
      border-radius: var(--hy-radius-s);
      border: 1px solid var(--hy-line);
    }
    .tile {
      display: grid;
      place-items: center;
      min-block-size: 7rem;
      border-radius: var(--hy-radius-l);
      font-weight: 600;
    }
  `,
})
export default class FoundationsPage {
  protected readonly swatches = [
    '--hy-bg',
    '--hy-surface-1',
    '--hy-surface-3',
    '--hy-ink',
    '--hy-ink-2',
    '--hy-ink-3',
    '--hy-accent',
    '--hy-accent-wash',
    '--hy-success',
    '--hy-warning',
    '--hy-danger',
    '--hy-line-strong',
  ];
  protected readonly materials: HyMaterial[] = ['clear', 'frosted', 'tinted', 'solid'];
  protected readonly materialCode = `<div hyMaterial="clear">...</div>
<div hyMaterial>...</div>           <!-- the configured default -->
<hy-card material="tinted">...</hy-card>`;
  protected readonly paletteCode = `// angular.json, once per palette: built and minified, but not injected
{ "input": "node_modules/@hyalo/angular/styles/palettes/ocean.css",
  "bundleName": "palette-ocean", "inject": false }

// anywhere in the app
const palette = inject(HyPalette);
palette.preload('ocean');   // fetch on hover or focus
palette.use('ocean');       // apply once loaded
palette.use(null);          // back to the built-in palette`;
  protected readonly providerCode = `@Component({
  selector: 'app-checkout',
  providers: [provideHyalo({ material: 'solid', size: 'lg' })],
})`;
  protected readonly configRows: ApiRow[] = [
    {
      name: 'material',
      type: 'HyMaterial',
      default: "'frosted'",
      description: 'Default glass for surfaces.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Default control size.',
    },
    {
      name: 'tone',
      type: 'HyTone',
      default: "'accent'",
      description: 'Default colour role for buttons.',
    },
    {
      name: 'fidelity',
      type: 'HyFidelityTier',
      description: 'Forces a tier instead of detecting it.',
    },
    { name: 'gsap', type: '() => Promise<HyGsap>', description: 'Loads GSAP on demand. Optional.' },
  ];
}
