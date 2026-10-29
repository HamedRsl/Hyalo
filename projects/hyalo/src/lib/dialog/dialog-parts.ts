import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { injectId } from '../core/ids';
import { HyDialogRef } from './dialog-ref';

/**
 * The dialog or drawer heading. Its id becomes the container's
 * `aria-labelledby`, so screen readers announce it on open.
 */
@Directive({
  selector: '[hyDialogTitle]',
  host: { class: 'hy-dialog__title', '[id]': 'id' },
})
export class HyDialogTitle {
  protected readonly id = injectId('dialog-title');

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() =>
      el.closest('[role="dialog"], [role="alertdialog"]')?.setAttribute('aria-labelledby', this.id),
    );
  }
}

/** The scrollable body. */
@Directive({ selector: '[hyDialogContent]', host: { class: 'hy-dialog__content' } })
export class HyDialogContent {}

/** The button row at the bottom. Primary action goes last. */
@Directive({ selector: '[hyDialogActions]', host: { class: 'hy-dialog__actions' } })
export class HyDialogActions {}

/** Closes the surrounding dialog or drawer with an optional result. */
@Directive({
  selector: 'button[hyDialogClose]',
  host: { type: 'button', '(click)': 'ref?.close(hyDialogClose())' },
})
export class HyDialogClose {
  protected readonly ref = inject(HyDialogRef, { optional: true });
  /** The result to close with. A bare attribute closes with `undefined`. */
  readonly hyDialogClose = input<unknown, unknown>(undefined, {
    transform: (value) => (value === '' ? undefined : value),
  });
}

/** Everything needed to lay out dialog or drawer content. */
export const HY_DIALOG_PARTS = [
  HyDialogTitle,
  HyDialogContent,
  HyDialogActions,
  HyDialogClose,
] as const;
