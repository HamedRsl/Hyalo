import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
} from '@angular/core';
import { HyIcon } from '../icon/icon';
import { HyFidelity } from '../fidelity/fidelity';
import { HyToaster, type HyToastItem } from './toaster';

const SWIPE_DISTANCE = 80;

/** @internal The visible stack of toasts. Created by HyToaster. */
@Component({
  selector: 'hy-toast-stack',
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-toast-stack',
    role: 'region',
    'aria-label': 'Notifications',
    '(pointerenter)': "toaster.pause('hover')",
    '(pointerleave)': "toaster.resume('hover')",
    '(focusin)': "toaster.pause('focus')",
    '(focusout)': 'onFocusOut($event)',
  },
  template: `
    <ol class="hy-toast-list">
      @for (toast of toaster.items(); track toast.id) {
        <li
          class="hy-toast hy-glass"
          [attr.data-material]="material()"
          [attr.data-tone]="toast.tone"
          [attr.data-leaving]="toast.leaving || null"
          (pointerdown)="onDown($event)"
          (pointermove)="onMove($event)"
          (pointerup)="onUp($event, toast)"
          (pointercancel)="onCancel($event)"
        >
          @if (toast.tone !== 'neutral') {
            <hy-icon class="hy-toast__icon" [name]="toast.tone" />
          }
          <div class="hy-toast__text">
            @if (toast.title) {
              <p class="hy-toast__title">{{ toast.title }}</p>
            }
            <p class="hy-toast__message">{{ toast.message }}</p>
          </div>
          @if (toast.action; as action) {
            <button
              type="button"
              class="hy-toast__action"
              (click)="action.run(); toaster.dismiss(toast.id)"
            >
              {{ action.label }}
            </button>
          }
          <button
            type="button"
            class="hy-toast__close"
            aria-label="Dismiss"
            (click)="toaster.dismiss(toast.id)"
          >
            <hy-icon name="x" />
          </button>
        </li>
      }
    </ol>
  `,
})
export class HyToastStack {
  protected readonly toaster = inject(HyToaster);
  private readonly fidelity = inject(HyFidelity);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private startX = 0;
  private dragging = false;

  protected readonly material = computed(() =>
    this.fidelity.tier() === 'low' ? 'solid' : 'frosted',
  );

  constructor() {
    // Removing the focused toast drops focus without a reliable focusout.
    afterRenderEffect(() => {
      this.toaster.items();
      if (!this.host.contains(this.host.ownerDocument.activeElement)) {
        this.toaster.resume('focus');
      }
    });
  }

  protected onFocusOut(event: FocusEvent): void {
    // Moving between buttons inside the stack keeps the timers paused.
    if (!this.host.contains(event.relatedTarget as Node | null)) this.toaster.resume('focus');
  }

  protected onDown(event: PointerEvent): void {
    if ((event.target as Element).closest('button')) return;
    this.dragging = true;
    this.startX = event.clientX;
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  protected onMove(event: PointerEvent): void {
    if (!this.dragging) return;
    const el = event.currentTarget as HTMLElement;
    const dx = event.clientX - this.startX;
    el.style.translate = `${dx}px 0`;
    el.style.opacity = String(Math.max(0.2, 1 - Math.abs(dx) / (SWIPE_DISTANCE * 2.5)));
  }

  protected onUp(event: PointerEvent, toast: HyToastItem): void {
    if (!this.dragging) return;
    this.dragging = false;
    const dx = event.clientX - this.startX;
    if (Math.abs(dx) >= SWIPE_DISTANCE) {
      // Inline styles beat [data-leaving], so carry on from the drag instead.
      const el = event.currentTarget as HTMLElement;
      el.style.translate = `${dx + Math.sign(dx) * SWIPE_DISTANCE}px 0`;
      el.style.opacity = '';
      this.toaster.dismiss(toast.id);
    } else {
      this.onCancel(event);
    }
  }

  protected onCancel(event: PointerEvent): void {
    this.dragging = false;
    const el = event.currentTarget as HTMLElement;
    el.style.translate = '';
    el.style.opacity = '';
  }
}
