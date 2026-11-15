import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  selector: 'hy-scroll-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-area.html',
  styleUrl: './scroll-area.css',
  host: {
    role: 'region',
    tabindex: '0',
    '[attr.aria-label]': 'label()',
    '[style.max-block-size]': 'maxHeight()',
  },
})
export class HyScrollArea {
  readonly label = input.required<string>();
  readonly maxHeight = input('20rem');
}
