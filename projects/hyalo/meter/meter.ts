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
    '[attr.aria-valuetext]': 'reading().value === null ? null : valueText() || null',
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
  protected readonly reading = computed<ɵHyMeasurement>(() =>
    ɵnormalizeMeasurement(this.value(), this.min(), this.max()),
  );
  protected readonly accessibleLabel = computed(() =>
    this.reading().value === null ? this.label() + ': ' + this.emptyLabel() : this.label(),
  );
}
