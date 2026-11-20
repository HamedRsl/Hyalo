import { DialogRef } from '@angular/cdk/dialog';
import { InjectionToken } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';
import { MOTION } from '@hyalo/angular/motion';

/** Data passed to a dialog or drawer through `open(..., { data })`. */
export const HY_DIALOG_DATA = new InjectionToken<unknown>('HY_DIALOG_DATA');
export type HyDialogCloseReason = 'programmatic' | 'action' | 'escape' | 'backdrop' | 'gesture' | 'navigation' | 'scroll';
export interface HyDialogCloseAttempt<R = unknown> { readonly result: R | undefined; readonly reason: HyDialogCloseReason; }
export type HyDialogCloseGuard<R = unknown> = (attempt: HyDialogCloseAttempt<R>) => boolean | Promise<boolean>;

/**
 * Handle to an open dialog or drawer. Inject it in the content component to
 * close it, or keep the one `open()` returns.
 */
export class HyDialogRef<R = unknown> {
  private closing = false;
  private checking = false;
  private destroyed = false;
  private generation = 0;
  readonly beforeClosed = new Subject<HyDialogCloseAttempt<R>>();
  readonly closeVetoed = new Subject<HyDialogCloseAttempt<R>>();
  readonly guardError = new Subject<unknown>();
  readonly opened = new Subject<void>();
  readonly backdropClick: DialogRef<R>['backdropClick'];
  readonly keydownEvents: DialogRef<R>['keydownEvents'];

  /** Resolves with the result once the surface has closed. */
  readonly closed: Promise<R | undefined>;

  /**
   * @internal Set by surfaces that drive their own exit, like a sheet on a
   * spring. Calls `finish` once the surface is out of view.
   */
  exit: ((finish: () => void) => void) | null = null;

  /** @internal */
  constructor(private readonly cdkRef: DialogRef<R>, private readonly guard?: HyDialogCloseGuard<R>) {
    this.closed = firstValueFrom(cdkRef.closed, { defaultValue: undefined });
    this.backdropClick = cdkRef.backdropClick;
    this.keydownEvents = cdkRef.keydownEvents;
    cdkRef.closed.subscribe(() => { this.destroyed = true; this.generation++; this.beforeClosed.complete(); this.closeVetoed.complete(); this.guardError.complete(); this.opened.complete(); });
  }

  /** Id of the dialog container element. */
  get id(): string {
    return this.cdkRef.id;
  }

  /** The element with `role="dialog"`. */
  get containerElement(): HTMLElement | null {
    return this.cdkRef.overlayRef.overlayElement?.querySelector('.cdk-dialog-container') ?? null;
  }

  /**
   * Plays the exit animation, then closes. With reduced motion the exit is
   * a short fade. Calling it again while the animation runs does nothing.
   */
  close(result?: R, reason: HyDialogCloseReason = 'programmatic'): void {
    void this.requestClose(result, reason);
  }

  /** Every normal dismissal route passes through this guard. Guard errors keep the surface open. */
  requestClose(result?: R, reason: HyDialogCloseReason = 'programmatic'): Promise<boolean> {
    if (this.closing || this.checking || this.destroyed) return Promise.resolve(false);
    const attempt = { result, reason };
    const generation = ++this.generation;
    const finish = (allowed: boolean): boolean => {
      if (this.destroyed || generation !== this.generation) return false;
      this.checking = false;
      if (!allowed) { this.closeVetoed.next(attempt); return false; }
      this.beforeClosed.next(attempt);
      this.animateClose(result);
      return true;
    };
    const failed = (error: unknown): boolean => {
      if (!this.destroyed && generation === this.generation) { this.checking = false; this.guardError.next(error); this.closeVetoed.next(attempt); }
      return false;
    };
    try {
      const allowed = this.guard?.(attempt) ?? true;
      if (typeof allowed === 'boolean') return Promise.resolve(finish(allowed));
      this.checking = true;
      return allowed.then(finish, failed);
    } catch (error) { return Promise.resolve(failed(error)); }
  }

  updateSize(width?: string | number, height?: string | number): this { this.cdkRef.updateSize(width, height); return this; }
  updatePosition(): this { this.cdkRef.updatePosition(); return this; }
  addPanelClass(classes: string | string[]): this { this.cdkRef.addPanelClass(classes); return this; }
  removePanelClass(classes: string | string[]): this { this.cdkRef.removePanelClass(classes); return this; }

  private animateClose(result?: R): void {
    this.closing = true;
    if (this.exit) {
      this.exit(() => this.cdkRef.close(result));
      return;
    }
    const pane = this.cdkRef.overlayRef.overlayElement;
    const backdrop = this.cdkRef.overlayRef.backdropElement;
    // The animation runs on the panel inside the pane.
    const panel = this.containerElement;
    pane.dataset['state'] = 'closing';
    backdrop?.setAttribute('data-state', 'closing');
    // The timeout is a safety net in case animationend never fires.
    let done = false;
    const finish = (): void => {
      if (done) return;
      done = true;
      pane.removeEventListener('animationend', onEnd);
      this.cdkRef.close(result);
    };
    // Ignore animations that bubble up from the content, like a button ripple.
    const onEnd = (event: Event): void => {
      if (event.target === pane || event.target === panel) finish();
    };
    pane.addEventListener('animationend', onEnd);
    const timer = setTimeout(finish, MOTION.settle.duration * 1000 + 80);
    this.cdkRef.closed.subscribe(() => { clearTimeout(timer); pane.removeEventListener('animationend', onEnd); });
  }

  /**
   * @internal A sheet grabbed while it was closing stays open, and a later
   * `close()` works again.
   */
  cancelClose(): void {
    this.closing = false;
  }
}
