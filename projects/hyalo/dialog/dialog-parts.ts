import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { injectId } from '@hyalo/angular/core';

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
    afterNextRender(() => {
      const container = el.closest('[role="dialog"], [role="alertdialog"]');
      if (
        container &&
        !container.hasAttribute('aria-label') &&
        !container.hasAttribute('aria-labelledby')
      ) {
        container.setAttribute('aria-labelledby', this.id);
      }
    });
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
  host: { type: 'button', '(click)': 'ref?.close(hyDialogClose(), "action")' },
})
export class HyDialogClose {
  protected readonly ref = inject(HyDialogRef, { optional: true });
  /** The result to close with. A bare attribute closes with `undefined`. */
  readonly hyDialogClose = input<unknown, unknown>(undefined, {
    transform: (value) => (value === '' ? undefined : value),
  });
}

/** Opt-in drag handle for a dialog window. Arrow keys move it in 16px steps. */
@Directive({
  selector: 'button[hyDialogDragHandle]',
  host: {
    type: 'button',
    class: 'hy-dialog__drag-handle',
    '(pointerdown)': 'start($event)',
    '(pointermove)': 'move($event)',
    '(pointerup)': 'stop($event)',
    '(pointercancel)': 'stop($event)',
    '(lostpointercapture)': 'stop($event)',
    '(keydown)': 'keys($event)',
  },
})
export class HyDialogDragHandle {
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
  private readonly ref = inject(HyDialogRef, { optional: true });
  private pointer: { id: number; x: number; y: number } | undefined;

  protected start(event: PointerEvent): void {
    if (!this.ref || this.ref.maximized() || event.button !== 0 || !event.isPrimary) return;
    this.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    this.element.setPointerCapture(event.pointerId);
  }

  protected move(event: PointerEvent): void {
    const pointer = this.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    this.ref?.moveBy(event.clientX - pointer.x, event.clientY - pointer.y);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  protected stop(event: PointerEvent): void {
    if (this.pointer?.id === event.pointerId) this.pointer = undefined;
  }

  protected keys(event: KeyboardEvent): void {
    if (!this.ref || this.ref.maximized() || event.altKey || event.ctrlKey || event.metaKey) return;
    const step = event.shiftKey ? 48 : 16;
    const offsets: Readonly<Record<string, readonly [number, number]>> = {
      ArrowDown: [0, step],
      ArrowUp: [0, -step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
    };
    const offset = offsets[event.key];
    if (event.key === 'Home') this.ref.resetPosition();
    else if (offset) this.ref.moveBy(...offset);
    else return;
    event.preventDefault();
  }
}

/** Everything needed to lay out dialog or drawer content. */
export const HY_DIALOG_PARTS = [
  HyDialogTitle,
  HyDialogContent,
  HyDialogActions,
  HyDialogClose,
  HyDialogDragHandle,
] as const;
