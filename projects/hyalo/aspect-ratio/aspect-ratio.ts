import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
@Component({
  selector: 'hy-aspect-ratio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.aspect-ratio]': 'safeRatio()' },
  template: '<ng-content />',
  styleUrl: './aspect-ratio.css',
})
export class HyAspectRatio {
  readonly ratio = input(16 / 9, { transform: numberAttribute });
  protected readonly safeRatio = computed(() =>
    Number.isFinite(this.ratio()) && this.ratio() > 0 ? this.ratio() : 16 / 9,
  );
}
