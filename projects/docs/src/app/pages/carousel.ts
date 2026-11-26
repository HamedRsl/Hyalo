import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/carousel';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  HY_CAROUSEL,
  type HyCarouselMode,
  type HyCarouselNavigationPosition,
  type HyCarouselNavigationMode,
  type HyCarouselPagination,
} from '@hyalo/angular/carousel';
import { HySegmented, type HySegmentedOption } from '@hyalo/angular/segmented';
import { HySwitch } from '@hyalo/angular/choice';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-carousel-page',
  imports: [
    DocsImport,
    DocsPage,
    DocsExample,
    DocsApiTable,
    HY_CAROUSEL,
    HyButton,
    HySegmented,
    HySwitch,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './carousel.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'visibleSlides / pageStep',
      type: 'number',
      default: '1',
      description:
        'Slides per viewport and navigation step. Navigation stops at the final full viewport; fade mode shows one slide.',
    },
    {
      name: 'navigation',
      type: "'text' | 'icons' | 'none'",
      default: 'text',
      description: 'Default navigation button presentation.',
    },
    {
      name: 'navPosition',
      type: "'below' | 'inside-bottom' | 'sides'",
      default: 'below',
      description: 'Below the slide, over its bottom edge, or centered on its sides.',
    },
    {
      name: 'hyCarouselNavigation',
      type: 'template directive',
      description:
        'Replace the default navigation with custom markup. Its implicit context is the carousel instance.',
    },
    {
      name: 'hyCarouselPrevious / hyCarouselNext',
      type: 'button directives',
      description: 'Add navigation and automatic boundary disabling to custom native buttons.',
    },
    {
      name: 'mode',
      type: "'slide' | 'fade'",
      default: 'slide',
      description:
        'Native scrolling or an opacity-only crossfade. Fade supports pointer swipes and next/previous controls.',
    },
    {
      name: 'pagination',
      type: "'dots' | 'counter' | 'none'",
      default: 'dots',
      description: 'Presentation of the slide navigation.',
    },
    {
      name: 'loop',
      type: 'boolean',
      default: 'false',
      description: 'Wraps button and keyboard navigation at the boundaries.',
    },
    {
      name: 'scrollbar',
      type: 'boolean',
      default: 'false',
      description: 'Opt in to the native horizontal scrollbar. Swiping works while hidden.',
    },
    {
      name: 'index',
      type: 'model<number>',
      default: '0',
      description: 'Two-way selected slide index, clamped to the available slides.',
    },
    {
      name: 'label',
      type: 'string',
      default: 'Gallery',
      description: 'Accessible name of the region.',
    },
    {
      name: 'goTo(index, smooth?)',
      type: 'method',
      default: '',
      description: 'Selects and scrolls to a slide.',
    },
    {
      name: 'HySlide.label',
      type: 'string',
      default: 'required',
      description: 'Accessible name of each slide.',
    },
    {
      name: 'previousLabel / nextLabel',
      type: 'string',
      default: 'Previous slide / Next slide',
      description: 'Localizable control labels.',
    },
  ];
  protected readonly index = signal(0);
  protected readonly settled = signal<number | null>(null);
  protected readonly mode = signal<HyCarouselMode | undefined>('slide');
  protected readonly loop = signal(false);
  protected readonly navigation = signal<HyCarouselNavigationMode | undefined>('icons');
  protected readonly navPosition = signal<HyCarouselNavigationPosition | undefined>('below');
  protected readonly pagination = signal<HyCarouselPagination | undefined>('dots');
  protected readonly positions: readonly HySegmentedOption<HyCarouselNavigationPosition>[] = [
    { value: 'below', label: 'Below' },
    { value: 'inside-bottom', label: 'Inside bottom' },
    { value: 'sides', label: 'Sides' },
  ];
  protected readonly navigations: readonly HySegmentedOption<HyCarouselNavigationMode>[] = [
    { value: 'text', label: 'Text' },
    { value: 'icons', label: 'Icons' },
    { value: 'none', label: 'Hidden' },
  ];
  protected readonly paginations: readonly HySegmentedOption<HyCarouselPagination>[] = [
    { value: 'dots', label: 'Dots' },
    { value: 'counter', label: 'Counter' },
    { value: 'none', label: 'Hidden' },
  ];
  protected readonly modes: readonly HySegmentedOption<HyCarouselMode>[] = [
    { value: 'slide', label: 'Slide' },
    { value: 'fade', label: 'Fade' },
  ];
}
