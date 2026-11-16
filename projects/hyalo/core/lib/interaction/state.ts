import { Directive, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';

/**
 * Mirrors interaction state to data attributes so glass effects can stay in
 * CSS: `data-hover`, `data-press` and `data-focus-visible`.
 *
 * Hover is only reported for mouse and pen, so touch screens never get a
 * stuck hover state.
 */
@Directive({
  selector: '[hyInteractive]',
  host: {
    '[attr.data-hover]': 'hovered() || null',
    '[attr.data-press]': 'pressed() || null',
    '[attr.data-focus-visible]': 'focusVisible() || null',
    '(pointerenter)': 'onEnter($event)',
    '(pointerleave)': 'hovered.set(false); pressed.set(false)',
    '(pointerdown)': 'pressed.set(true)',
    '(pointerup)': 'pressed.set(false)',
    '(pointercancel)': 'pressed.set(false)',
  },
})
export class HyInteractive {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly focusMonitor = inject(FocusMonitor);

  protected readonly hovered = signal(false);
  protected readonly pressed = signal(false);
  protected readonly focusVisible = signal(false);

  constructor() {
    afterNextRender(() => {
      this.focusMonitor.monitor(this.host).subscribe((origin) => {
        this.focusVisible.set(origin === 'keyboard');
      });
    });
    inject(DestroyRef).onDestroy(() => this.focusMonitor.stopMonitoring(this.host));
  }

  protected onEnter(event: PointerEvent): void {
    if (event.pointerType !== 'touch') this.hovered.set(true);
  }
}
