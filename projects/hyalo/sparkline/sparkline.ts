import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
@Component({
  selector: 'hy-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sparkline.html',
  styleUrl: './sparkline.css',
  host: { role: 'img', '[attr.aria-label]': 'label()' },
})
export class HySparkline {
  readonly data = input.required<readonly number[]>();
  readonly label = input.required<string>();
  readonly points = computed(() => {
    const values = this.data().filter(Number.isFinite);
    if (!values.length) return '';
    const maximum = values[0] ?? 0;
    let scale = Math.abs(maximum);
    for (const value of values) scale = Math.max(scale, Math.abs(value));
    const normalized = values.map((value) => (scale ? value / scale : 0));
    let min = Infinity,
      max = -Infinity;
    for (const value of normalized) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
    const selected = new Set([0, values.length - 1]);
    const bucket = Math.max(1, Math.ceil(values.length / 80));
    for (let start = 0; start < values.length; start += bucket) {
      let low = start,
        high = start;
      for (let i = start; i < Math.min(values.length, start + bucket); i++) {
        if ((normalized[i] ?? 0) < (normalized[low] ?? 0)) low = i;
        if ((normalized[i] ?? 0) > (normalized[high] ?? 0)) high = i;
      }
      selected.add(low);
      selected.add(high);
    }
    return [...selected]
      .sort((a, b) => a - b)
      .map(
        (index) =>
          (values.length === 1 ? 100 : (index / (values.length - 1)) * 196 + 2).toFixed(2) +
          ',' +
          (max === min ? 24 : 44 - (((normalized[index] ?? 0) - min) / (max - min)) * 40).toFixed(
            2,
          ),
      )
      .join(' ');
  });
}
