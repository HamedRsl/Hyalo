import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  input,
  numberAttribute,
} from '@angular/core';
@Component({
  selector: 'hy-bento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bento.html',
  styleUrl: './bento.css',
})
export class HyBento {}
@Directive({
  selector: '[hyBentoTile]',
  host: {
    '[style.--hy-bento-columns]': 'safeColumns',
    '[style.grid-row]': '"span "+safeRows',
    '[style.grid-column]': '"span var(--hy-bento-span, "+safeColumns+")"',
    '[style.min-inline-size]': '"0"',
  },
})
export class HyBentoTile {
  readonly columns = input(1, { transform: numberAttribute });
  readonly rows = input(1, { transform: numberAttribute });
  get safeColumns(): number {
    return Math.min(3, Math.max(1, Math.floor(this.columns()) || 1));
  }
  get safeRows(): number {
    return Math.min(6, Math.max(1, Math.floor(this.rows()) || 1));
  }
}
export const HY_BENTO = [HyBento, HyBentoTile] as const;
