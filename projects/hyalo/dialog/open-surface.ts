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
import { HySurfaceFocusContainer } from './focus-container';

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
  /** Move focus to the configured target on attachment or after the entry transition. */
  readonly autoFocusTiming?: 'attach' | 'opened';
  /** `alertdialog` for messages that need an answer. */
  readonly role?: 'dialog' | 'alertdialog';
  readonly closeGuard?: HyDialogCloseGuard;
  readonly closeOnEscape?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly hasBackdrop?: boolean;
  readonly panelClass?: string | readonly string[];
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
  readonly bindings?: DialogConfig['bindings'];
  /** Restore to the opener, a selector, or a specific element. Set false to leave it to the caller. */
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
    draggable?: boolean;
  },
): HyDialogRef<R> {
  let ref: HyDialogRef<R> | undefined;
  const dismissible = config.dismissible ?? true;
  const autoFocus = config.autoFocus ?? 'first-tabbable';
  const deferAutoFocus = config.autoFocusTiming === 'opened' && autoFocus !== false && autoFocus !== 'dialog';

  const cdkRef = cdk.open<R, D, unknown>(content, {
    data: config.data,
    role: config.role ?? 'dialog',
    ariaLabel: config.label ?? null,
    autoFocus: deferAutoFocus ? 'dialog' : autoFocus,
    container: deferAutoFocus ? HySurfaceFocusContainer : undefined,
    restoreFocus: config.restoreFocus ?? true,
    ariaModal: config.ariaModal ?? true,
    ariaLabelledBy: config.ariaLabelledBy,
    ariaDescribedBy: config.ariaDescribedBy,
    id: config.id,
    injector: config.injector,
    viewContainerRef: config.viewContainerRef,
    templateContext: config.templateContext,
    bindings: config.bindings,
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
  const springDriven = !!container && !!extra.sheet && extra.draggable !== false && !motion.reduced();
  const opened = (): void => hyRef.notifyOpened();
  if (cdkRef.containerInstance instanceof HySurfaceFocusContainer) {
    const focusContainer = cdkRef.containerInstance;
    hyRef.opened.subscribe(() => focusContainer.focusAfterEnter(autoFocus));
  }
  if (container) {
    container.classList.add('hy-glass');
    container.dataset['material'] =
      fidelity.tier() === 'low' ? 'solid' : (config.material ?? 'frosted');
    // Dialogs and sheets are the largest glass on the page, so the thickest.
    container.dataset['thickness'] = 'thick';
    // With reduced motion the CSS cross-fade runs instead of the spring.
    if (extra.sheet && springDriven) {
      const driver = driveSheet(container, cdkRef.overlayRef.backdropElement, extra.sheet, {
        dismissible,
        opened,
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
  const scroll = (event: Event): void => {
    const target = event.target;
    const NodeType = container?.ownerDocument.defaultView?.Node;
    if (!NodeType || !(target instanceof NodeType) || !container?.contains(target)) {
      hyRef.close(undefined, 'scroll');
    }
  };
  if (config.closeOnNavigation) view?.addEventListener('popstate', navigation);
  if (config.closeOnScroll) view?.addEventListener('scroll', scroll, true);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const onEnter = (event: Event): void => {
    if (event.target === container) {
      clearTimeout(timer);
      container?.removeEventListener('animationend', onEnter);
      opened();
    }
  };
  if (!springDriven || container?.ownerDocument.hidden) {
    container?.addEventListener('animationend', onEnter);
    timer = setTimeout(() => {
      container?.removeEventListener('animationend', onEnter);
      opened();
    }, motion.reduced() || container?.ownerDocument.hidden ? 0 : 400);
  }
  cdkRef.closed.subscribe(() => {
    clearTimeout(timer);
    container?.removeEventListener('animationend', onEnter);
    view?.removeEventListener('popstate', navigation);
    view?.removeEventListener('scroll', scroll, true);
  });
  return hyRef;
}
