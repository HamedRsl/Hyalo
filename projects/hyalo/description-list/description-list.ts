import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

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
}
@Component({
  selector: 'hy-description-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './description-list.html',
  styleUrl: './description-list.css',
})
export class HyDescriptionList {
  readonly items = input.required<readonly HyDescription[]>();
  /** A number sets wide columns; compact layouts default to one column. */
  readonly columns = input<number | HyDescriptionColumns>(1);
  readonly layout = input<HyDescriptionLayout>('inline');

  protected readonly columnCounts = computed(() => {
    const columns = this.columns();
    return typeof columns === 'number'
      ? { compact: 1, wide: columnCount(columns) }
      : { compact: columnCount(columns.compact ?? 1), wide: columnCount(columns.wide) };
  });
}
