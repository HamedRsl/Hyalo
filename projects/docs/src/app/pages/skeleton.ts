import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/skeleton';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HySkeleton, type HySkeletonAnimation } from '@hyalo/angular/skeleton';
import { HySegmented, type HySegmentedOption } from '@hyalo/angular/segmented';
import { HyButton } from '@hyalo/angular/button';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-skeleton-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HySkeleton, HySegmented, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'animation',
      type: "'shimmer' | 'pulse' | 'none'",
      default: 'shimmer',
      description:
        'Transform shimmer, opacity pulse, or a static placeholder. Motion always respects fidelity and reduced motion.',
    },
    {
      name: 'shape',
      type: "'text' | 'circle' | 'rect'",
      default: 'text',
      description: 'Placeholder shape.',
    },
    {
      name: 'width / height',
      type: 'string',
      default: '100% / 1em',
      description: 'CSS dimensions.',
    },
  ];
  protected readonly animation = signal<HySkeletonAnimation | undefined>('shimmer');
  protected readonly loading = signal(true);
  protected readonly animations: readonly HySegmentedOption<HySkeletonAnimation>[] = [
    { value: 'shimmer', label: 'Shimmer' },
    { value: 'pulse', label: 'Pulse' },
    { value: 'none', label: 'Static' },
  ];
}
