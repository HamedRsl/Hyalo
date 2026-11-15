import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
const positive = (value: number): number =>
  Number.isFinite(value) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, Math.floor(value))) : 1;
@Component({
  selector: 'hy-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class HyPagination {
  readonly page = model(1);
  readonly total = input.required<number>();
  readonly pageSize = input(10);
  readonly locale = input('en');
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
      set = new Set([1, last]);
    for (let n = Math.max(1, current - 1); n <= Math.min(last, current + 1); n++) set.add(n);
    const nums = [...set].sort((a, b) => a - b),
      result: ({ value: number; label: string } | null)[] = [];
    const fmt = new Intl.NumberFormat(this.locale());
    let previous = 0;
    for (const value of nums) {
      if (previous && value - previous > 1) result.push(null);
      result.push({ value, label: fmt.format(value) });
      previous = value;
    }
    return result;
  });
  go(page: number): void {
    const next = Math.min(this.pageCount(), positive(page));
    if (next !== this.current()) this.page.set(next);
  }
}
