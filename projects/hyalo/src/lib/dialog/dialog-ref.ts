import { DialogRef } from '@angular/cdk/dialog';
import { InjectionToken } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MOTION } from '../motion/motion';

/** Data passed to a dialog or drawer through `open(..., { data })`. */
export const HY_DIALOG_DATA = new InjectionToken<unknown>('HY_DIALOG_DATA');

/**
 * Handle to an open dialog or drawer. Inject it in the content component to
 * close it, or keep the one `open()` returns.
 */
export class HyDialogRef<R = unknown> {
  private closing = false;

  /** Resolves with the result once the surface has closed. */
  readonly closed: Promise<R | undefined>;

  /** @internal */
  constructor(
    private readonly cdkRef: DialogRef<R>,
    private readonly reducedMotion: () => boolean,
  ) {
    this.closed = firstValueFrom(cdkRef.closed, { defaultValue: undefined });
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
   * Plays the exit animation, then closes. Calling it again while the
   * animation runs does nothing.
   */
  close(result?: R): void {
    if (this.closing) return;
    this.closing = true;
    const pane = this.cdkRef.overlayRef.overlayElement;
    const backdrop = this.cdkRef.overlayRef.backdropElement;
    if (this.reducedMotion()) {
      this.cdkRef.close(result);
      return;
    }
    // Drawers animate the pane, dialogs the panel inside it.
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
    setTimeout(finish, MOTION.settle.duration * 1000 + 80);
  }
}
