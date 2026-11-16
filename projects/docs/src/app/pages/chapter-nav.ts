import { HySwitch } from '@hyalo/angular/choice';
import { HySegmented, type HySegmentedOption } from '@hyalo/angular/segmented';
import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/chapter-nav';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyChapterNav } from '@hyalo/angular/chapter-nav';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-chapter-nav-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyChapterNav, HySwitch, HySegmented],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chapter-nav.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly sticky = signal(true);
  protected readonly behavior = signal<'smooth' | 'instant' | undefined>('smooth');
  protected readonly behaviors: readonly HySegmentedOption<'smooth' | 'instant'>[] = [
    { value: 'smooth', label: 'Smooth' },
    { value: 'instant', label: 'Instant' },
  ];
  protected readonly rows: ApiRow[] = [
    {
      name: 'sticky',
      type: 'boolean',
      default: 'false',
      description: 'Keeps chapter links sticky within their containing layout.',
    },
    {
      name: 'stickyTop',
      type: 'string',
      default: '6rem',
      description: 'CSS clearance above sticky links.',
    },
    {
      name: 'scrollBehavior',
      type: "'smooth' | 'instant'",
      default: 'smooth',
      description: 'Native scrolling behavior. Reduced motion always uses instant scrolling.',
    },
    {
      name: 'scrollRoot',
      type: 'HTMLElement | null',
      default: 'null',
      description: 'Reading pane to scroll. Null scrolls the page.',
    },
    {
      name: 'offset',
      type: 'number',
      default: '96',
      description: 'Clearance below sticky headers, in pixels.',
    },
    { name: 'active', type: 'Signal<string>', description: 'Currently selected chapter ID.' },
    {
      name: 'goTo(id)',
      type: 'method',
      description: 'Selects, focuses and scrolls to a target. Returns false for a missing target.',
    },
    {
      name: 'chapters',
      type: 'readonly HyChapter[]',
      default: 'required',
      description: 'Unique target IDs and visible labels.',
    },
    {
      name: 'label',
      type: 'string',
      default: 'On this page',
      description: 'Accessible navigation label.',
    },
  ];
  protected readonly chapters = [
    { id: 'chapter-material', label: 'Material' },
    { id: 'chapter-craft', label: 'Craft' },
    { id: 'chapter-care', label: 'Care' },
  ];
}
