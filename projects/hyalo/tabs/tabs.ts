import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  viewChild,
  viewChildren,
  Directive,
  TemplateRef,
  contentChild,
  DestroyRef,
  effect,
  output,
  signal,
  afterRenderEffect,
  numberAttribute,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { Tab, TabList, TabPanel, Tabs } from '@angular/aria/tabs';
import { HyIcon } from '@hyalo/angular/icon';

import { ɵtrackIndicator as trackIndicator } from '@hyalo/angular/core';

@Directive({ selector: 'ng-template[hyTabContent]' })
export class HyTabContent {
  readonly template = inject(TemplateRef<unknown>);
}
@Directive({ selector: 'ng-template[hyTabHeader]' })
export class HyTabHeader {
  readonly template = inject(TemplateRef<unknown>);
}
export interface HyTabTransition {
  readonly previous: string | undefined;
  readonly next: string;
}

/**
 * One tab and its panel. The panel content is rendered up front and hidden
 * with `inert` while another tab is selected.
 */
@Component({
  selector: 'hy-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: TabPanel, inputs: ['value'] }],
  host: { class: 'hy-tab-panel' },
  imports: [NgTemplateOutlet],
  template: `<ng-content />
    @if (created()) {
      <ng-container [ngTemplateOutlet]="lazy()?.template ?? null" />
    }`,
  styleUrl: './tab.css',
})
export class HyTab {
  private readonly parent = inject(HyTabs);
  readonly panel = inject(TabPanel);
  /** Text of the tab button. */
  readonly label = input.required<string>();
  /** Optional icon name shown before the label. */
  readonly icon = input<string>();
  /** Disables this tab. Arrow keys skip it. */
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly destroyOnHide = input(false, { transform: booleanAttribute });
  readonly closable = input(false, { transform: booleanAttribute });
  readonly badge = input<string | number>();
  readonly compactLabel = input('');
  readonly route = input<string>();
  readonly header = contentChild(HyTabHeader);
  protected readonly lazy = contentChild(HyTabContent);
  protected readonly created = signal(false);
  constructor() {
    effect(() => {
      if (this.parent.isActive(this.panel.value())) this.created.set(true);
      else if (this.destroyOnHide()) this.created.set(false);
    });
  }
}

/**
 * Tabs with a sliding glass indicator, built on Angular Aria. Arrow keys
 * move between tabs (mirrored in RTL), Home and End jump to the ends.
 *
 * ```html
 * <hy-tabs label="Watch details" [(selected)]="tab">
 *   <hy-tab value="overview" label="Overview">...</hy-tab>
 *   <hy-tab value="specs" label="Specifications">...</hy-tab>
 * </hy-tabs>
 * ```
 *
 * With `selectionMode="follow"` (the default) a tab opens as soon as it is
 * focused. Use `explicit` when panels are expensive, so users press Enter or
 * Space to open one.
 */
@Component({
  selector: 'hy-tabs',
  imports: [TabList, Tab, HyIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [Tabs],
  host: {
    class: 'hy-tabs',
    '[attr.data-stretch]': 'stretch() || null',
    '[attr.data-placement]': 'placement()',
    '[attr.aria-busy]': 'pending() || null',
  },
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class HyTabs {
  protected readonly tabs = contentChildren(HyTab);
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');
  private readonly tabList = viewChild(TabList);
  private readonly panelViewport = viewChild<ElementRef<HTMLElement>>('panelViewport');
  private readonly panelContent = viewChild<ElementRef<HTMLElement>>('panelContent');
  private renderedSelection: string | undefined;
  private renderedHeight: number | undefined;
  private heightObserver: ResizeObserver | undefined;
  private heightAnimation: Animation | undefined;
  private acceptedTransition: { value: string; generation: number } | undefined;
  private readonly router = inject(Router, { optional: true });
  private generation = 0;
  private destroyed = false;
  private readonly tabEls = viewChildren('tabEl', { read: ElementRef<HTMLElement> });

  /** Accessible name for the tab list. */
  readonly label = input<string>();
  /** Value of the selected tab. Two-way bindable. Defaults to the first tab. */
  readonly selected = model<string | undefined>(undefined);
  /** `follow` opens a tab on focus, `explicit` waits for Enter or Space. */
  readonly selectionMode = input<'follow' | 'explicit'>('follow');
  /** Stretch tabs to fill the row. */
  readonly stretch = input(false, { transform: booleanAttribute });
  readonly placement = input<'top' | 'bottom' | 'start' | 'end'>('top');
  /** Animate changes in the active panel’s height. */
  readonly dynamicHeight = input(false, { transform: booleanAttribute });
  /** Height animation duration in milliseconds. Zero disables height motion. */
  readonly animationDuration = input(220, { transform: numberAttribute });
  readonly beforeChange = input<(transition: HyTabTransition) => boolean | Promise<boolean>>();
  readonly pending = signal(false);
  readonly selectionChange = output<HyTabTransition>();
  readonly transitionError = output<unknown>();
  readonly transitionComplete = output<string>();
  readonly focused = output<string>();
  readonly addRequested = output<void>();
  readonly closeRequested = output<string>();
  readonly editable = input(false, { transform: booleanAttribute });
  readonly addLabel = input('Add tab');
  readonly closeLabel = input('Close tab');
  readonly overflow = input<'scroll' | 'paginator' | 'dropdown'>('scroll');
  readonly overflowLabel = input('Choose tab');
  readonly previousLabel = input('Previous tabs');
  readonly nextLabel = input('Next tabs');
  constructor() {
    let observed: string | undefined;
    effect(() => {
      const current = this.current();
      if (current !== observed) {
        observed = current;
        if (this.pending()) {
          this.generation++;
          this.pending.set(false);
        }
      }
    });
    afterRenderEffect({
      mixedReadWrite: () => {
        const active = this.current();
        const viewport = this.panelViewport()?.nativeElement;
        const content = this.panelContent()?.nativeElement;
        const dynamicHeight = this.dynamicHeight();
        const duration = this.animationDuration();
        if (!viewport || !content) return;
        this.observeHeight(content, dynamicHeight);
        const previous = this.renderedSelection;
        this.renderedSelection = active;
        if (previous === active) {
          if (!dynamicHeight && this.heightAnimation) {
            this.cancelHeightAnimation();
            this.completeTransition(active);
          }
          return;
        }
        if (this.acceptedTransition?.value !== active) this.acceptedTransition = undefined;
        const start = this.heightAnimation
          ? viewport.getBoundingClientRect().height
          : this.renderedHeight;
        this.cancelHeightAnimation();
        const end = dynamicHeight ? content.getBoundingClientRect().height : undefined;
        this.renderedHeight = end;
        const reducedMotion = viewport.ownerDocument.defaultView?.matchMedia?.(
          '(prefers-reduced-motion: reduce)',
        ).matches;
        if (
          start === undefined ||
          end === undefined ||
          Math.abs(start - end) < 1 ||
          reducedMotion ||
          !Number.isFinite(duration) ||
          duration <= 0 ||
          !viewport.animate
        ) {
          this.completeTransition(active);
          return;
        }
        const animation = viewport.animate(
          [
            { height: `${start}px`, overflow: 'clip' },
            { height: `${end}px`, overflow: 'clip' },
          ],
          { duration, easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)' },
        );
        this.heightAnimation = animation;
        animation.addEventListener(
          'finish',
          () => {
            if (this.heightAnimation !== animation) return;
            this.heightAnimation = undefined;
            this.completeTransition(active);
          },
          { once: true },
        );
      },
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.generation++;
      this.cancelHeightAnimation();
      this.heightObserver?.disconnect();
    });
  }
  private observeHeight(content: HTMLElement, enabled: boolean): void {
    if (!enabled) {
      this.heightObserver?.disconnect();
      this.heightObserver = undefined;
      this.renderedHeight = undefined;
      return;
    }
    this.renderedHeight ??= content.getBoundingClientRect().height;
    if (!this.heightObserver && typeof ResizeObserver !== 'undefined') {
      this.heightObserver = new ResizeObserver(([entry]) => {
        this.renderedHeight = entry?.contentRect.height;
      });
      this.heightObserver.observe(content);
    }
  }
  private cancelHeightAnimation(): void {
    this.heightAnimation?.cancel();
    this.heightAnimation = undefined;
  }
  private completeTransition(active: string | undefined): void {
    const transition = this.acceptedTransition;
    if (!transition || transition.value !== active || untracked(this.current) !== active) return;
    this.acceptedTransition = undefined;
    if (!this.destroyed && transition.generation === this.generation) {
      this.transitionComplete.emit(transition.value);
    }
  }
  private restoreSelectionFocus(): void {
    const index = this.tabs().findIndex((tab) => tab.panel.value() === this.current());
    const target = this.tabEls()[index]?.nativeElement;
    // Do not steal focus if the user has left the tab headers while awaiting a guard.
    const active = target?.ownerDocument.activeElement;
    if (this.tabEls().some((tab) => tab.nativeElement === active)) target?.focus();
  }
  isActive(value: string): boolean {
    return this.current() === value;
  }
  select(next: string | undefined): void {
    if (
      !next ||
      next === this.current() ||
      !this.tabs().some((tab) => tab.panel.value() === next && !tab.disabled())
    )
      return;
    this.tabList()?.selectedTab.set(this.current());
    const transition = { previous: this.current(), next };
    const generation = ++this.generation;
    const accept = (approved: boolean): void => {
      if (this.destroyed || generation !== this.generation) return;
      this.pending.set(false);
      if (
        !approved ||
        this.current() !== transition.previous ||
        !this.tabs().some((tab) => tab.panel.value() === next && !tab.disabled())
      ) {
        this.restoreSelectionFocus();
        return;
      }
      this.acceptedTransition = { value: next, generation };
      this.selected.set(next);
      this.selectionChange.emit(transition);
      const route = this.tabs()
        .find((tab) => tab.panel.value() === next)
        ?.route();
      if (route) void this.router?.navigateByUrl(route);
    };
    try {
      const result = this.beforeChange()?.(transition) ?? true;
      if (typeof result === 'boolean') accept(result);
      else {
        this.pending.set(true);
        void result.then(accept, (error: unknown) => {
          if (generation === this.generation && !this.destroyed) {
            this.pending.set(false);
            this.restoreSelectionFocus();
            this.transitionError.emit(error);
          }
        });
      }
    } catch (error) {
      this.pending.set(false);
      this.restoreSelectionFocus();
      this.transitionError.emit(error);
    }
  }
  protected scroll(direction: number): void {
    const list = this.list()?.nativeElement;
    if (!list) return;
    const view = list.ownerDocument.defaultView;
    const behavior = view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? 'instant'
      : 'smooth';
    const vertical = this.placement() === 'start' || this.placement() === 'end';
    if (vertical) {
      list.scrollBy({ top: direction * list.clientHeight, behavior });
    } else {
      const rtl = view?.getComputedStyle(list).direction === 'rtl';
      list.scrollBy({ left: direction * list.clientWidth * (rtl ? -1 : 1), behavior });
    }
  }

  /** The selected value, falling back to the first enabled tab. */
  protected readonly current = computed(
    () =>
      this.selected() ??
      this.tabs()
        .find((t) => !t.disabled())
        ?.panel.value(),
  );

  protected readonly ready = trackIndicator(this.list, () => {
    const index = this.tabs().findIndex((t) => t.panel.value() === this.current());
    return this.tabEls()[index]?.nativeElement ?? null;
  });
}

/** Everything needed to build tabs. */
export const HY_TABS = [HyTabs, HyTab, HyTabContent, HyTabHeader] as const;
