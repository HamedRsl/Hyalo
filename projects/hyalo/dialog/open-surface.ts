import { Dialog, type DialogConfig } from '@angular/cdk/dialog';
import type { ComponentType } from '@angular/cdk/portal';
import type { PositionStrategy } from '@angular/cdk/overlay';
import type { TemplateRef } from '@angular/core';
import { filter } from 'rxjs';
import type { HyFidelity, HyMaterial } from '@hyalo/angular/core';
import type { HyMotion } from '@hyalo/angular/motion';
import { HY_DIALOG_DATA, HyDialogRef, type HyDialogCloseGuard } from './dialog-ref';
import type { HyDrawerSide } from './drawer';
import { driveSheet } from './sheet';

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
  readonly closeGuard?: HyDialogCloseGuard;
  readonly closeOnEscape?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly hasBackdrop?: boolean;
  readonly panelClass?: string | string[];
  readonly backdropClass?: string | string[];
  readonly id?: string;
  readonly width?: string;
  readonly height?: string;
  readonly minWidth?: string | number;
  readonly minHeight?: string | number;
  readonly maxWidth?: string | number;
  readonly maxHeight?: string | number;
  readonly positionStrategy?: PositionStrategy;
  readonly injector?: DialogConfig['injector'];
  readonly viewContainerRef?: DialogConfig['viewContainerRef'];
  readonly templateContext?: DialogConfig['templateContext'];
  readonly restoreFocus?: DialogConfig['restoreFocus'];
  readonly ariaLabelledBy?: string;
  readonly ariaDescribedBy?: string;
  readonly ariaModal?: boolean;
  readonly direction?: DialogConfig['direction'];
  readonly scrollStrategy?: DialogConfig['scrollStrategy'];
  readonly closeOnNavigation?: boolean;
  readonly closeOnScroll?: boolean;
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
    /** Drawers and sheets run on a spring and can be dragged closed. */
    sheet?: HyDrawerSide;
  },
): HyDialogRef<R> {
  let ref: HyDialogRef<R> | undefined;
  const dismissible = config.dismissible ?? true;

  const cdkRef = cdk.open<R, D, unknown>(content, {
    data: config.data,
    role: config.role ?? 'dialog',
    ariaLabel: config.label ?? null,
    autoFocus: config.autoFocus ?? 'first-tabbable',
    restoreFocus: config.restoreFocus ?? true,
    ariaModal: config.ariaModal ?? true,
    ariaLabelledBy: config.ariaLabelledBy,
    ariaDescribedBy: config.ariaDescribedBy,
    id: config.id,
    injector: config.injector,
    viewContainerRef: config.viewContainerRef,
    templateContext: config.templateContext,
    direction: config.direction,
    scrollStrategy: config.scrollStrategy,
    closeOnNavigation: false,
    // Closing is handled here so the exit animation can play first.
    disableClose: true,
    hasBackdrop: config.hasBackdrop ?? true,
    backdropClass: ['hy-backdrop', ...[config.backdropClass ?? []].flat()],
    panelClass: [...extra.panelClass, ...[config.panelClass ?? []].flat()],
    positionStrategy: config.positionStrategy ?? extra.positionStrategy,
    width: config.width ?? extra.width,
    maxWidth: config.maxWidth ?? extra.maxWidth,
    height: config.height ?? extra.height,
    minWidth: config.minWidth,
    minHeight: config.minHeight,
    maxHeight: config.maxHeight,
    providers: (dialogRef) => {
      ref = new HyDialogRef<R>(dialogRef, config.closeGuard);
      return [
        { provide: HyDialogRef, useValue: ref },
        { provide: HY_DIALOG_DATA, useValue: config.data },
      ];
    },
  });

  const hyRef = ref ?? new HyDialogRef<R>(cdkRef, config.closeGuard);
  const container = hyRef.containerElement;
  if (container) {
    container.classList.add('hy-glass');
    container.dataset['material'] =
      fidelity.tier() === 'low' ? 'solid' : (config.material ?? 'frosted');
    // Dialogs and sheets are the largest glass on the page, so the thickest.
    container.dataset['thickness'] = 'thick';
    // With reduced motion the CSS cross-fade runs instead of the spring.
    if (extra.sheet && !motion.reduced()) {
      const driver = driveSheet(container, cdkRef.overlayRef.backdropElement, extra.sheet, {
        dismissible,
        close: () => hyRef.close(undefined, 'gesture'),
        cancelClose: () => hyRef.cancelClose(),
      });
      hyRef.exit = driver.exit;
      hyRef.closeVetoed.subscribe(() => driver.restore());
      cdkRef.closed.subscribe(() => driver.destroy());
    }
  }
  if (config.closeOnBackdrop ?? dismissible) {
    cdkRef.backdropClick.subscribe(() => hyRef.close(undefined, 'backdrop'));
  }
  if (config.closeOnEscape ?? dismissible) {
    cdkRef.keydownEvents
      .pipe(filter((e) => e.key === 'Escape' && !e.defaultPrevented))
      .subscribe((e) => {
        e.preventDefault();
        hyRef.close(undefined, 'escape');
      });
  }
  const view = container?.ownerDocument.defaultView;
  const navigation = (): void => hyRef.close(undefined, 'navigation');
  const scroll = (event: Event): void => { if (!container?.contains(event.target as Node)) hyRef.close(undefined, 'scroll'); };
  if (config.closeOnNavigation) view?.addEventListener('popstate', navigation);
  if (config.closeOnScroll) view?.addEventListener('scroll', scroll, true);
  const opened = (): void => { hyRef.opened.next(); container?.removeEventListener('animationend', onEnter); };
  const onEnter = (event: Event): void => { if (event.target === container) { clearTimeout(timer); opened(); } };
  container?.addEventListener('animationend', onEnter);
  const timer = setTimeout(opened, motion.reduced() ? 0 : 400);
  cdkRef.closed.subscribe(() => {
    clearTimeout(timer);
    container?.removeEventListener('animationend', onEnter);
    view?.removeEventListener('popstate', navigation);
    view?.removeEventListener('scroll', scroll, true);
  });
  return hyRef;
}
