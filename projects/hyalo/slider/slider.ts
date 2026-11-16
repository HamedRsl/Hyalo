import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

@Component({
  selector: 'hy-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './slider.html',
  styleUrl: './slider.css',
})
export class HySlider extends HyValueControl implements FormValueControl<number> {
  readonly value = model(0);
  readonly min = input<number | undefined>(0);
  readonly max = input<number | undefined>(100);
  readonly step = input(1);
  protected change(event: Event): void {
    if (!this.blocked()) this.value.set(Number((event.target as HTMLInputElement).value));
  }
}
