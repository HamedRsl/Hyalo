import { HyNumberTicker } from '@hyalo/angular/number-ticker';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
@Component({
  selector: 'hy-stat',
  imports: [HyNumberTicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat.html',
  styleUrl: './stat.css',
})
export class HyStat {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly trend = input('');
  readonly locale = input<string>();
  readonly format = input<Intl.NumberFormatOptions>({ maximumFractionDigits: 0 });
  readonly animate = input(false, { transform: booleanAttribute });
  readonly prefix = input('');
  readonly suffix = input('');
  readonly formatted = computed(
    () =>
      this.prefix() +
      new Intl.NumberFormat(this.locale(), this.format()).format(
        Number.isFinite(this.value()) ? this.value() : 0,
      ) +
      this.suffix(),
  );
  readonly accessible = this.formatted;
}
