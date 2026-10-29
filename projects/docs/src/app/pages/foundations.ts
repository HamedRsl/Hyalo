import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HyMaterialDirective, type HyMaterial } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-foundations',
  imports: [DocsPage, DocsExample, DocsApiTable, HyMaterialDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './foundations.html',
  styleUrl: './foundations.css',
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
