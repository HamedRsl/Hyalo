import { HyLocale } from '@hyalo/angular/core';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, input, model } from '@angular/core';
import { inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
const positive = (value: number): number =>
  Number.isFinite(value) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, Math.floor(value))) : 1;
@Component({
  selector: 'hy-pagination',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class HyPagination {
  readonly page = model(1);
  readonly total = input.required<number>();
  readonly pageSize = model(10);
  readonly pageSizes = input<readonly number[]>([]); readonly disabled = input(false);
  readonly showJump = input(false); readonly showFirstLast = input(true); readonly showLinks = input(true); readonly siblingCount = input(1);
  readonly pageSizeLabel = input('Items per page'); readonly jumpLabel = input('Go to page');
  readonly pageLabel = input<(page: string) => string>(page => 'Page ' + page);
  readonly reportTemplate = input<TemplateRef<HyPaginationReport>>();
  readonly report = computed<HyPaginationReport>(() => ({ $implicit: this.current(), page: this.current(), pageCount: this.pageCount(), total: Math.max(0,this.total()), first: this.total() > 0 ? (this.current()-1)*positive(this.pageSize())+1 : 0, last: Math.min(Math.max(0,this.total()),this.current()*positive(this.pageSize())) }));
  changePageSize(size: number): void { if (this.disabled() || !Number.isFinite(size) || size < 1) return; const first = (this.current()-1)*positive(this.pageSize()); this.pageSize.set(positive(size)); this.page.set(Math.floor(first/positive(size))+1); }
  readonly locale = input<string>();
  private readonly globalLocale = inject(HyLocale);
  private readonly effectiveLocale = computed(() => this.locale() ?? this.globalLocale.locale());
  readonly label = input('Pagination');
  readonly previousLabel = input('Previous page');
  readonly nextLabel = input('Next page');
  readonly pageCount = computed(() =>
    Math.max(
      1,
      Math.min(
        Number.MAX_SAFE_INTEGER,
        Math.ceil(
          (Number.isFinite(this.total()) ? Math.max(0, this.total()) : 0) /
            positive(this.pageSize()),
        ),
      ),
    ),
  );
  readonly current = computed(() => Math.min(this.pageCount(), positive(this.page())));
  readonly pages = computed(() => {
    const current = this.current(),
      last = this.pageCount(),
      set = new Set<number>(this.showFirstLast() ? [1, last] : []);
    for (let n = Math.max(1, current - Math.max(0,this.siblingCount())); n <= Math.min(last, current + Math.max(0,this.siblingCount())); n++) set.add(n);
    const nums = [...set].sort((a, b) => a - b),
      result: ({ value: number; label: string } | null)[] = [];
    const fmt = new Intl.NumberFormat(this.effectiveLocale());
    let previous = 0;
    for (const value of nums) {
      if (previous && value - previous > 1) result.push(null);
      result.push({ value, label: fmt.format(value) });
      previous = value;
    }
    return result;
  });
  go(page: number): void {
    if (this.disabled() || !Number.isFinite(page)) return;
    const next = Math.min(this.pageCount(), positive(page));
    if (next !== this.current()) this.page.set(next);
  }
}

export interface HyPaginationReport { readonly $implicit: number; readonly page: number; readonly pageCount: number; readonly first: number; readonly last: number; readonly total: number; }
