import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HyIcon } from '@hyalo/angular/icon';
@Component({
  selector: 'hy-empty-state',
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class HyEmptyState {
  readonly heading = input.required<string>();
  readonly headingLevel = input<2 | 3 | 4 | 5 | 6>(2);
  readonly description = input('');
  readonly icon = input<string>();
}
