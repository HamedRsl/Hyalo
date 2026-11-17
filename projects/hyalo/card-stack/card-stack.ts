import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  TemplateRef,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { HyMotion, MOTION, injectHyVisibility } from '@hyalo/angular/motion';
import { HyButton } from '@hyalo/angular/button';
import { contentChild } from '@angular/core';

export interface HyStackContext<T> {
  readonly $implicit: T;
  readonly index: number;
  readonly active: boolean;
}
@Directive({ selector: 'ng-template[hyStackItem]' })
export class HyStackItem<T> {
  readonly hyStackItem = input.required<HyCardStack<T>>();
  readonly template = inject<TemplateRef<HyStackContext<T>>>(TemplateRef);
  static ngTemplateContextGuard<T>(
    _directive: HyStackItem<T>,
    context: unknown,
  ): context is HyStackContext<T> {
    return typeof context === 'object' && context !== null && '$implicit' in context;
  }
}
@Component({
  selector: 'hy-card-stack',
  imports: [NgTemplateOutlet, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-stack.html',
  styleUrl: './card-stack.css',
})
export class HyCardStack<T> {
  private readonly motion = inject(HyMotion);
  protected readonly template = contentChild.required<HyStackItem<T>>(HyStackItem);
  readonly items = input.required<readonly T[]>();
  readonly itemKey = input.required<(item: T) => string | number>();
  readonly activeIndex = model(0);
  readonly label = input.required<string>();
  readonly visibleCount = input(3);
  readonly spread = input(12);
  readonly loop = input(false);
  readonly perspective = input('60rem');
  readonly disabled = input(false);
  readonly previousLabel = input('Previous card');
  readonly nextLabel = input('Next card');
  readonly selected = output<T>();
  protected readonly current = computed(() =>
    Math.min(
      Math.max(0, this.items().length - 1),
      Math.max(0, Math.trunc(this.activeIndex()) || 0),
    ),
  );
  protected readonly cards = computed(() => {
    const count = Number.isFinite(this.visibleCount())
      ? Math.min(5, Math.max(1, Math.trunc(this.visibleCount())))
      : 3;
    const spread = Number.isFinite(this.spread()) ? Math.min(40, Math.max(0, this.spread())) : 12;
    const items = this.items();
    const ordered = this.loop()
      ? [...items.slice(this.current()), ...items.slice(0, this.current())]
      : items.slice(this.current());
    const visible = ordered.slice(0, count);
    return visible
      .map((item, depth) => ({
        key: this.itemKey()(item),
        identity: typeof this.itemKey()(item) + ':' + this.itemKey()(item),
        context: {
          $implicit: item,
          index: (this.current() + depth) % this.items().length,
          active: depth === 0,
        },
        depth,
        transform: this.motion.enabled()
          ? 'translate3d(0,' +
            depth * spread +
            'px,' +
            -depth * 32 +
            'px) rotateX(' +
            depth * 2 +
            'deg)'
          : 'none',
      }))
      .reverse();
  });
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly visible = injectHyVisibility();
  private previousIndex?: number;
  private travelDirection = 0;
  private previousCards = new Map<
    string,
    { node: HTMLElement; transform: string; depth: number; height: number }
  >();
  private readonly animations = new Map<HTMLElement, Animation>();
  private readonly exitCards = new Set<HTMLElement>();
  constructor() {
    const stop = (): void => {
      this.animations.forEach((animation) => animation.cancel());
      this.animations.clear();
      this.exitCards.forEach((node) => node.remove());
      this.exitCards.clear();
    };
    afterRenderEffect(() => {
      const index = this.current(),
        cards = this.cards();
      const canAnimate = this.motion.enabled() && this.visible();
      const previous = this.previousCards;
      const from = new Map(
        [...previous].map(([key, card]) => [
          key,
          this.animations.has(card.node) && card.node.isConnected
            ? getComputedStyle(card.node).transform
            : card.transform,
        ]),
      );
      stop();
      const frame = this.element.querySelector<HTMLElement>('.cards');
      if (!frame) return;
      const nodes = new Map(
        [...frame.querySelectorAll<HTMLElement>('.card')].map((node) => [
          node.dataset['stackKey'] ?? '',
          node,
        ]),
      );
      const changed = this.previousIndex !== undefined && index !== this.previousIndex;
      const direction =
        this.travelDirection ||
        (this.previousIndex === undefined || index >= this.previousIndex ? 1 : -1);
      this.travelDirection = 0;
      const rtl = getComputedStyle(frame).direction === 'rtl' ? -1 : 1;
      const run = (node: HTMLElement, frames: Keyframe[], remove = false): void => {
        if (typeof node.animate !== 'function') {
          if (remove) node.remove();
          return;
        }
        const animation = node.animate(frames, {
          duration: MOTION.settle.duration * 1000,
          easing: MOTION.settle.css,
        });
        this.animations.set(node, animation);
        const finish = (): void => {
          if (this.animations.get(node) === animation) this.animations.delete(node);
          if (remove) {
            node.remove();
            this.exitCards.delete(node);
          }
        };
        void animation.finished.then(finish, finish);
      };
      if (changed && canAnimate) {
        for (const card of cards) {
          const key = typeof card.key + ':' + card.key,
            node = nodes.get(key);
          if (!node) continue;
          const before = previous.get(key),
            origin =
              from.get(key) ??
              'translate3d(' +
                -direction * rtl * 35 +
                '%, 0, -96px) rotateZ(' +
                -direction * rtl * 8 +
                'deg)';
          if (before?.depth === 0 && card.depth > 0) {
            run(node, [
              { transform: origin, zIndex: 6 },
              {
                transform:
                  'translate3d(' +
                  -direction * rtl * 35 +
                  '%, -12px, 24px) rotateZ(' +
                  -direction * rtl * 8 +
                  'deg)',
                zIndex: 6,
                offset: 0.45,
              },
              { transform: card.transform, zIndex: 5 - card.depth },
            ]);
          } else {
            run(node, [{ transform: origin }, { transform: card.transform }]);
          }
        }
        for (const [key, old] of previous) {
          if (old.depth !== 0 || nodes.has(key)) continue;
          // The outgoing card must survive one transition after Angular removes its keyed view.
          const clone = old.node.cloneNode(true) as HTMLElement;
          clone.inert = true;
          clone.setAttribute('aria-hidden', 'true');
          clone.removeAttribute('id');
          clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
          clone.style.position = 'absolute';
          clone.style.inset = '0';
          clone.style.blockSize = old.height + 'px';
          clone.dataset['stackExit'] = '';
          frame.append(clone);
          this.exitCards.add(clone);
          run(
            clone,
            [
              { transform: from.get(key) ?? old.transform, zIndex: 6, opacity: 1 },
              {
                transform:
                  'translate3d(' +
                  -direction * rtl * 35 +
                  '%, -12px, 24px) rotateZ(' +
                  -direction * rtl * 8 +
                  'deg)',
                zIndex: 6,
                opacity: 1,
                offset: 0.45,
              },
              { transform: 'translate3d(0, 32px, -96px)', zIndex: 0, opacity: 0 },
            ],
            true,
          );
        }
      }
      this.previousCards = new Map(
        cards.flatMap((card) => {
          const key = typeof card.key + ':' + card.key,
            node = nodes.get(key);
          return node
            ? [
                [
                  key,
                  { node, transform: card.transform, depth: card.depth, height: node.offsetHeight },
                ] as const,
              ]
            : [];
        }),
      );
      this.previousIndex = index;
    });
    inject(DestroyRef).onDestroy(stop);
  }
  protected move(delta: number): void {
    if (this.disabled()) return;
    const before = this.current();
    this.travelDirection = Math.sign(delta);
    this.select(before + delta);
    if (this.current() === before) this.travelDirection = 0;
  }
  next(): void {
    this.move(1);
  }
  previous(): void {
    this.move(-1);
  }
  reset(): void {
    this.select(0);
  }
  select(value: number): void {
    if (this.disabled() || !this.items().length || !Number.isFinite(value)) return;
    const length = this.items().length;
    const index = this.loop()
      ? ((Math.trunc(value) % length) + length) % length
      : Math.max(0, Math.min(length - 1, Math.trunc(value)));
    if (index === this.current()) return;
    const item = this.items()[index];
    if (item === undefined) return;
    this.activeIndex.set(index);
    this.selected.emit(item);
  }
}
export const HY_CARD_STACK = [HyCardStack, HyStackItem] as const;
