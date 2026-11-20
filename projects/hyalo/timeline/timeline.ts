import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type HyTimelineOrientation = 'vertical' | 'horizontal';
export type HyTimelineAlignment = 'start' | 'end';

@Component({
  selector: 'hy-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'list',
    '[attr.aria-label]': 'label()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-alignment]': 'alignment()',
  },
  template: '<ng-content />',
  styleUrl: './timeline.css',
})
export class HyTimeline {
  readonly label = input('Timeline');
  readonly orientation = input<HyTimelineOrientation>('vertical');
  readonly alignment = input<HyTimelineAlignment>('start');
}
@Component({
  selector: 'hy-timeline-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'listitem' },
  templateUrl: './timeline.html',
  styleUrl: './timeline-item.css',
})
export class HyTimelineItem {
  readonly heading = input.required<string>();
  readonly date = input('');
  readonly dateTime = input<string | null>(null);
}
export const HY_TIMELINE = [HyTimeline, HyTimelineItem] as const;
