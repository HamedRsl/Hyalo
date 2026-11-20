import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
import { HyIcon } from '@hyalo/angular/icon';
import { HyDragController, HyMotion, HY_GESTURE_CONFIG } from '@hyalo/angular/motion';

@Component({
  selector: 'hy-slide-confirm',
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slide-confirm.html',
  styleUrl: './slide-confirm.css',
  host: { '(focusout)': 'leave($event)' },
})
export class HySlideConfirm extends HyValueControl implements FormValueControl<boolean> {
  private readonly motion = inject(HyMotion);
  private readonly gestures = inject(HY_GESTURE_CONFIG);
  private readonly destroy = inject(DestroyRef);
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly handle = viewChild.required<ElementRef<HTMLButtonElement>>('handle');
  readonly value = model(false);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly threshold = input(0.9);
  readonly confirmLabel = input('Confirm');
  readonly completedLabel = input('Confirmed');
  readonly loadingLabel = input('Confirming');
  readonly confirmed = output<void>();
  private drag?: HyDragController;
  private width = 0;
  private sign = 1;
  constructor() {
    super();
    afterNextRender(() => {
      const track = this.track().nativeElement,
        handle = this.handle().nativeElement;
      this.drag = new HyDragController(track, {
        axis: 'x',
        slop: this.gestures.slop,
        sign: () => this.sign,
        motion: () => this.motion.enabled(),
        enabled: () => !this.blocked() && !this.loading() && !this.value(),
        limits: () => [0, this.width],
        canStart: (event) => {
          this.measure();
          this.sign = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
          return this.width > 0 && handle.contains(event.target as Node);
        },
        paint: (value) => {
          handle.style.translate = Math.min(this.width, Math.max(0, value)) * this.sign + 'px 0';
        },
        ended: (event) => {
          const threshold = Number.isFinite(this.threshold())
            ? Math.max(0.5, Math.min(1, this.threshold()))
            : 0.9;
          if (!event.cancelled && event.value >= this.width * threshold) this.confirm();
          else this.drag?.settle(0, event.velocity);
        },
      });
      this.measure();
      if (this.value()) this.drag.spring.set(this.width);
      const observer =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(() => {
              this.measure();
              this.drag?.spring.set(this.value() ? this.width : 0);
            });
      observer?.observe(track);
      this.destroy.onDestroy(() => {
        observer?.disconnect();
        this.drag?.destroy();
      });
    });
    afterRenderEffect(() => {
      if (!this.value()) this.drag?.settle(0);
    });
  }
  private measure(): void {
    this.width = Math.max(
      0,
      this.track().nativeElement.clientWidth - this.handle().nativeElement.offsetWidth - 12,
    );
    this.sign = getComputedStyle(this.track().nativeElement).direction === 'rtl' ? -1 : 1;
  }
  confirm(): void {
    if (this.blocked() || this.loading() || this.value()) return;
    this.measure();
    this.width = Math.max(
      0,
      this.track().nativeElement.clientWidth - this.handle().nativeElement.offsetWidth,
    );
    this.sign = getComputedStyle(this.track().nativeElement).direction === 'rtl' ? -1 : 1;
    this.value.set(true);
    this.touch.emit();
    this.confirmed.emit();
    this.drag?.settle(this.width);
  }
  reset(): void {
    this.value.set(false);
    this.drag?.settle(0);
  }
}
