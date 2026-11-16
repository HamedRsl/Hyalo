import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/refraction';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyRefraction } from '@hyalo/angular/refraction';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-refraction-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyRefraction, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './refraction.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'src',
      type: 'string',
      default: "''",
      description: 'Scene image to refract. Use a same-origin or CORS-enabled image.',
    },
    {
      name: 'strength',
      type: 'number',
      default: '0.12',
      description: 'Edge distortion, clamped from 0 to 1.',
    },
    { name: 'material', type: 'HyMaterial', default: 'config', description: 'CSS glass fallback.' },
    {
      name: '--hy-refraction-opacity',
      type: 'CSS token',
      default: '0.16',
      description: 'Opacity of the image and refracted layer.',
    },
    {
      name: '--hy-refraction-padding',
      type: 'CSS token',
      default: '--hy-space-9',
      description: 'Content inset.',
    },
  ];
}
