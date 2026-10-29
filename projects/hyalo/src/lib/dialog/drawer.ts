import { Dialog } from '@angular/cdk/dialog';
import { createGlobalPositionStrategy } from '@angular/cdk/overlay';
import type { ComponentType } from '@angular/cdk/portal';
import { Injectable, Injector, TemplateRef, inject } from '@angular/core';
import { HyFidelity } from '../fidelity/fidelity';
import { HyMotion } from '../motion/motion';
import type { HyDialogRef } from './dialog-ref';
import { openSurface, type HySurfaceConfig } from './open-surface';

/**
 * Which edge the drawer slides from. `start` and `end` follow the text
 * direction, so `end` is the right edge in LTR and the left edge in RTL.
 * `bottom` gives a sheet, handy on phones.
 */
export type HyDrawerSide = 'start' | 'end' | 'bottom';

/** Options for {@link HyDrawer.open}. */
export interface HyDrawerConfig<D = unknown> extends HySurfaceConfig<D> {
  readonly side?: HyDrawerSide;
  /** Any CSS length. Width for side drawers, height for the bottom sheet. */
  readonly size?: string;
}

/**
 * Opens a modal drawer: navigation on phones, a cart, filters. It behaves
 * like a dialog (focus trap, Escape, backdrop, focus restore) and uses the
 * same content parts and `HyDialogRef`.
 *
 * ```ts
 * this.drawer.open(CartPanel, { side: 'end', label: 'Cart' });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class HyDrawer {
  private readonly cdk = inject(Dialog);
  private readonly motion = inject(HyMotion);
  private readonly fidelity = inject(HyFidelity);
  private readonly injector = inject(Injector);

  /** Opens a component or template in a drawer. */
  open<R = unknown, D = unknown>(
    content: ComponentType<unknown> | TemplateRef<unknown>,
    config: HyDrawerConfig<D> = {},
  ): HyDialogRef<R> {
    const side = config.side ?? 'end';
    const position = createGlobalPositionStrategy(this.injector);
    if (side === 'bottom') position.bottom('0').centerHorizontally();
    else if (side === 'start') position.start('0').top('0');
    else position.end('0').top('0');

    return openSurface<R, D>(this.cdk, this.motion, this.fidelity, content, config, {
      panelClass: ['hy-drawer-pane', `hy-drawer--${side}`],
      positionStrategy: position,
      width: side === 'bottom' ? '100%' : (config.size ?? 'min(24rem, 100vw - 2.5rem)'),
      height: side === 'bottom' ? (config.size ?? 'auto') : '100%',
    });
  }
}
