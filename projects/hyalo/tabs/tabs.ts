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
} from '@angular/core';
import { Tab, TabList, TabPanel, Tabs } from '@angular/aria/tabs';
import { HyIcon } from '@hyalo/angular/icon';

import { ɵtrackIndicator as trackIndicator } from '@hyalo/angular';

/**
 * One tab and its panel. The panel content is rendered up front and hidden
 * with `inert` while another tab is selected.
 */
@Component({
  selector: 'hy-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: TabPanel, inputs: ['value'] }],
  host: { class: 'hy-tab-panel' },
  template: `<ng-content />`,
  styleUrl: './tab.css',
})
export class HyTab {
  readonly panel = inject(TabPanel);
  /** Text of the tab button. */
  readonly label = input.required<string>();
  /** Optional icon name shown before the label. */
  readonly icon = input<string>();
  /** Disables this tab. Arrow keys skip it. */
  readonly disabled = input(false, { transform: booleanAttribute });
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
  imports: [TabList, Tab, HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [Tabs],
  host: { class: 'hy-tabs', '[attr.data-stretch]': 'stretch() || null' },
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class HyTabs {
  protected readonly tabs = contentChildren(HyTab);
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');
  private readonly tabEls = viewChildren('tabEl', { read: ElementRef<HTMLElement> });

  /** Accessible name for the tab list. */
  readonly label = input<string>();
  /** Value of the selected tab. Two-way bindable. Defaults to the first tab. */
  readonly selected = model<string | undefined>(undefined);
  /** `follow` opens a tab on focus, `explicit` waits for Enter or Space. */
  readonly selectionMode = input<'follow' | 'explicit'>('follow');
  /** Stretch tabs to fill the row. */
  readonly stretch = input(false, { transform: booleanAttribute });

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
export const HY_TABS = [HyTabs, HyTab] as const;
