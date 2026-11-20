import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

@Component({
  selector: 'hy-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './slider.html',
  styleUrl: './slider.css',
})
export class HySlider extends HyValueControl implements FormValueControl<number> {
  readonly value = model(0);
  readonly min = input<number | undefined>(0);
  readonly max = input<number | undefined>(100);
  readonly step = input(1);
  /** Monotone mapping between value units and normalized native positions (0..1). */
  readonly scale = input<{ toPosition(value: number): number; fromPosition(position: number): number }>();
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly reversed = input(false);
  readonly ticks = input<readonly number[]>([]);
  readonly marks = input<readonly { value: number; label: string }[]>([]);
  readonly valueFormatter = input<(value: number) => string>(String);
  readonly showValue = input(true);
  readonly dragStarted = output<number>();
  readonly dragEnded = output<number>();
  private dragging = false;
  protected startDrag(event: PointerEvent): void {
    if (this.blocked() || this.dragging) return;
    this.dragging = true;
    (event.target as HTMLInputElement).setPointerCapture?.(event.pointerId);
    this.dragStarted.emit(this.value());
  }
  protected endDrag(): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.dragEnded.emit(this.value());
  }
  readonly committed = output<number>();
  protected position(value: number): number { return this.scale()?.toPosition(value) ?? value; }
  protected commit(): void { if (!this.blocked()) this.committed.emit(this.value()); }
  protected change(event: Event): void {
    if (this.blocked()) return;
    const position = Number((event.target as HTMLInputElement).value);
    const value = this.scale()?.fromPosition(position) ?? position;
    if (Number.isFinite(value)) this.value.set(Math.max(this.min() ?? 0, Math.min(this.max() ?? 100, value)));
  }
}
