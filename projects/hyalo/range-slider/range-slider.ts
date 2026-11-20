import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

@Component({
  selector: 'hy-range-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './range-slider.html',
  styleUrl: './range-slider.css',
})
export class HyRangeSlider
  extends HyValueControl
  implements FormValueControl<readonly [number, number]>
{
  readonly value = model<readonly [number, number]>([0, 100]);
  readonly minValue = input(0);
  readonly maxValue = input(100);
  readonly step = input(1);
  readonly scale = input<{ toPosition(value: number): number; fromPosition(position: number): number }>();
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly reversed = input(false);
  readonly marks = input<readonly { value: number; label: string }[]>([]);
  readonly valueFormatter = input<(value: number) => string>(String);
  protected position(value: number): number { return this.scale()?.toPosition(value) ?? value; }
  readonly minDistance = input(0);
  readonly maxDistance = input<number>();
  readonly startDisabled = input(false);
  readonly endDisabled = input(false);
  readonly committed = output<readonly [number, number]>();
  private readonly minimumDistance = computed(() =>
    Number.isFinite(this.minDistance())
      ? Math.min(Math.max(0, this.maxValue() - this.minValue()), Math.max(0, this.minDistance()))
      : 0,
  );
  private readonly maximumDistance = computed(() => {
    const distance = this.maxDistance();
    return distance === undefined || !Number.isFinite(distance)
      ? Infinity
      : Math.max(this.minimumDistance(), distance);
  });
  protected readonly startMin = computed(() =>
    Math.max(this.minValue(), this.value()[1] - this.maximumDistance()),
  );
  protected readonly startMax = computed(() =>
    Math.max(this.startMin(), Math.min(this.maxValue(), this.value()[1] - this.minimumDistance())),
  );
  protected readonly endMin = computed(() =>
    Math.min(this.maxValue(), Math.max(this.minValue(), this.value()[0] + this.minimumDistance())),
  );
  protected readonly endMax = computed(() =>
    Math.max(this.endMin(), Math.min(this.maxValue(), this.value()[0] + this.maximumDistance())),
  );
  protected commit(index: number): void {
    if (!this.blocked() && !(index === 0 ? this.startDisabled() : this.endDisabled()))
      this.committed.emit(this.value());
  }
  protected change(event: Event, index: number): void {
    if (this.blocked() || (index === 0 ? this.startDisabled() : this.endDisabled())) return;
    const position = Number((event.target as HTMLInputElement).value);
    const number = this.scale()?.fromPosition(position) ?? position;
    if (!Number.isFinite(number)) return;
    const [start, end] = this.value();
    this.value.set(
      index === 0
        ? [Math.max(this.startMin(), Math.min(number, this.startMax())), end]
        : [start, Math.max(this.endMin(), Math.min(number, this.endMax()))],
    );
  }
}
