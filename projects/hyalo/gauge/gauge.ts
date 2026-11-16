import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  HyLocale,
  type HyTone,
  type ɵHyMeasurement,
  ɵnormalizeMeasurement,
} from '@hyalo/angular/core';
import { gaugeArc, pointOnGauge } from './geometry';

export interface HyGaugeBand {
  /** Inclusive upper bound. Supply translated threshold wording through valueText. */
  readonly to: number;
  readonly tone: HyTone;
}
@Component({
  selector: 'hy-gauge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gauge.html',
  styleUrl: './gauge.css',
  host: {
    '[attr.role]': 'reading().value === null ? "img" : "meter"',
    '[attr.aria-label]': 'accessibleLabel()',
    '[attr.aria-valuemin]': 'reading().value === null ? null : reading().min',
    '[attr.aria-valuemax]': 'reading().value === null ? null : reading().max',
    '[attr.aria-valuenow]': 'reading().value',
    '[attr.aria-valuetext]': 'reading().value === null ? null : valueText() || formatted()',
    '[attr.data-tone]': 'effectiveTone()',
    '[attr.data-variant]': 'variant()',
  },
})
export class HyGauge {
  private readonly globalLocale = inject(HyLocale);
  readonly label = input.required<string>();
  readonly value = input.required<number | null>();
  readonly min = input(0);
  readonly max = input(100);
  readonly variant = input<'radial' | 'semicircle'>('radial');
  readonly tone = input<HyTone>('primary');
  readonly bands = input<readonly HyGaugeBand[]>([]);
  readonly ticks = input(5);
  readonly needle = input(false, { transform: booleanAttribute });
  readonly showRange = input(true, { transform: booleanAttribute });
  readonly locale = input<string>();
  readonly format = input<Intl.NumberFormatOptions>({ maximumFractionDigits: 1 });
  readonly unit = input('');
  readonly valueText = input('');
  readonly emptyLabel = input('No reading');
  protected readonly reading = computed<ɵHyMeasurement>(() =>
    ɵnormalizeMeasurement(this.value(), this.min(), this.max()),
  );
  protected readonly formatter = computed(
    () => new Intl.NumberFormat(this.locale() ?? this.globalLocale.locale(), this.format()),
  );
  protected readonly formatted = computed(() => {
    const value = this.reading().value;
    return value === null
      ? this.emptyLabel()
      : this.formatter().format(value) + (this.unit() ? ' ' + this.unit() : '');
  });
  protected readonly accessibleLabel = computed(() =>
    this.reading().value === null ? this.label() + ': ' + this.emptyLabel() : this.label(),
  );
  protected readonly effectiveTone = computed(() => {
    const value = this.reading().value;
    if (value === null) return 'neutral';
    return (
      [...this.bands()]
        .filter((band) => Number.isFinite(band.to))
        .sort((a, b) => a.to - b.to)
        .find((band) => value <= band.to)?.tone ?? this.tone()
    );
  });
  protected readonly angles = computed(() =>
    this.variant() === 'semicircle' ? { start: -90, sweep: 180 } : { start: -135, sweep: 270 },
  );
  protected readonly track = computed(() => gaugeArc(this.angles().start, this.angles().sweep));
  protected readonly fill = computed(() =>
    gaugeArc(this.angles().start, this.angles().sweep * this.reading().fraction),
  );
  protected readonly tip = computed(() =>
    pointOnGauge(this.angles().start + this.angles().sweep * this.reading().fraction, 32),
  );
  protected readonly marks = computed(() => {
    const count = Number.isFinite(this.ticks())
      ? Math.min(20, Math.max(0, Math.trunc(this.ticks())))
      : 0;
    if (count === 0) return [];
    return Array.from({ length: count + 1 }, (_, index) => {
      const angle = this.angles().start + (this.angles().sweep * index) / count;
      return { inner: pointOnGauge(angle, 44), outer: pointOnGauge(angle, 47) };
    });
  });
  protected readonly minText = computed(() => this.formatter().format(this.reading().min));
  protected readonly maxText = computed(() => this.formatter().format(this.reading().max));
}
