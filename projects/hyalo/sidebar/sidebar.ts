import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  afterRenderEffect,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { HySidebarItem } from './sidebar-item';
import { HySidebarGroup, HySidebarGroups } from './sidebar-group';
export { HySidebarItem } from './sidebar-item';
export * from './sidebar-group';

/** Optional viewport queries. If both match, the collapsed state takes precedence. */
export interface HySidebarResponsive {
  readonly compact?: string;
  readonly collapsed?: string;
}

type SidebarState = 'expanded' | 'compact' | 'collapsed';

@Component({
  selector: 'hy-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  host: {
    '[attr.data-state]': 'state()',
    '[attr.data-collapsed]': 'isCollapsed()',
    '[style.--hy-sidebar-label-display]': 'isCollapsed() ? "none" : null',
    '[style.--hy-sidebar-item-justify]': 'isCollapsed() ? "center" : null',
  },
})
export class HySidebar {
  readonly collapsed = model(false);
  /** No queries are active by default. Viewport changes never write to `collapsed`. */
  readonly responsive = input<HySidebarResponsive | null>(null);
  readonly label = input('Main navigation');
  readonly collapseLabel = input('Collapse navigation');
  readonly expandLabel = input('Expand navigation');
  private readonly compactMatch = signal(false);
  private readonly collapseMatch = signal(false);
  private readonly expandOverride = signal(false);
  protected readonly state = computed<SidebarState>(() => {
    if (this.collapsed() || (this.collapseMatch() && !this.expandOverride())) return 'collapsed';
    return this.compactMatch() ? 'compact' : 'expanded';
  });
  protected readonly isCollapsed = computed(() => this.state() === 'collapsed');

  constructor() {
    const document = inject(DOCUMENT);
    afterRenderEffect({
      read: (onCleanup) => {
        const responsive = this.responsive();
        const view = document.defaultView;
        const match = (query: string | undefined): MediaQueryList | undefined =>
          query ? view?.matchMedia?.(query) : undefined;
        const compact = match(responsive?.compact);
        const collapsed = match(responsive?.collapsed);
        this.expandOverride.set(false);
        const update = (): void => {
          const collapseMatch = collapsed?.matches ?? false;
          this.compactMatch.set(compact?.matches ?? false);
          this.collapseMatch.set(collapseMatch);
          if (!collapseMatch) this.expandOverride.set(false);
        };
        update();
        const queries = [compact, collapsed];
        for (const query of queries) query?.addEventListener('change', update);
        onCleanup(() => {
          for (const query of queries) query?.removeEventListener('change', update);
        });
      },
    });
  }

  protected toggle(): void {
    const expand = this.isCollapsed();
    this.expandOverride.set(expand && this.collapseMatch());
    this.collapsed.set(!expand);
  }
}
export const HY_SIDEBAR = [HySidebar, HySidebarItem, HySidebarGroup, HySidebarGroups] as const;
