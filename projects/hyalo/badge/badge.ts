import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { HY_CONFIG, HyMaterialDirective, type HySize, type HyTone } from '@hyalo/angular';
@Component({
  selector: 'hy-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: HyMaterialDirective, inputs: ['hyMaterial: material'] }],
  host: { '[attr.data-tone]': 'tone()', '[attr.data-size]': 'size()' },
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class HyBadge {
  private readonly config = inject(HY_CONFIG);
  readonly tone = input<HyTone>(this.config.tone);
  readonly size = input<HySize>(this.config.size);
  readonly removable = input(false, { transform: booleanAttribute });
  readonly removeLabel = input('Remove');
  readonly removed = output<void>();
}
/** A native toggle button for selectable filters. */
@Component({
  selector: 'hy-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: HyMaterialDirective, inputs: ['hyMaterial: material'] }],
  host: {
    '[attr.data-tone]': 'tone()',
    '[attr.data-size]': 'size()',
    '[attr.data-selected]': 'selected()',
  },
  templateUrl: './chip.html',
  styleUrls: ['./badge.css', './chip.css'],
})
export class HyChip {
  private readonly config = inject(HY_CONFIG);
  readonly tone = input<HyTone>(this.config.tone);
  readonly size = input<HySize>(this.config.size);
  readonly selected = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
}
export const HY_BADGE = [HyBadge, HyChip] as const;
