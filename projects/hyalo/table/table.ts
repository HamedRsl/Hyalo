import { HyLocale } from '@hyalo/angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  input,
  inject,
  model,
} from '@angular/core';
export type HyRowKey = string | number;
export interface HyTableCellContext<T> {
  readonly $implicit: T;
  readonly value: string | number | null;
}
export interface HyTableColumn<T> {
  readonly id: string;
  readonly header: string;
  readonly cell: (row: T) => string | number | null;
  readonly sortable?: boolean;
  readonly compare?: (a: T, b: T) => number;
  readonly align?: 'start' | 'end' | 'center';
  readonly template?: TemplateRef<HyTableCellContext<T>>;
}
export interface HyTableSort {
  readonly column: string;
  readonly direction: 'asc' | 'desc';
}
@Component({
  selector: 'hy-table',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class HyTable<T> {
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly HyTableColumn<T>[]>();
  readonly rowKey = input.required<(row: T) => HyRowKey>();
  readonly caption = input.required<string>();
  readonly locale = input<string>();
  private readonly globalLocale = inject(HyLocale);
  private readonly effectiveLocale = computed(() => this.locale() ?? this.globalLocale.locale());
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly emptyLabel = input('No results');
  readonly selectionLabel = input('Select all visible rows');
  readonly rowLabel = input<(row: T) => string>(() => 'Select row');
  readonly selected = model<readonly HyRowKey[]>([]);
  readonly sort = model<HyTableSort | null>(null);
  private readonly selectedSet = computed(() => new Set(this.selected()));
  private readonly sorted = computed(() => {
    const rows = [...this.data()],
      sort = this.sort(),
      col = this.columns().find((c) => c.id === sort?.column);
    if (!sort || !col?.sortable) return rows;
    const collator = new Intl.Collator(this.effectiveLocale(), {
      numeric: true,
      sensitivity: 'base',
    });
    return rows.sort((a, b) => {
      const av = col.cell(a),
        bv = col.cell(b);
      const result = col.compare
        ? col.compare(a, b)
        : av == null
          ? bv == null
            ? 0
            : -1
          : bv == null
            ? 1
            : typeof av === 'number' && typeof bv === 'number'
              ? av - bv
              : collator.compare(String(av), String(bv));
      return (Number.isFinite(result) ? result : 0) * (sort.direction === 'asc' ? 1 : -1);
    });
  });
  readonly view = computed(() =>
    this.sorted().map((row) => ({
      row,
      key: this.rowKey()(row),
      label: this.rowLabel()(row),
      selected: this.selectedSet().has(this.rowKey()(row)),
      cells: this.columns().map((column) => ({ column, value: column.cell(row) })),
    })),
  );
  readonly allSelected = computed(
    () => this.view().length > 0 && this.view().every((row) => row.selected),
  );
  readonly someSelected = computed(
    () => this.view().some((row) => row.selected) && !this.allSelected(),
  );
  toggleSort(column: HyTableColumn<T>): void {
    const current = this.sort();
    this.sort.set(
      current?.column === column.id
        ? current.direction === 'asc'
          ? { column: column.id, direction: 'desc' }
          : null
        : { column: column.id, direction: 'asc' },
    );
  }
  toggleRow(key: HyRowKey): void {
    const selected = new Set(this.selected());
    if (selected.has(key)) selected.delete(key);
    else selected.add(key);
    this.selected.set([...selected]);
  }
  toggleAll(): void {
    const selected = new Set(this.selected()),
      all = this.allSelected();
    for (const row of this.view()) {
      if (all) selected.delete(row.key);
      else selected.add(row.key);
    }
    this.selected.set([...selected]);
  }
}
