import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  selector: 'hy-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator', '[attr.aria-orientation]': 'orientation()', '[attr.data-align]': 'align()', '[style.margin-inline-start]': 'inset()' },
  template: '<span><ng-content /></span>',
  styleUrl: './divider.css',
})
export class HyDivider {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly inset = input('0');
  readonly align = input<'start' | 'center' | 'end'>('center');
}
