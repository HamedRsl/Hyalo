import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/lightbox';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { HyGallery, HyGalleryThumbnail, HyLightboxContent } from '@hyalo/angular/lightbox';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-lightbox-page',
  imports: [
    DocsImport,
    DocsPage,
    DocsExample,
    DocsApiTable,
    HyGallery,
    HyGalleryThumbnail,
    HyLightboxContent,
  ],
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
      description: 'Initial index, translated controls, and typed content and caption templates.',
    },
    {
      name: 'thumbnailTemplate',
      type: 'TemplateRef<HyGalleryThumbnailContext>',
      description: 'Replaces the thumbnail contents inside the accessible gallery button.',
    },
    {
      name: 'thumbnailMinWidth / thumbnailAspectRatio / thumbnailGap',
      type: 'string',
      description: 'Set the minimum column width, fallback image aspect ratio and grid gap.',
    },
    {
      name: 'HyLightbox.open(images, options?)',
      type: 'method',
      default: '',
      description:
        'Opens programmatically and returns a HyDialogRef, or null for an empty gallery.',
    },
  ];
  protected readonly compact = signal(false);
  protected readonly toggleCollection = (value: boolean): boolean => !value;
  private readonly collection = [
    { src: 'showcase-steel.svg', alt: 'Steel watch with a blue dial', caption: 'Steel, 42 mm.' },
    { src: 'showcase-gold.svg', alt: 'Gold watch with an ivory dial', caption: 'Gold, 38 mm.' },
  ];
  protected readonly images = computed(() =>
    this.compact() ? this.collection.slice(0, 1) : this.collection,
  );
}
