import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { HyButton } from '@hyalo/angular/button';
import type { HyAction } from '@hyalo/angular/core';
import { HyDragController, HyMotion, HY_GESTURE_CONFIG } from '@hyalo/angular/motion';

export interface HySwipeActionEvent {
  readonly action: HyAction;
  readonly side: 'start' | 'end';
}
@Component({
  selector: 'hy-swipe-actions',
  imports: [HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './swipe-actions.html',
  styleUrl: './swipe-actions.css',
  host: { '[style.--hy-swipe-action-width]': 'safeActionWidth() + "px"' },
})
export class HySwipeActions {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly surface = viewChild.required<ElementRef<HTMLElement>>('surface');
  private readonly motion = inject(HyMotion);
  private readonly config = inject(HY_GESTURE_CONFIG);
  readonly label = input.required<string>();
  readonly startActions = input<readonly HyAction[]>([]);
  readonly endActions = input<readonly HyAction[]>([]);
  readonly open = model<'start' | 'end' | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly autoClose = input(true, { transform: booleanAttribute });
  readonly fullSwipe = input(false, { transform: booleanAttribute });
  readonly actionsLabel = input('Actions');
  readonly closeLabel = input('Close actions');
  readonly actionWidth = input(88);
  readonly closeOnSelect = input(true, { transform: booleanAttribute });
  readonly fullSwipeThreshold = input(1.5);
  readonly sliding = output<{ readonly amount: number; readonly ratio: number }>();
  private amount = 0;
  readonly selected = output<HySwipeActionEvent>();
  private drag?: HyDragController;
  private sign = 1;
  protected safeActionWidth(): number {
    return Math.max(44, Number.isFinite(this.actionWidth()) ? this.actionWidth() : 88);
  }
  private width(side: 'start' | 'end'): number {
    return (
      this.safeActionWidth() *
      (side === 'start' ? this.startActions().length : this.endActions().length)
    );
  }
  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      this.drag = new HyDragController(this.surface().nativeElement, {
        axis: 'x',
        sign: () => this.sign,
        slop: this.config.slop,
        motion: () => this.motion.enabled(),
        enabled: () => !this.disabled(),
        canStart: (event) => {
          this.sign = getComputedStyle(this.element).direction === 'rtl' ? -1 : 1;
          return !(event.target as Element).closest(
            'button,input,textarea,select,a,[contenteditable]',
          );
        },
        limits: () => [-this.width('end'), this.width('start')],
        paint: (value) => {
          this.amount = value;
          this.sliding.emit({ amount: this.getOpenAmount(), ratio: this.getSlidingRatio() });
          this.surface().nativeElement.style.translate = value * this.sign + 'px 0';
          this.element.dataset['reveal'] = value > 0 ? 'start' : value < 0 ? 'end' : '';
        },
        ended: (event) => {
          if (event.cancelled) {
            this.settle();
            return;
          }
          const side = event.projected > 0 ? 'start' : 'end',
            width = this.width(side);
          if (width === 0) {
            this.close();
            return;
          }
          const threshold = Number.isFinite(this.fullSwipeThreshold())
            ? Math.max(1, this.fullSwipeThreshold())
            : 1.5;
          if (this.fullSwipe() && Math.abs(event.value) > width * threshold) {
            const action = (side === 'start' ? this.startActions() : this.endActions()).find(
              (item) => !item.disabled,
            );
            if (action) this.choose(action, side);
            else this.close();
          } else {
            this.open.set(Math.abs(event.projected) > width / 2 ? side : null);
            this.settle();
          }
        },
      });
      this.sign = getComputedStyle(this.element).direction === 'rtl' ? -1 : 1;
      this.settle();
      destroy.onDestroy(() => this.drag?.destroy());
    });
    afterRenderEffect(() => {
      this.open();
      this.startActions();
      this.endActions();
      const side = this.open();
      if (this.disabled() || (side && !this.width(side))) this.open.set(null);
      this.settle();
    });
    effect((cleanup) => {
      if (!this.open() || !this.autoClose()) return;
      const outside = (event: PointerEvent): void => {
        if (!this.element.contains(event.target as Node)) this.close();
      };
      this.document.addEventListener('pointerdown', outside);
      cleanup(() => this.document.removeEventListener('pointerdown', outside));
    });
  }
  private settle(): void {
    this.sign = getComputedStyle(this.element).direction === 'rtl' ? -1 : 1;
    this.sign = getComputedStyle(this.element).direction === 'rtl' ? -1 : 1;
    const side = this.disabled() ? null : this.open();
    this.drag?.settle(
      side === 'start' ? this.width('start') : side === 'end' ? -this.width('end') : 0,
    );
  }
  reveal(side: 'start' | 'end'): boolean {
    if (this.disabled() || !this.width(side)) return false;
    this.open.set(side);
    this.settle();
    return true;
  }
  getOpenAmount(): number {
    return this.amount * this.sign;
  }
  getSlidingRatio(): number {
    const width = this.width(this.amount >= 0 ? 'start' : 'end');
    return width ? this.amount / width : 0;
  }
  close(): void {
    if (this.element.querySelector('.action-side:focus-within'))
      this.element.querySelector<HTMLElement>('.toggle')?.focus();
    this.open.set(null);
    this.settle();
  }
  protected toggle(): void {
    if (!this.disabled()) {
      this.open.set(
        this.open()
          ? null
          : this.endActions().length
            ? 'end'
            : this.startActions().length
              ? 'start'
              : null,
      );
      this.settle();
    }
  }
  protected choose(action: HyAction, side: 'start' | 'end'): void {
    if (this.disabled() || action.disabled) return;
    this.selected.emit({ action, side });
    if (this.closeOnSelect()) this.close();
    this.element.querySelector<HTMLElement>('.toggle')?.focus();
  }
}
