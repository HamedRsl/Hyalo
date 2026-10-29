import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { injectId, rubberband } from '@hyalo/angular';

/** Movement before a press on the track turns into a drag, in px. */
const SLOP = 4;
/** Track padding on each side, in px. Matches choice.css. */
const TRACK_PADDING = 2;
/** Width of the pressed thumb, in rem. Matches choice.css. */
const PRESSED_THUMB = 1.5;

/**
 * An on/off switch for settings that apply right away. For choices that
 * are submitted with a form, a checkbox is usually clearer.
 *
 * It is a native checkbox with `role="switch"`, so screen readers say
 * "on" and "off" and Space toggles it. The thumb can also be dragged: it
 * follows the pointer, and lands on whichever side it is let go nearer.
 *
 * ```html
 * <hy-switch [(checked)]="notifications">Email notifications</hy-switch>
 * ```
 */
@Component({
  selector: 'hy-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-choice hy-switch',
    '[attr.data-checked]': 'checked() || null',
    '[attr.data-disabled]': 'disabled() || null',
  },
  templateUrl: './switch.html',
  styleUrl: './choice.css',
})
export class HySwitch implements FormCheckboxControl {
  protected readonly descriptionId = injectId('switch-desc');
  /** Physical thumb offset in px while it is dragged, otherwise null. */
  protected readonly drag = signal<number | null>(null);
  private press: { x: number; from: number; travel: number; dir: number; pos: number } | null =
    null;
  /** Where a finished drag landed, until the click it causes is handled. */
  private landed: boolean | null = null;

  /** Whether the switch is on. Two-way bindable and works with `[formField]`. */
  readonly checked = model(false);
  /** Secondary text under the label. */
  readonly description = input<string>();
  readonly name = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** Emits when focus leaves the switch. */
  readonly touch = output<void>();

  protected onChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }

  protected onDown(event: PointerEvent): void {
    if (this.disabled() || event.button !== 0) return;
    const track = event.currentTarget as HTMLElement;
    const rem = parseFloat(getComputedStyle(track.ownerDocument.documentElement).fontSize) || 16;
    const travel = track.clientWidth - 2 * TRACK_PADDING - PRESSED_THUMB * rem;
    this.press = {
      x: event.clientX,
      from: this.checked() ? travel : 0,
      travel,
      dir: getComputedStyle(track).direction === 'rtl' ? -1 : 1,
      pos: this.checked() ? travel : 0,
    };
  }

  protected onMove(event: PointerEvent): void {
    const press = this.press;
    if (!press) return;
    const moved = (event.clientX - press.x) * press.dir;
    if (this.drag() === null) {
      if (Math.abs(moved) < SLOP) return;
      try {
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      } catch {
        // The pointer is already gone; the drag still ends on pointerup.
      }
    }
    // Past either end the thumb resists instead of stopping dead.
    const raw = press.from + moved;
    const over = raw < 0 ? raw : raw > press.travel ? raw - press.travel : 0;
    press.pos = Math.min(Math.max(raw, 0), press.travel) + rubberband(over, press.travel);
    this.drag.set(press.pos * press.dir);
  }

  protected onUp(cancelled = false): void {
    const press = this.press;
    this.press = null;
    if (!press || this.drag() === null) return;
    this.drag.set(null);
    // Decided in logical position, so it is the same in both directions.
    const on = press.pos > press.travel / 2;
    if (cancelled) {
      this.checked.set(on);
      return;
    }
    // The release also clicks the label. That click applies the drag
    // instead of toggling; if no click comes, apply it anyway.
    this.landed = on;
    setTimeout(() => {
      if (this.landed === null) return;
      this.checked.set(this.landed);
      this.landed = null;
    });
  }

  protected onClick(event: MouseEvent): void {
    if (this.landed === null) return;
    event.preventDefault();
    this.checked.set(this.landed);
    this.landed = null;
  }
}
