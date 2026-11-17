import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { HyDragController, HyMotion, HY_GESTURE_CONFIG } from '@hyalo/angular/motion';
import { HyButton } from '@hyalo/angular/button';

export interface HySwipeContext<T> {
  readonly $implicit: T;
  readonly index: number;
}
export interface HySwipeDecision<T> {
  readonly item: T;
  readonly index: number;
  readonly direction: 'start' | 'end';
}
@Directive({ selector: 'ng-template[hySwipeItem]' })
export class HySwipeItem<T> {
  readonly hySwipeItem = input.required<HySwipeDeck<T>>();
  readonly template = inject<TemplateRef<HySwipeContext<T>>>(TemplateRef);
  static ngTemplateContextGuard<T>(
    _directive: HySwipeItem<T>,
    context: unknown,
  ): context is HySwipeContext<T> {
    return typeof context === 'object' && context !== null && '$implicit' in context;
  }
}
@Component({
  selector: 'hy-swipe-deck',
  imports: [NgTemplateOutlet, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './swipe-deck.html',
  styleUrl: './swipe-deck.css',
})
export class HySwipeDeck<T> {
  private readonly motion = inject(HyMotion);
  private readonly config = inject(HY_GESTURE_CONFIG);
  private readonly surface = viewChild<ElementRef<HTMLElement>>('surface');
  protected readonly template = contentChild.required<HySwipeItem<T>>(HySwipeItem);
  readonly items = input.required<readonly T[]>();
  readonly itemKey = input.required<(item: T) => string | number>();
  readonly index = model(0);
  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly threshold = input(this.config.swipeThreshold);
  readonly startLabel = input('Pass');
  readonly endLabel = input('Keep');
  readonly undoLabel = input('Undo');
  readonly emptyLabel = input('No more cards');
  readonly decided = output<HySwipeDecision<T>>();
  readonly allowUndo = input(true, { transform: booleanAttribute });
  readonly undone = output<{ readonly item: T; readonly index: number }>();
  readonly finished = output<void>();
  readonly busy = signal(false);
  private generation = 0;
  protected readonly announcement = signal('');
  protected readonly position = computed(() =>
    Number.isFinite(this.index())
      ? Math.max(0, Math.min(this.items().length, Math.trunc(this.index())))
      : 0,
  );
  protected readonly current = computed(() => this.items()[this.position()]);
  private drag?: HyDragController;
  private sign = 1;
  constructor() {
    const destroy = inject(DestroyRef);
    afterRenderEffect(() => {
      const element = this.surface()?.nativeElement;
      this.items();
      this.index();
      this.generation++;
      this.busy.set(false);
      this.drag?.destroy();
      this.drag = undefined;
      if (!element) return;
      this.sign = getComputedStyle(element).direction === 'rtl' ? -1 : 1;
      element.style.transform = '';
      this.drag = new HyDragController(element, {
        axis: 'x',
        sign: () => this.sign,
        slop: this.config.slop,
        motion: () => this.motion.enabled(),
        enabled: () => !this.disabled() && !this.busy(),
        canStart: (event) =>
          !(event.target as Element).closest('button,a,input,select,textarea,[contenteditable]'),
        paint: (value) => {
          element.style.transform =
            'translateX(' +
            value * this.sign +
            'px) rotate(' +
            (this.motion.enabled() ? Math.max(-12, Math.min(12, value / 20)) * this.sign : 0) +
            'deg)';
        },
        ended: (event) => {
          const threshold = Number.isFinite(this.threshold()) ? Math.max(24, this.threshold()) : 80;
          if (!event.cancelled && Math.abs(event.projected) > threshold)
            this.choose(event.projected < 0 ? 'start' : 'end', true, event.velocity);
          else this.drag?.settle(0, event.velocity);
        },
      });
    });
    destroy.onDestroy(() => this.drag?.destroy());
  }
  protected choose(direction: 'start' | 'end', animate = false, velocity = 0): void {
    if (this.disabled() || this.busy()) return;
    const item = this.current(),
      index = this.position();
    if (item === undefined) return;
    const key = this.itemKey()(item);
    const generation = this.generation;
    this.busy.set(true);
    const finish = (): void => {
      if (generation !== this.generation) return;
      this.busy.set(false);
      if (
        this.disabled() ||
        this.position() !== index ||
        this.current() === undefined ||
        this.itemKey()(this.current() as T) !== key
      ) {
        this.drag?.settle(0);
        return;
      }
      this.decided.emit({ item, index, direction });
      this.index.set(index + 1);
      if (index + 1 >= this.items().length) this.finished.emit();
      this.announcement.set(direction === 'start' ? this.startLabel() : this.endLabel());
    };
    if (animate && this.drag)
      this.drag.settle(
        (direction === 'start' ? -1 : 1) * (this.surface()?.nativeElement.clientWidth ?? 300) * 1.5,
        velocity,
        finish,
      );
    else finish();
  }
  swipe(direction: 'start' | 'end'): void {
    this.choose(direction, true);
  }
  undo(): void {
    if (this.disabled() || this.busy() || !this.allowUndo() || this.position() <= 0) return;
    const index = this.position() - 1;
    const item = this.items()[index];
    if (item === undefined) return;
    this.index.set(index);
    this.undone.emit({ item, index });
  }
  reset(): void {
    this.generation++;
    this.drag?.cancel();
    this.drag?.settle(0);
    this.busy.set(false);
    this.index.set(0);
  }
}
export const HY_SWIPE_DECK = [HySwipeDeck, HySwipeItem] as const;
