import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'hy-skeleton-region',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<span class="announcement" role="status">{{ label() }}</span><ng-content />',
  styleUrl: './skeleton-region.css',
})
export class HySkeletonRegion {
  readonly label = input.required<string>();
}
