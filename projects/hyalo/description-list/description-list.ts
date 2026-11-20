import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, input } from '@angular/core';

export interface HyDescriptionColumns {
  /** Columns when the component is at most 30rem wide. Defaults to one. */
  readonly compact?: number;
  /** Columns when the component is wider than 30rem. */
  readonly wide: number;
}

export type HyDescriptionLayout = 'inline' | 'stacked';

function columnCount(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
}

export interface HyDescription {
  readonly term: string;
  readonly detail: string;
  /** Number of columns occupied; clamped independently at each breakpoint. */
  readonly span?: number;
}
export interface HyDescriptionContext {
  readonly $implicit: HyDescription;
  readonly index: number;
}
@Component({
  selector: 'hy-description-list',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './description-list.html',
  styleUrl: './description-list.css',
})
export class HyDescriptionList {
  readonly items = input.required<readonly HyDescription[]>();
  /** A number sets wide columns; compact layouts default to one column. */
  readonly columns = input<number | HyDescriptionColumns>(1);
  readonly layout = input<HyDescriptionLayout>('inline');
  readonly title = input('');
  readonly termTemplate = input<TemplateRef<HyDescriptionContext>>();
  readonly detailTemplate = input<TemplateRef<HyDescriptionContext>>();

  protected span(item: HyDescription, breakpoint: 'compact' | 'wide'): number {
    return Math.min(this.columnCounts()[breakpoint], columnCount(item.span ?? 1));
  }

  protected readonly columnCounts = computed(() => {
    const columns = this.columns();
    return typeof columns === 'number'
      ? { compact: 1, wide: columnCount(columns) }
      : { compact: columnCount(columns.compact ?? 1), wide: columnCount(columns.wide) };
  });
}
