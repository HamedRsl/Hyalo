import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  inject,
  model,
  output,
} from '@angular/core';
import { HyMotion } from '@hyalo/angular';
import { HyPopover } from '@hyalo/angular/popover';
import type { HyPlacement } from '@hyalo/angular/overlay';
export type HyHotspotMode = 'label' | 'pin';
export interface HyHotspotPosition {
  readonly x: number;
  readonly y: number;
  readonly visible?: boolean;
}
/** Pass screen coordinates from your scene's projection. Position is relative to its frame. */
@Component({
  selector: 'hy-hotspot',
  imports: [HyPopover],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.inset-inline-start.%]': 'position().x',
    '[style.inset-block-start.%]': 'position().y',
    '[hidden]': '!visible()',
    '[attr.data-mode]': 'mode()',
    '[attr.data-open]': 'open()',
    '[attr.data-motion]': 'motion.enabled()',
    '[style.--hy-hotspot-duration]': 'motion.enabled() ? "var(--hy-dur-quick)" : "0ms"',
  },
  templateUrl: './hotspot.html',
  styleUrl: './hotspot.css',
})
export class HyHotspot {
  protected readonly motion = inject(HyMotion);
  readonly label = input.required<string>();
  readonly position = input.required<HyHotspotPosition>();
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Optional detail panel. Without a description this stays a plain action button. */
  readonly description = input('');
  readonly mode = input<HyHotspotMode>('label');
  readonly open = model(false);
  readonly placement = input<HyPlacement>('top');
  readonly closeLabel = input('Close details');
  readonly activated = output<void>();
  protected readonly visible = computed(
    () =>
      this.position().visible !== false &&
      Number.isFinite(this.position().x) &&
      Number.isFinite(this.position().y),
  );
}
