import { Dialog } from '@angular/cdk/dialog';
import type { ComponentType } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, Injectable, TemplateRef, inject, signal } from '@angular/core';
import { HyButton } from '@hyalo/angular/button';

import { HyFidelity, type HyTone } from '@hyalo/angular/core';
import { HyMotion } from '@hyalo/angular/motion';

import { HY_DIALOG_DATA, HyDialogRef } from './dialog-ref';
import { HY_DIALOG_PARTS } from './dialog-parts';
import { openSurface, type HySurfaceConfig } from './open-surface';
import { HyDialogRegistry } from './dialog-registry';

/** Dialog width. `full` fills the screen on small viewports. */
export type HyDialogSize = 'sm' | 'md' | 'lg' | 'full';

// Set inline because the CDK pane's own max-width sits outside our cascade layers.
const MAX_WIDTH: Record<HyDialogSize, string> = {
  sm: '26rem',
  md: '36rem',
  lg: '52rem',
  full: '72rem',
};

/** Options for {@link HyDialog.open}. */
export interface HyDialogConfig<D = unknown> extends HySurfaceConfig<D> {
  readonly size?: HyDialogSize;
}

/** Options for {@link HyDialog.confirm}. */
export interface HyConfirmOptions {
  readonly title: string;
  readonly message?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  /** Use `danger` for destructive actions. */
  readonly tone?: HyTone;
  /** Returning false keeps the confirmation open. Errors are exposed as accessible text. */
  readonly confirm?: () => boolean | void | Promise<boolean | void>;
  readonly errorMessage?: string;
}

@Component({
  selector: 'hy-confirm-dialog',
  imports: [HY_DIALOG_PARTS, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog.html',
})
class HyConfirmDialog {
  protected readonly data = inject(HY_DIALOG_DATA) as HyConfirmOptions;
  protected readonly ref = inject(HyDialogRef<boolean>);
  protected readonly pending = signal(false);
  protected readonly failed = signal(false);
  protected async confirm(): Promise<void> {
    if (this.pending()) return;
    this.pending.set(true);
    this.failed.set(false);
    try { if ((await this.data.confirm?.()) !== false) this.ref.close(true, 'action'); }
    catch { this.failed.set(true); }
    finally { this.pending.set(false); }
  }
}

/**
 * Opens modal dialogs. Focus is trapped inside while open and returns to
 * the element that opened it. Escape and a backdrop click close it unless
 * `dismissible` is false.
 *
 * ```ts
 * const ref = this.dialog.open(EditAddress, { data: address, size: 'md' });
 * const saved = await ref.closed;
 *
 * if (await this.dialog.confirm({ title: 'Delete this draft?', tone: 'danger', confirmLabel: 'Delete' })) {
 *   ...
 * }
 * ```
 *
 * In the content component, inject `HyDialogRef` to close and
 * `HY_DIALOG_DATA` to read the data. Lay it out with `hyDialogTitle`,
 * `hyDialogContent` and `hyDialogActions`.
 */
@Injectable({ providedIn: 'root' })
export class HyDialog {
  private readonly cdk = inject(Dialog);
  private readonly motion = inject(HyMotion);
  private readonly fidelity = inject(HyFidelity);
  private readonly registry = inject(HyDialogRegistry);
  readonly openDialogs = this.registry.openDialogs;
  readonly afterAllClosed = this.registry.afterAllClosed;
  getById(id: string): HyDialogRef | undefined { return this.registry.getById(id); }
  closeAll(): void { this.registry.closeAll(); }

  /** Opens a component or template as a dialog. */
  open<R = unknown, D = unknown>(
    content: ComponentType<unknown> | TemplateRef<unknown>,
    config: HyDialogConfig<D> = {},
  ): HyDialogRef<R> {
    const size = config.size ?? 'md';
    return this.registry.track(openSurface<R, D>(this.cdk, this.motion, this.fidelity, content, config, {
      panelClass: ['hy-dialog-pane', `hy-dialog--${size}`],
      maxWidth: MAX_WIDTH[size],
    }));
  }

  /** Asks a yes or no question. Resolves to true only when confirmed. */
  async confirm(options: HyConfirmOptions): Promise<boolean> {
    const ref = this.open<boolean, HyConfirmOptions>(HyConfirmDialog, {
      data: options,
      size: 'sm',
      role: 'alertdialog',
    });
    return (await ref.closed) === true;
  }
}
