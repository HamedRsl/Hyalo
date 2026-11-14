import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/lightbox';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyGallery } from '@hyalo/angular/lightbox';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-lightbox-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyGallery],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lightbox.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'images',
      type: 'readonly HyGalleryImage[]',
      default: 'required',
      description: 'Each image has src, alt, optional thumbnail and caption.',
    },
    {
      name: 'label / openLabel',
      type: 'string',
      default: 'Image gallery / Open image',
      description: 'Accessible gallery and thumbnail labels.',
    },
    {
      name: 'options',
      type: 'HyLightboxOptions',
      default: '{}',
      description: 'Initial index and translated viewer control labels.',
    },
    {
      name: 'HyLightbox.open(images, options?)',
      type: 'method',
      default: '',
      description:
        'Opens programmatically and returns a HyDialogRef, or null for an empty gallery.',
    },
  ];
  protected readonly images = [
    { src: 'showcase-steel.svg', alt: 'Steel watch with a blue dial', caption: 'Steel, 42 mm.' },
    { src: 'showcase-gold.svg', alt: 'Gold watch with an ivory dial', caption: 'Gold, 38 mm.' },
  ];
}
