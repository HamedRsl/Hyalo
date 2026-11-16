import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  selector: 'hy-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator', '[attr.aria-orientation]': 'orientation()' },
  template: '',
  styleUrl: './divider.css',
})
export class HyDivider {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}
