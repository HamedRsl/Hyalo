import { ChangeDetectionStrategy, Component, booleanAttribute, inject, input } from '@angular/core';
import { HY_CONFIG, type HySize, type HyTone } from '@hyalo/angular/core';

@Component({
  selector: 'hy-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<span class="dot" aria-hidden="true"></span><span>{{ label() }}</span>',
  styleUrl: './status.css',
  host: {
    '[attr.data-tone]': 'tone()',
    '[attr.data-size]': 'size()',
    '[attr.role]': 'announce() ? "status" : null',
  },
})
export class HyStatus {
  private readonly config = inject(HY_CONFIG);
  readonly label = input.required<string>();
  readonly tone = input<HyTone>(this.config.tone);
  readonly size = input<HySize>(this.config.size);
  readonly announce = input(false, { transform: booleanAttribute });
}
