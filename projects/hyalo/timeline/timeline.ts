import {
  ChangeDetectionStrategy,
  Component,
  type TemplateRef,
  booleanAttribute,
  input,
  afterRenderEffect,
  contentChildren,
  computed,
  ElementRef,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type HyTimelineOrientation = 'vertical' | 'horizontal';
export type HyTimelineAlignment = 'start' | 'end' | 'alternate';

@Component({
  selector: 'hy-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'list',
    '[attr.aria-label]': 'label()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-alignment]': 'alignment()',
    '[attr.data-reverse]': 'reverse()',
  },
  template:
    '<ng-content /> @if (pending()) { <div class="pending" role="listitem">{{ pending() }}</div> }',
  styleUrl: './timeline.css',
})
export class HyTimeline {
  readonly label = input('Timeline');
  readonly orientation = input<HyTimelineOrientation>('vertical');
  readonly alignment = input<HyTimelineAlignment>('start');
  readonly reverse = input(false, { transform: booleanAttribute });
  readonly pending = input('');
  private readonly items = contentChildren(HyTimelineItem, { read: ElementRef });
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly displayItems = computed<readonly HTMLElement[]>(() => {
    const items = this.items().map((item) => item.nativeElement as HTMLElement);
    return this.reverse() ? items.reverse() : items;
  });
  /** @internal Returns the visual ordinal used for alternating sides. */
  itemIndex(item: HTMLElement): number {
    return this.displayItems().indexOf(item);
  }

  constructor() {
    afterRenderEffect(() => {
      const nodes: HTMLElement[] = this.items().map((item) => item.nativeElement);
      const pending = this.element.querySelector<HTMLElement>('.pending');
      this.pending();
      if (pending) nodes.push(pending);
      if (this.reverse()) nodes.reverse();
      for (const node of nodes) this.element.appendChild(node);
    });
  }
}
@Component({
  selector: 'hy-timeline-item',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'listitem',
    '[attr.data-side]': 'side()',
    '[attr.data-rail-side]': 'railSide()',
    '[style.--hy-timeline-dot]': 'dotColor() ?? null',
  },
  templateUrl: './timeline.html',
  styleUrl: './timeline-item.css',
})
export class HyTimelineItem {
  private readonly timeline = inject(HyTimeline, { optional: true });
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly railSide = computed(() => {
    const alignment = this.timeline?.alignment() ?? 'start';
    if (this.side()) return this.side();
    if (alignment !== 'alternate') return alignment;
    const index = this.timeline?.itemIndex(this.element) ?? 0;
    return index % 2 === 1 ? 'end' : 'start';
  });

  readonly heading = input.required<string>();
  readonly date = input('');
  readonly dateTime = input<string | null>(null);
  readonly side = input<'start' | 'end' | null>(null);
  readonly dotColor = input<string>();
  readonly markerTemplate = input<TemplateRef<HyTimelineItemContext>>();
  readonly oppositeTemplate = input<TemplateRef<HyTimelineItemContext>>();
  protected readonly context: HyTimelineItemContext = { $implicit: this };
}
export interface HyTimelineItemContext {
  readonly $implicit: HyTimelineItem;
}
export const HY_TIMELINE = [HyTimeline, HyTimelineItem] as const;
