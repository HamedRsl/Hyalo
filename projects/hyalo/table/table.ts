import { HyLocale, injectId } from '@hyalo/angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, afterRenderEffect, booleanAttribute, computed, effect, input, inject, model, output, signal, untracked, viewChild, ElementRef, DestroyRef } from '@angular/core';
export type HyRowKey = string | number;
export interface HyTableCellContext<T> { readonly $implicit: T; readonly value: string | number | null; readonly editing?: boolean; }
export interface HyTableColumn<T> {
  readonly id: string; readonly header: string; readonly cell: (row: T) => string | number | null;
  readonly sortable?: boolean; readonly compare?: (a: T, b: T) => number;
  readonly align?: 'start' | 'end' | 'center'; readonly template?: TemplateRef<HyTableCellContext<T>>;
  readonly editTemplate?: TemplateRef<HyTableCellContext<T>>; readonly headerTemplate?: TemplateRef<unknown>;
  readonly validateEdit?: (value: unknown, row: T) => boolean | string;
  readonly footer?: string; readonly width?: number; readonly minWidth?: number;
  readonly frozen?: 'start' | 'end'; readonly filter?: (value: unknown, row: T) => boolean;
}
export interface HyTableSort { readonly column: string; readonly direction: 'asc' | 'desc'; }
export interface HyTableQuery {
  readonly page: number; readonly pageSize: number; readonly sorts: readonly HyTableSort[];
  readonly filters: Readonly<Record<string, unknown>>; readonly search: string;
}
export interface HyTableState extends HyTableQuery { readonly selected: readonly HyRowKey[]; readonly columnOrder: readonly string[]; readonly columnWidths: Readonly<Record<string, number>>; }
export interface HyTableAction<T> { readonly type: string; readonly row?: T; readonly key?: HyRowKey; readonly column?: string; readonly originalEvent?: Event; }
export interface HyTableRowContext<T> { readonly $implicit: T; readonly key: HyRowKey; }
export interface HyTableHeader { readonly label: string; readonly colspan?: number; readonly rowspan?: number; }

function rowAtOffset(offsets: readonly number[], offset: number): number {
  let first = 0;
  let last = offsets.length - 1;
  while (first < last) {
    const middle = Math.floor((first + last + 1) / 2);
    if ((offsets[middle] ?? Infinity) <= offset) first = middle;
    else last = middle - 1;
  }
  return first;
}

@Component({ selector: 'hy-table', imports: [NgTemplateOutlet], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './table.html', styleUrl: './table.css' })
export class HyTable<T> {
  readonly data = input.required<readonly T[]>(); readonly columns = input.required<readonly HyTableColumn<T>[]>();
  readonly rowKey = input.required<(row: T) => HyRowKey>(); readonly caption = input.required<string>(); readonly locale = input<string>();
  private readonly globalLocale = inject(HyLocale); private readonly effectiveLocale = computed(() => this.locale() ?? this.globalLocale.locale());
  readonly selectable = input(false, { transform: booleanAttribute }); readonly stickyHeader = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute }); readonly emptyLabel = input('No results'); readonly loadingLabel = input('Loading');
  readonly selectionLabel = input('Select all visible rows'); readonly rowLabel = input<(row: T) => string>(() => 'Select row');
  readonly selected = model<readonly HyRowKey[]>([]); readonly sort = model<HyTableSort | null>(null);
  readonly sorts = model<readonly HyTableSort[]>([]); readonly sortMode = input<'single' | 'multiple'>('single');
  readonly sortCycle = input<readonly ('asc' | 'desc' | null)[]>(['asc', 'desc', null]);
  readonly filters = model<Readonly<Record<string, unknown>>>({}); readonly search = model('');
  readonly mode = input<'local' | 'server'>('local'); readonly page = model(1); readonly pageSize = model(0); readonly total = input<number>();
  readonly queryChange = output<HyTableQuery>(); readonly action = output<HyTableAction<T>>();
  readonly selectionMode = input<'multiple' | 'single'>('multiple'); readonly rowSelectable = input<(row: T) => boolean>(() => true);
  readonly contextRow = model<HyRowKey | null>(null); readonly rowContext = output<{ readonly row: T; readonly event: MouseEvent }>();
  readonly columnOrder = model<readonly string[]>([]); readonly columnWidths = model<Readonly<Record<string, number>>>({});
  readonly resizableColumns = input(false); readonly reorderableColumns = input(false); readonly reorderableRows = input(false);
  readonly rowsReordered = output<readonly T[]>(); readonly expanded = model<readonly HyRowKey[]>([]);
  readonly rowTemplate = input<TemplateRef<HyTableRowContext<T>>>(); readonly expandLabel = input('Toggle row details');
  readonly groupBy = input<(row: T) => string>(); readonly groupTemplate = input<TemplateRef<{ $implicit: string; rows: readonly T[] }>>();
  readonly editing = model<{ readonly key: HyRowKey; readonly column?: string } | null>(null);
  readonly editStart = output<{ readonly row: T; readonly column?: string }>(); readonly editCommit = output<{ readonly row: T; readonly value: unknown; readonly column?: string }>(); readonly editCancel = output<HyRowKey>();
  readonly editInvalid = output<{ readonly row: T; readonly value: unknown; readonly column?: string; readonly message?: string }>();
  readonly headerRows = input<readonly (readonly HyTableHeader[])[]>([]); readonly footerTemplate = input<TemplateRef<{ $implicit: readonly T[] }>>();
  readonly emptyTemplate = input<TemplateRef<unknown>>(); readonly loadingTemplate = input<TemplateRef<unknown>>();
  readonly frozenRows = input(0); readonly maxHeight = input('var(--hy-table-max-height, 32rem)'); readonly minWidth = input<string>();
  readonly virtual = input(false); readonly rowHeight = input(48); readonly overscan = input(4); readonly initialCount = input(10);
  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport'); private readonly scrollOffset = signal(0); private readonly viewportHeight = signal(0);
  private readonly headerHeight = signal(0);
  private readonly captionHeight = signal(0);
  private readonly virtualMeasurements = signal<{
    rows: readonly T[];
    heights: ReadonlyMap<string, number>;
  }>({ rows: [], heights: new Map() });
  private readonly renderedColumnWidths = signal<ReadonlyMap<string, number>>(new Map());
  private readonly renderedFrozenHeights = signal<readonly number[]>([]);
  private readonly frozenOffsets = computed(() => {
    const columns = this.orderedColumns();
    const measured = this.renderedColumnWidths();
    const offsets = new Map<string, number>();
    let start = 0;
    let end = 0;
    for (const column of columns) {
      if (column.frozen !== 'start') continue;
      offsets.set(column.id, start);
      start += measured.get(column.id) || this.width(column) || 160;
    }
    for (const column of [...columns].reverse()) {
      if (column.frozen !== 'end') continue;
      offsets.set(column.id, end);
      end += measured.get(column.id) || this.width(column) || 160;
    }
    return offsets;
  });
  private readonly selectedSet = computed(() => new Set(this.selected())); private anchor: HyRowKey | null = null;
  private draggedColumn: string | null = null; private draggedRow: HyRowKey | null = null;
  readonly orderedColumns = computed(() => { const order = this.columnOrder(); return [...this.columns()].sort((a,b) => { const ai = order.indexOf(a.id), bi = order.indexOf(b.id); return (ai < 0 ? order.length + this.columns().indexOf(a) : ai) - (bi < 0 ? order.length + this.columns().indexOf(b) : bi); }); });
  private readonly tableId = injectId('table');
  protected readonly auxiliaryColumns = computed(() => Number(this.selectable()) + Number(!!this.rowTemplate()));
  /** Keep selection and expansion columns in the positional group grid by default. */
  readonly headerRowsIncludeControls = input(true, { transform: booleanAttribute });
  protected readonly headerLayout = computed(() => {
    const columns = this.orderedColumns();
    const groups = this.headerRows();
    const controls = this.headerRowsIncludeControls() ? this.auxiliaryColumns() : 0;
    const occupiedUntil = Array<number>(controls + columns.length).fill(0);
    const byColumn = new Map(columns.map((column) => [column.id, [] as string[]]));
    const rows = groups.map((headers, row) => {
      let cursor = 0;
      return headers.flatMap((header, cell) => {
        while ((occupiedUntil[cursor] ?? 0) > row) cursor++;
        if (cursor >= occupiedUntil.length) return [];
        const requested = Math.max(1, Math.trunc(header.colspan ?? 1) || 1);
        let colspan = 1;
        while (colspan < requested && cursor + colspan < occupiedUntil.length && (occupiedUntil[cursor + colspan] ?? 0) <= row) colspan++;
        const rowspan = Math.min(groups.length - row, Math.max(1, Math.trunc(header.rowspan ?? 1) || 1));
        const id = this.tableId + '-group-' + row + '-' + cell;
        for (let position = cursor; position < cursor + colspan; position++) {
          occupiedUntil[position] = row + rowspan;
          const column = columns[position - controls];
          if (column) byColumn.get(column.id)?.push(id);
        }
        cursor += colspan;
        return [{ label: header.label, id, colspan, rowspan }];
      });
    });
    return { rows, byColumn };
  });

  protected leafHeaderId(column: HyTableColumn<T>): string {
    return this.tableId + '-column-' + encodeURIComponent(column.id);
  }

  protected cellHeaders(column: HyTableColumn<T>): string | null {
    if (!this.headerRows().length) return null;
    return [...(this.headerLayout().byColumn.get(column.id) ?? []), this.leafHeaderId(column)].join(' ');
  }

  protected readonly hasColumnFooters = computed(() => this.columns().some((column) => column.footer !== undefined));
  private readonly normalizedSortCycle = computed<readonly ('asc' | 'desc' | null)[]>(() => {
    const cycle = [...new Set(this.sortCycle())];
    return cycle.length ? cycle : ['asc', 'desc', null];
  });
  readonly activeSorts = computed(() => {
    if (this.sortMode() === 'multiple') return this.sorts();
    const sort = this.sort();
    return sort ? [sort] : [];
  });
  readonly query = computed<HyTableQuery>(() => ({ page: Math.max(1, Math.trunc(this.page()) || 1), pageSize: Math.max(0, Math.trunc(this.pageSize()) || 0), sorts: this.activeSorts(), filters: this.filters(), search: this.search() }));
  readonly filtered = computed(() => {
    if (this.mode() === 'server') return [...this.data()];
    const search = this.search().toLocaleLowerCase(this.effectiveLocale()); const filters = Object.entries(this.filters());
    return this.data().filter(row => (!search || this.columns().some(col => String(col.cell(row) ?? '').toLocaleLowerCase(this.effectiveLocale()).includes(search))) && filters.every(([id, value]) => { const col = this.columns().find(col => col.id === id); if (!col || value === '' || value === undefined || value === null) return true; return col.filter ? col.filter(value, row) : String(col.cell(row) ?? '').toLocaleLowerCase(this.effectiveLocale()).includes(String(value).toLocaleLowerCase(this.effectiveLocale())); }));
  });
  private readonly sorted = computed(() => {
    const rows = [...this.filtered()]; if (this.mode() === 'server') return rows;
    const collator = new Intl.Collator(this.effectiveLocale(), { numeric: true, sensitivity: 'base' });
    const sorts = this.activeSorts(); return rows.sort((a,b) => {
      for (const sort of sorts) { const col = this.columns().find(c => c.id === sort.column); if (!col?.sortable) continue;
        const av = col.cell(a), bv = col.cell(b); const result = col.compare ? col.compare(a,b) : av == null ? bv == null ? 0 : -1 : bv == null ? 1 : typeof av === 'number' && typeof bv === 'number' ? av-bv : collator.compare(String(av),String(bv));
        if (Number.isFinite(result) && result) return result * (sort.direction === 'asc' ? 1 : -1);
      } return 0;
    });
  });
  readonly pageRows = computed(() => { const rows = this.sorted(), query = this.query(); return this.mode() === 'server' || !query.pageSize ? rows : rows.slice((query.page-1)*query.pageSize, query.page*query.pageSize); });
  readonly resultCount = computed(() => this.mode() === 'server' ? this.total() ?? this.data().length : this.filtered().length);
  private readonly grouping = computed(() => {
    const groupBy = this.groupBy();
    if (!groupBy) return undefined;
    const groups = new Map<string, T[]>();
    const rowGroups = this.pageRows().map((row) => {
      const group = groupBy(row);
      const members = groups.get(group);
      if (members) members.push(row);
      else groups.set(group, [row]);
      return group;
    });
    return { groups, rowGroups };
  });
  protected readonly measureVirtualRows = computed(() =>
    this.virtual() && (!!this.groupBy() || !!this.rowTemplate()),
  );
  private readonly virtualPositions = computed(() => {
    if (!this.measureVirtualRows()) return undefined;
    const rows = this.pageRows();
    const measured = this.virtualMeasurements();
    const estimate = Math.max(1, this.rowHeight() || 48);
    const size = (index: number, part: string): number =>
      (measured.rows === rows ? measured.heights.get(index + ':' + part) : undefined) ?? estimate;
    const groups = this.grouping()?.rowGroups;
    const expanded = new Set(this.rowTemplate() ? this.expanded() : []);
    const rowKey = this.rowKey();
    const offsets = [0];
    let offset = 0;
    rows.forEach((row, index) => {
      let height = size(index, 'data');
      if (groups && (index === 0 || groups[index] !== groups[index - 1])) height += size(index, 'group');
      if (expanded.has(rowKey(row))) height += size(index, 'detail');
      offset += height;
      offsets.push(offset);
    });
    return offsets;
  });
  protected readonly frozenCount = computed(() =>
    Math.min(this.pageRows().length, Math.max(0, Math.trunc(this.frozenRows()) || 0)),
  );
  readonly rowWindow = computed(() => {
    const count = this.pageRows().length;
    if (!this.virtual()) return { first: 0, last: count, before: 0, after: 0 };

    const height = Math.max(1, this.rowHeight() || 48);
    const overscan = Math.max(0, this.overscan());
    const visibleCount = Math.max(1, Math.ceil((this.viewportHeight() || height * this.initialCount()) / height));
    const pinned = this.frozenCount();
    const offsets = this.virtualPositions();
    if (offsets && pinned < count) {
      const start = this.scrollOffset() - this.captionHeight() - this.headerHeight();
      const end = start + (this.viewportHeight() || visibleCount * height);
      const visibleStart = rowAtOffset(offsets, start + this.frozenRowOffset(pinned));
      const visibleEnd = rowAtOffset(offsets, end);
      const first = Math.max(pinned, Math.min(count - 1, visibleStart) - overscan);
      const last = Math.min(count, Math.max(first + 1, visibleEnd + overscan + 1));
      return {
        first,
        last,
        before: (offsets[first] ?? 0) - (offsets[pinned] ?? 0),
        after: (offsets[count] ?? 0) - (offsets[last] ?? 0),
      };
    }
    const lastStart = Math.max(pinned, count - visibleCount);
    const start = Math.min(lastStart, Math.floor(this.scrollOffset() / height));
    const first = Math.max(pinned, start - overscan);
    const last = Math.min(count, first + visibleCount + overscan * 2);
    return { first, last, before: (first - pinned) * height, after: (count - last) * height };
  });
  readonly view = computed(() => {
    const { first, last } = this.rowWindow();
    const rows = this.pageRows();
    const grouping = this.grouping();
    const visible = rows.slice(first, last).map((row, offset) => ({ row, index: first + offset }));
    const rendered = this.virtual()
      ? [...rows.slice(0, this.frozenCount()).map((row, index) => ({ row, index })), ...visible]
      : visible;
    return rendered.map(({ row, index }) => {
      const key = this.rowKey()(row);
      const group = grouping?.rowGroups[index];
      const groupStart = group !== undefined && (index === 0 || group !== grouping?.rowGroups[index - 1]);
      return {
        row,
        key,
        index,
        label: this.rowLabel()(row),
        selectable: this.rowSelectable()(row),
        selected: this.selectedSet().has(key),
        group,
        groupRows: group === undefined ? [] : grouping?.groups.get(group) ?? [],
        groupStart,
        cells: this.orderedColumns().map((column) => ({ column, value: column.cell(row) })),
      };
    });
  });
  readonly allSelected = computed(() => { const rows = this.pageRows().filter(this.rowSelectable()); return rows.length > 0 && rows.every(row => this.selectedSet().has(this.rowKey()(row))); });
  readonly someSelected = computed(() => this.pageRows().some(row => this.selectedSet().has(this.rowKey()(row))) && !this.allSelected());
  constructor() {
    effect(() => { const query = this.query(); untracked(() => this.queryChange.emit(query)); });
    const destroy = inject(DestroyRef); let cleanup: (() => void) | undefined;
    effect(() => { const element = this.viewport()?.nativeElement; if (!element || typeof ResizeObserver === 'undefined') return; cleanup?.(); const resize = new ResizeObserver(() => this.viewportHeight.set(element.clientHeight)); resize.observe(element); cleanup = () => resize.disconnect(); });
    destroy.onDestroy(() => cleanup?.());
    afterRenderEffect({
      read: (onCleanup) => {
        const viewport = this.viewport()?.nativeElement;
        const columns = this.orderedColumns();
        const frozenCount = this.frozenCount();
        if (!viewport || (!frozenCount && !columns.some((column) => column.frozen))) return;
        this.headerRows();
        const pinnedKeys = this.pageRows().slice(0, frozenCount).map(this.rowKey());
        const header = viewport.querySelector('thead');
        const cells = Array.from(viewport.querySelectorAll<HTMLTableCellElement>('thead [data-hy-column]'));
        const rows = Array.from(viewport.querySelectorAll<HTMLTableRowElement>('tbody > tr.frozen-row'))
          .slice(0, pinnedKeys.length);
        const measure = (): void => {
          this.headerHeight.set(header?.getBoundingClientRect().height ?? 0);
          this.renderedFrozenHeights.set(rows.map((row) => row.getBoundingClientRect().height));
          const widths = new Map<string, number>();
          for (const cell of cells) {
            const id = cell.dataset['hyColumn'];
            if (id !== undefined) widths.set(id, cell.getBoundingClientRect().width);
          }
          this.renderedColumnWidths.set(widths);
        };
        measure();
        if (typeof ResizeObserver === 'undefined') return;
        const resize = new ResizeObserver(measure);
        for (const element of [header, ...cells, ...rows]) if (element) resize.observe(element);
        onCleanup(() => resize.disconnect());
      },
    });
    afterRenderEffect({
      read: (onCleanup) => {
        if (!this.measureVirtualRows()) return;
        const viewport = this.viewport()?.nativeElement;
        if (!viewport) return;
        const rows = this.pageRows();
        const caption = viewport.querySelector('caption');
        const header = viewport.querySelector('thead');
        // Follow the current window so newly mounted rows contribute their measured height.
        this.view();
        this.expanded();
        const parts = Array.from(viewport.querySelectorAll<HTMLElement>('tbody > [data-virtual-part]'));
        const measure = (): void => {
          this.captionHeight.set(caption?.getBoundingClientRect().height ?? 0);
          this.headerHeight.set(header?.getBoundingClientRect().height ?? 0);
          const previous = this.virtualMeasurements();
          const heights = previous.rows === rows ? new Map(previous.heights) : new Map<string, number>();
          let changed = previous.rows !== rows;
          for (const part of parts) {
            const key = part.dataset['virtualPart'];
            if (key === undefined) continue;
            const height = part.getBoundingClientRect().height;
            if (height > 0 && Math.abs(height - (heights.get(key) ?? 0)) > 0.5) {
              heights.set(key, height);
              changed = true;
            }
          }
          if (changed) this.virtualMeasurements.set({ rows, heights });
        };
        untracked(measure);
        if (typeof ResizeObserver === 'undefined') return;
        const resize = new ResizeObserver(measure);
        for (const part of [caption, header, ...parts]) if (part) resize.observe(part);
        onCleanup(() => resize.disconnect());
      },
    });
  }
  setFilter(column: string, value: unknown): void { this.filters.update(filters => ({...filters,[column]:value})); this.page.set(1); }
  setSearch(value: string): void { this.search.set(value); this.page.set(1); }
  toggleSort(column: HyTableColumn<T>, additive = this.sortMode() === 'multiple'): void {
    if (!column.sortable) return; const active = this.activeSorts(), current = active.find(sort => sort.column === column.id)?.direction ?? null;
    const cycle = this.normalizedSortCycle(); const direction = cycle[(cycle.indexOf(current)+1)%cycle.length] ?? null;
    const nextSort: HyTableSort[] = direction ? [{ column: column.id, direction }] : [];
    const next = additive
      ? active.some(sort => sort.column === column.id)
        ? active.flatMap(sort => sort.column === column.id ? nextSort : [sort])
        : [...active, ...nextSort]
      : nextSort;
    if (this.sortMode() === 'multiple') this.sorts.set(next); else this.sort.set(next[0] ?? null); this.page.set(1); this.action.emit({type:'sort',column:column.id});
  }
  sortDirection(id: string): 'asc' | 'desc' | undefined { return this.activeSorts().find(sort => sort.column === id)?.direction; }
  toggleRow(key: HyRowKey, event?: MouseEvent): void {
    const row = this.pageRows().find(row => this.rowKey()(row) === key); if (!row || !this.rowSelectable()(row)) return;
    const selected = new Set(this.selectionMode() === 'single' ? [] : this.selected());
    if (event?.shiftKey && this.anchor !== null && this.selectionMode() === 'multiple') { const rows = this.pageRows(); const a = rows.findIndex(row => this.rowKey()(row) === this.anchor), b = rows.indexOf(row); if (a >= 0) for (const item of rows.slice(Math.min(a,b),Math.max(a,b)+1)) if (this.rowSelectable()(item)) selected.add(this.rowKey()(item)); }
    else if (this.selectedSet().has(key)) selected.delete(key); else selected.add(key);
    this.anchor = key; this.selected.set([...selected]); this.action.emit({type:'selection',row,key,originalEvent:event});
  }
  toggleAll(): void { if (this.selectionMode() === 'single') return; const selected = new Set(this.selected()), all = this.allSelected(); for (const row of this.pageRows().filter(this.rowSelectable())) { const key = this.rowKey()(row); if (all) selected.delete(key); else selected.add(key); } this.selected.set([...selected]); this.action.emit({type:'select-all'}); }
  context(event: MouseEvent, row: T): void { this.contextRow.set(this.rowKey()(row)); this.rowContext.emit({row,event}); this.action.emit({type:'context',row,key:this.rowKey()(row),originalEvent:event}); }
  toggleExpanded(row: T): void { const key = this.rowKey()(row); this.expanded.update(keys => keys.includes(key) ? keys.filter(item => item !== key) : [...keys,key]); this.action.emit({type:'expand',row,key}); }
  startEdit(row: T, column?: string): void { this.editing.set({key:this.rowKey()(row),column}); this.editStart.emit({row,column}); }
  commitEdit(value: unknown): boolean {
    const edit = this.editing();
    const row = this.data().find((item) => this.rowKey()(item) === edit?.key);
    if (!edit || row === undefined) return false;
    const outcome = this.columns().find((column) => column.id === edit.column)?.validateEdit?.(value, row);
    if (outcome === false || typeof outcome === 'string') {
      this.editInvalid.emit({ row, value, column: edit.column, message: typeof outcome === 'string' ? outcome : undefined });
      return false;
    }
    this.editing.set(null);
    this.editCommit.emit({ row, value, column: edit.column });
    return true;
  }
  cancelEdit(): void { const edit = this.editing(); if (edit) this.editCancel.emit(edit.key); this.editing.set(null); }
  width(column: HyTableColumn<T>): number | null { return this.columnWidths()[column.id] ?? column.width ?? (column.frozen ? 160 : null); }
  frozenOffset(column: HyTableColumn<T>): number | null {
    return column.frozen ? this.frozenOffsets().get(column.id) ?? 0 : null;
  }

  protected frozenRowOffset(index: number): number {
    const heights = this.renderedFrozenHeights();
    let offset = this.stickyHeader() ? this.headerHeight() : 0;
    for (let previous = 0; previous < index; previous++) offset += heights[previous] || this.rowHeight();
    return offset;
  }
  resizeColumn(id: string, width: number): void { const column = this.columns().find(col => col.id === id); if (!column || !Number.isFinite(width)) return; this.columnWidths.update(widths => ({...widths,[id]:Math.max(column.minWidth ?? 44, width)})); this.action.emit({type:'resize',column:id}); }
  moveColumn(id: string, index: number): void { if (!Number.isInteger(index)) return; const order = this.orderedColumns().map(col => col.id).filter(key => key !== id); if (!this.columns().some(col => col.id === id)) return; order.splice(Math.min(order.length,Math.max(0,index)),0,id); this.columnOrder.set(order); this.action.emit({type:'column-reorder',column:id}); }
  dragColumn(event: DragEvent, id: string): void { if (!this.reorderableColumns()) return; this.draggedColumn = id; event.dataTransfer?.setData('text/plain',id); }
  dropColumn(event: DragEvent, id: string): void { event.preventDefault(); if (this.reorderableColumns() && this.draggedColumn !== null && this.draggedColumn !== id) this.moveColumn(this.draggedColumn,this.orderedColumns().findIndex(col => col.id === id)); this.draggedColumn = null; }
  dragRow(event: DragEvent, key: HyRowKey): void { if (!this.reorderableRows()) return; this.draggedRow = key; event.dataTransfer?.setData('text/plain',String(key)); }
  dropRow(event: DragEvent, key: HyRowKey): void { event.preventDefault(); if (this.reorderableRows() && this.draggedRow !== null && this.draggedRow !== key) this.moveRow(this.draggedRow,this.data().findIndex(row => this.rowKey()(row) === key)); this.draggedRow = null; }
  cancelReorder(): void { this.draggedColumn = null; this.draggedRow = null; }
  moveRow(key: HyRowKey, index: number): void {
    const rows = [...this.data()];
    const from = rows.findIndex((row) => this.rowKey()(row) === key);
    if (from < 0 || !Number.isInteger(index)) return;
    const movedRows = rows.splice(from, 1);
    rows.splice(Math.min(rows.length, Math.max(0, index)), 0, ...movedRows);
    this.rowsReordered.emit(rows);
    this.action.emit({ type: 'row-reorder', row: movedRows[0], key });
  }
  protected scroll(event: Event): void { const element = event.target as HTMLElement; this.scrollOffset.set(element.scrollTop); this.viewportHeight.set(element.clientHeight); }
  exportCsv(scope: 'filtered' | 'all' | 'selected' = 'filtered'): string { const rows = scope === 'all' ? this.data() : scope === 'selected' ? this.data().filter(row => this.selectedSet().has(this.rowKey()(row))) : this.sorted(); const encode = (value: unknown): string => '"'+String(value ?? '').replace(/"/g,'""')+'"'; return [this.orderedColumns().map(col => encode(col.header)).join(','),...rows.map(row => this.orderedColumns().map(col => encode(col.cell(row))).join(','))].join('\r\n'); }
  saveState(): HyTableState { return {...this.query(),sorts:this.activeSorts().map(sort => ({...sort})),filters:{...this.filters()},selected:[...this.selected()],columnOrder:[...this.columnOrder()],columnWidths:{...this.columnWidths()}}; }
  restoreState(state: HyTableState): void {
    const sorts = state.sorts.map(sort => ({...sort}));
    this.page.set(state.page); this.pageSize.set(state.pageSize); this.sorts.set(sorts); this.sort.set(sorts[0] ?? null);
    this.filters.set({...state.filters}); this.search.set(state.search); this.selected.set([...state.selected]);
    this.columnOrder.set([...state.columnOrder]); this.columnWidths.set({...state.columnWidths});
  }
}
