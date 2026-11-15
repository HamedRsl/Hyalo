import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  InjectionToken,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { Chart } from 'chart.js';
export interface HyChartSeries {
  readonly label: string;
  readonly values: readonly (number | null)[];
}
export interface HyChartData {
  readonly labels: readonly string[];
  readonly series: readonly HyChartSeries[];
}
export type HyChartType = 'line' | 'bar' | 'doughnut';
let engine: Promise<typeof import('./engine')> | undefined;
const loadEngine = (): Promise<typeof import('./engine')> =>
  (engine ??= import('./engine').catch((error: unknown) => {
    engine = undefined;
    throw error;
  }));
/** Override to provide a compatible Chart.js loader, for example from a shared app chunk. */
export const HY_CHART_LOADER = new InjectionToken<() => Promise<typeof import('./engine')>>(
  'HY_CHART_LOADER',
  { providedIn: 'root', factory: () => loadEngine },
);
@Component({
  selector: 'hy-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
export class HyChart {
  readonly data = input.required<HyChartData>();
  readonly type = input<HyChartType>('line');
  readonly label = input.required<string>();
  readonly summary = input('');
  readonly locale = input('en');
  readonly tableLabel = input('View chart data');
  protected readonly error = signal(false);
  private readonly visible = signal(false);
  private readonly theme = signal(0);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly palette = viewChild<ElementRef<HTMLElement>>('palette');
  private readonly document = inject(DOCUMENT);
  private readonly load = inject(HY_CHART_LOADER);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private chart: Chart | undefined;
  private generation = 0;
  private destroyed = false;
  private readonly formatter = computed(() => new Intl.NumberFormat(this.locale()));
  readonly rows = computed(() =>
    this.data().labels.map((label, index) => ({
      label,
      values: this.data().series.map((series) => {
        const value = series.values[index];
        return value == null || !Number.isFinite(value) ? '–' : this.formatter().format(value);
      }),
    })),
  );
  constructor() {
    let observer: IntersectionObserver | undefined, mutation: MutationObserver | undefined;
    let media: MediaQueryList | undefined;
    const changed = (): void => this.theme.update((value) => value + 1);
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') this.visible.set(true);
      else {
        observer = new IntersectionObserver(
          (entries) => this.visible.set(entries.some((entry) => entry.isIntersecting)),
          { rootMargin: '150px' },
        );
        observer.observe(this.host.nativeElement);
      }
      mutation = new MutationObserver(changed);
      mutation.observe(this.document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style', 'dir', 'data-hy-theme', 'data-hy-palette'],
      });
      media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
      media?.addEventListener('change', changed);
    });
    afterRenderEffect(() => {
      const data = this.data(),
        type = this.type(),
        locale = this.locale();
      this.theme();
      if (!this.visible()) return;
      untracked(() => void this.render(data, type, locale));
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.generation++;
      observer?.disconnect();
      mutation?.disconnect();
      media?.removeEventListener('change', changed);
      this.chart?.destroy();
    });
  }
  protected retry(): void {
    this.theme.update((value) => value + 1);
  }
  private async render(data: HyChartData, type: HyChartType, locale: string): Promise<void> {
    const generation = ++this.generation;
    try {
      const kit = await this.load();
      if (this.destroyed || generation !== this.generation) return;
      const canvas = this.canvas()?.nativeElement,
        palette = this.palette()?.nativeElement,
        view = this.document.defaultView;
      if (!canvas || !palette || !view) return;
      const colors = [...palette.children].map((element) => view.getComputedStyle(element).color);
      const ink = view.getComputedStyle(palette).color,
        border = view.getComputedStyle(palette).borderBlockStartColor;
      const rtl = view.getComputedStyle(this.host.nativeElement).direction === 'rtl';
      const datasets = data.series.map((series, index) => ({
        label: series.label,
        data: data.labels.map((_, i) => {
          const value = series.values[i];
          return value != null && Number.isFinite(value) ? value : null;
        }),
        borderColor: colors[index % colors.length],
        backgroundColor:
          type === 'doughnut'
            ? data.labels.map((_, i) => colors[i % colors.length])
            : colors[index % colors.length],
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.25,
      }));
      this.chart?.destroy();
      this.chart = undefined;
      this.chart = new kit.Chart(canvas, {
        type,
        data: { labels: [...data.labels], datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          locale,
          plugins: {
            legend: {
              display: data.series.length > 1 || type === 'doughnut',
              rtl,
              textDirection: rtl ? 'rtl' : 'ltr',
              labels: { color: ink, usePointStyle: true },
            },
            tooltip: { rtl, textDirection: rtl ? 'rtl' : 'ltr' },
          },
          ...(type === 'doughnut'
            ? {}
            : {
                scales: {
                  x: {
                    ticks: { color: ink, maxRotation: 0, autoSkip: true },
                    grid: { display: false },
                  },
                  y: { ticks: { color: ink }, grid: { color: border }, beginAtZero: true },
                },
              }),
        },
      });
      this.error.set(false);
    } catch {
      if (!this.destroyed && generation === this.generation) this.error.set(true);
    }
  }
}
