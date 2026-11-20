import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type HyTone, type ɵHyMeasurement, ɵnormalizeMeasurement } from '@hyalo/angular/core';

@Component({
  selector: 'hy-meter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './meter.html',
  styleUrl: './meter.css',
  host: {
    '[attr.role]': 'reading().value === null ? "img" : "meter"',
    '[attr.aria-label]': 'accessibleLabel()',
    '[attr.aria-valuemin]': 'reading().value === null ? null : reading().min',
    '[attr.aria-valuemax]': 'reading().value === null ? null : reading().max',
    '[attr.aria-valuenow]': 'reading().value',
    '[attr.aria-valuetext]': 'reading().value === null ? null : valueText() || thresholdText()',
    '[attr.data-quality]': 'quality()',
    '[attr.data-tone]': 'tone()',
    '[attr.data-empty]': 'reading().value === null',
  },
})
export class HyMeter {
  readonly label = input.required<string>();
  readonly value = input.required<number | null>();
  readonly min = input(0);
  readonly max = input(100);
  readonly valueText = input('');
  readonly emptyLabel = input('No reading');
  readonly tone = input<HyTone>('primary');
  readonly low = input<number>();
  readonly high = input<number>();
  readonly optimum = input<number>();
  readonly qualityLabels = input({
    optimum: 'Optimum',
    suboptimal: 'Acceptable',
    worst: 'Suboptimal',
  });
  protected readonly quality = computed<'optimum' | 'suboptimal' | 'worst' | null>(() => {
    const { min, max, value } = this.reading();
    if (value === null || [this.low(), this.high(), this.optimum()].every((v) => v === undefined))
      return null;
    const clamp = (v: number | undefined, fallback: number): number =>
      v !== undefined && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
    const low = clamp(this.low(), min),
      high = Math.max(low, clamp(this.high(), max)),
      optimum = clamp(this.optimum(), (min + max) / 2);
    if (optimum < low) return value <= low ? 'optimum' : value <= high ? 'suboptimal' : 'worst';
    if (optimum > high) return value >= high ? 'optimum' : value >= low ? 'suboptimal' : 'worst';
    return value >= low && value <= high ? 'optimum' : 'suboptimal';
  });
  protected readonly thresholdText = computed(() => {
    const quality = this.quality();
    return quality ? `${this.reading().value}: ${this.qualityLabels()[quality]}` : null;
  });
  protected readonly reading = computed<ɵHyMeasurement>(() =>
    ɵnormalizeMeasurement(this.value(), this.min(), this.max()),
  );
  protected readonly accessibleLabel = computed(() =>
    this.reading().value === null ? this.label() + ': ' + this.emptyLabel() : this.label(),
  );
}
