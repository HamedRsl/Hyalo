import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  selector: 'hy-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'list', '[attr.aria-label]': 'label()' },
  template: '<ng-content />',
  styleUrl: './timeline.css',
})
export class HyTimeline {
  readonly label = input('Timeline');
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
