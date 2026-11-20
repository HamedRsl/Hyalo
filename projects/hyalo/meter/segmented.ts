import {
  ChangeDetectionStrategy,
  Component,
  type TemplateRef,
  computed,
  inject,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HyLocale, type HyTone, ɵnormalizeMeasurement } from '@hyalo/angular/core';

export interface HyMeterSegment {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly tone?: HyTone;
  readonly color?: string;
  readonly icon?: string;
}
export interface HyMeterSegmentContext {
  readonly $implicit: HyMeterSegment;
  readonly index: number;
  readonly percent: number;
  readonly total: number;
}
@Component({
  selector: 'hy-meter-group',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './meter-group.html',
  styleUrl: './segmented.css',
  host: {
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-label-position]': 'labelPosition()',
    '[attr.data-label-orientation]': 'labelOrientation()',
  },
})
export class HyMeterGroup {
  private readonly globalLocale = inject(HyLocale);
  readonly label = input.required<string>();
  readonly values = input.required<readonly HyMeterSegment[]>();
  readonly min = input(0);
  readonly max = input(100);
  readonly locale = input<string>();
  readonly valueText = input('');
  readonly showLabels = input(true);
  readonly meterTemplate = input<TemplateRef<HyMeterSegmentContext>>();
  readonly labelTemplate = input<TemplateRef<HyMeterSegmentContext>>();
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly labelPosition = input<'start' | 'end'>('end');
  readonly labelOrientation = input<'horizontal' | 'vertical'>('horizontal');
  protected readonly range = computed(() => ɵnormalizeMeasurement(0, this.min(), this.max()));
  protected readonly segments = computed(() => {
    const range = this.range(),
      span = range.max - range.min;
    let remaining = span;
    const format = new Intl.NumberFormat(this.locale() ?? this.globalLocale.locale(), {
      maximumFractionDigits: 1,
    });
    return this.values().map((item) => {
      const value = Math.min(remaining, Number.isFinite(item.value) ? Math.max(0, item.value) : 0);
      remaining -= value;
      return { ...item, value, percent: (value / span) * 100, text: format.format(value) };
    });
  });
  protected readonly total = computed(
    () => this.range().min + this.segments().reduce((sum, item) => sum + item.value, 0),
  );
}
export interface HyProgressStep {
  readonly id: string;
  readonly label: string;
  readonly state: 'pending' | 'active' | 'complete' | 'error';
}
@Component({
  selector: 'hy-segmented-progress',
  imports: [NgTemplateOutlet],
  host: { '[attr.data-orientation]': 'orientation()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './segmented-progress.html',
  styleUrl: './segmented.css',
})
export class HySegmentedProgress {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly valueText = input('');
  readonly stepTemplate = input<TemplateRef<{ $implicit: HyProgressStep; index: number }>>();
  readonly label = input.required<string>();
  readonly steps = input.required<readonly HyProgressStep[]>();
  readonly stateLabels = input<Readonly<Record<HyProgressStep['state'], string>>>({
    pending: 'Pending',
    active: 'In progress',
    complete: 'Complete',
    error: 'Needs attention',
  });
  protected readonly complete = computed(
    () => this.steps().filter((step) => step.state === 'complete').length,
  );
  protected readonly current = computed(
    () => this.steps().find((step) => step.state === 'active')?.id,
  );
}
export const HY_METERS = [HyMeterGroup, HySegmentedProgress] as const;
