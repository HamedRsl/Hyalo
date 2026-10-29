import { Dialog, type DialogConfig } from '@angular/cdk/dialog';
import type { ComponentType } from '@angular/cdk/portal';
import type { PositionStrategy } from '@angular/cdk/overlay';
import type { TemplateRef } from '@angular/core';
import { filter } from 'rxjs';
import type { HyMaterial } from '../core/axes';
import type { HyMotion } from '../motion/motion';
import type { HyFidelity } from '../fidelity/fidelity';
import { HY_DIALOG_DATA, HyDialogRef } from './dialog-ref';

/** Options shared by dialogs and drawers. */
export interface HySurfaceConfig<D> {
  /** Passed to the content as `HY_DIALOG_DATA`. */
  readonly data?: D;
  /** Accessible name, when the content has no `hyDialogTitle`. */
  readonly label?: string;
  /** Close on Escape and backdrop click. Defaults to true. */
  readonly dismissible?: boolean;
  /** Glass material of the panel. */
  readonly material?: HyMaterial;
  /** Where focus goes on open. Defaults to the first tabbable element. */
  readonly autoFocus?: DialogConfig['autoFocus'];
  /** `alertdialog` for messages that need an answer. */
  readonly role?: 'dialog' | 'alertdialog';
}

/** @internal Opens a CDK dialog wrapped in a HyDialogRef. */
export function openSurface<R, D>(
  cdk: Dialog,
  motion: HyMotion,
  fidelity: HyFidelity,
  content: ComponentType<unknown> | TemplateRef<unknown>,
  config: HySurfaceConfig<D>,
  extra: {
    panelClass: string[];
    positionStrategy?: PositionStrategy;
    width?: string;
    maxWidth?: string;
    height?: string;
  },
): HyDialogRef<R> {
  let ref: HyDialogRef<R> | undefined;
  const dismissible = config.dismissible ?? true;

  const cdkRef = cdk.open<R, D, unknown>(content, {
    data: config.data,
    role: config.role ?? 'dialog',
    ariaLabel: config.label ?? null,
    autoFocus: config.autoFocus ?? 'first-tabbable',
    restoreFocus: true,
    ariaModal: true,
    // Closing is handled here so the exit animation can play first.
    disableClose: true,
    hasBackdrop: true,
    backdropClass: 'hy-backdrop',
    panelClass: extra.panelClass,
    positionStrategy: extra.positionStrategy,
    width: extra.width,
    maxWidth: extra.maxWidth,
    height: extra.height,
    providers: (dialogRef) => {
      ref = new HyDialogRef<R>(dialogRef, () => motion.reduced());
      return [
        { provide: HyDialogRef, useValue: ref },
        { provide: HY_DIALOG_DATA, useValue: config.data },
      ];
    },
  });

  const hyRef = ref ?? new HyDialogRef<R>(cdkRef, () => motion.reduced());
  const container = hyRef.containerElement;
  if (container) {
    container.classList.add('hy-glass');
    container.dataset['material'] =
      fidelity.tier() === 'low' ? 'solid' : (config.material ?? 'frosted');
  }
  if (dismissible) {
    cdkRef.backdropClick.subscribe(() => hyRef.close());
    cdkRef.keydownEvents
      .pipe(filter((e) => e.key === 'Escape' && !e.defaultPrevented))
      .subscribe((e) => {
        e.preventDefault();
        hyRef.close();
      });
  }
  return hyRef;
}
