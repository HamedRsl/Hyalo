import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
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
  protected change(event: Event, index: number): void {
    if (this.blocked()) return;
    const number = Number((event.target as HTMLInputElement).value);
    const [start, end] = this.value();
    this.value.set(index === 0 ? [Math.min(number, end), end] : [start, Math.max(number, start)]);
  }
}
