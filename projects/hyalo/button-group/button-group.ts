import { ChangeDetectionStrategy, Component, input } from '@angular/core';
/** Groups native buttons. For mutually exclusive choices use HySegmented. */
@Component({
  selector: 'hy-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[attr.aria-label]': 'label()',
    '[attr.data-orientation]': 'orientation()',
  },
  template: '<ng-content />',
  styleUrl: './button-group.css',
})
export class HyButtonGroup {
  readonly label = input.required<string>();
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}
