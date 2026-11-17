import { NgTemplateOutlet } from '@angular/common';
import {
  type TemplateRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  afterRenderEffect,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { HyMaterialDirective, type HyNavigationItem } from '@hyalo/angular/core';
import { HyIcon } from '@hyalo/angular/icon';
import { Directionality } from '@angular/cdk/bidi';
import { HyMotion } from '@hyalo/angular/motion';

export interface HyNavigationContext {
  readonly $implicit: HyNavigationItem;
  readonly active: boolean;
  readonly index: number;
}
@Component({
  selector: 'hy-tab-bar',
  imports: [HyIcon, NgTemplateOutlet],
  hostDirectives: [{ directive: HyMaterialDirective, inputs: ['hyMaterial: material'] }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tab-bar.html',
  styleUrl: './tab-bar.css',
  host: {
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-fixed]': 'fixed()',
    '(keydown)': 'keys($event)',
  },
})
export class HyTabBar {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly items = input.required<readonly HyNavigationItem[]>();
  readonly label = input.required<string>();
  readonly activeId = input<string>();
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly fixed = input(false, { transform: booleanAttribute });
  readonly selected = output<HyNavigationItem>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly showLabels = input(true, { transform: booleanAttribute });
  readonly itemTemplate = input<TemplateRef<HyNavigationContext>>();
  protected readonly entries = computed(() =>
    this.items()
      .filter((item) => !item.hidden)
      .map((item) => ({
        ...item,
        disabled: this.disabled() || item.disabled,
        current: item.id === this.activeId(),
      })),
  );
  private readonly motion = inject(HyMotion);
  private readonly direction = inject(Directionality);
  private placeIndicator(animate = true): void {
    const nav = this.element.querySelector<HTMLElement>('nav');
    const active = nav?.querySelector<HTMLElement>('a[aria-current="page"]');
    const indicator = nav?.querySelector<HTMLElement>('.active-indicator');
    if (!nav || !indicator) return;
    if (!active) {
      indicator.hidden = true;
      nav.classList.remove('has-indicator');
      return;
    }
    indicator.style.transition = animate && this.motion.enabled() ? '' : 'none';
    indicator.style.inlineSize = active.offsetWidth + 'px';
    indicator.style.blockSize = active.offsetHeight + 'px';
    indicator.style.translate = active.offsetLeft + 'px ' + active.offsetTop + 'px';
    indicator.hidden = false;
    nav.classList.add('has-indicator');
  }
  constructor() {
    let initialized = false;
    afterRenderEffect(() => {
      this.activeId();
      this.entries();
      this.orientation();
      this.direction.valueSignal();
      this.motion.enabled();
      this.placeIndicator(initialized);
      initialized = true;
    });
    afterNextRender(() => {
      const observer =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(() => this.placeIndicator(false));
      observer?.observe(this.element);
      injectDestroy.onDestroy(() => observer?.disconnect());
    });
    const injectDestroy = inject(DestroyRef);
  }
  protected choose(event: MouseEvent, item: HyNavigationItem): void {
    if (this.disabled() || item.disabled) {
      event.preventDefault();
      return;
    }
    this.selected.emit(item);
  }
  focusItem(id: string): boolean {
    const index = this.entries().findIndex((item) => item.id === id && !item.disabled);
    const link = this.element.querySelectorAll<HTMLAnchorElement>('nav > a')[index];
    link?.focus();
    return !!link;
  }
  protected keys(event: KeyboardEvent): void {
    const links = [
      ...this.element.querySelectorAll<HTMLAnchorElement>('a:not([aria-disabled="true"])'),
    ];
    const index = links.indexOf(event.target as HTMLAnchorElement);
    if (index < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = links.length - 1;
    else if (this.orientation() === 'vertical' && event.key === 'ArrowDown')
      next = (index + 1) % links.length;
    else if (this.orientation() === 'vertical' && event.key === 'ArrowUp')
      next = (index - 1 + links.length) % links.length;
    else if (this.orientation() === 'horizontal' && event.key === 'ArrowRight')
      next = (index + (rtl ? -1 : 1) + links.length) % links.length;
    else if (this.orientation() === 'horizontal' && event.key === 'ArrowLeft')
      next = (index + (rtl ? 1 : -1) + links.length) % links.length;
    else return;
    event.preventDefault();
    links[next]?.focus();
  }
}
