import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Injectable,
  effect,
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

/** Application-scoped registry; duplicate live tags are rejected. */
@Injectable({ providedIn: 'root' })
export class HySidebarController {
  private readonly instances = new Map<string, HySidebar>();
  get(tag: string): HySidebar | undefined { return this.instances.get(tag); }
  register(tag: string, sidebar: HySidebar): () => void {
    if (this.instances.has(tag)) throw new Error('Duplicate sidebar tag: ' + tag);
    this.instances.set(tag, sidebar);
    return () => { if (this.instances.get(tag) === sidebar) this.instances.delete(tag); };
  }
  collapse(tag: string): void { this.get(tag)?.setCollapsed(true); }
  expand(tag: string): void { this.get(tag)?.setCollapsed(false); }
  toggle(tag: string): void { this.get(tag)?.toggle(); }
}

type SidebarState = 'expanded' | 'compact' | 'collapsed';

@Component({
  selector: 'hy-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  host: {
    '[attr.data-state]': 'state()',
    '[style.position]': 'docked() ? "sticky" : null',
    '[style.top]': 'docked() ? topOffset() : null',
    '[style.bottom]': 'docked() ? bottomOffset() : null',
    '[attr.data-collapsed]': 'isCollapsed()',
    '[style.--hy-sidebar-label-display]': 'isCollapsed() ? "none" : null',
    '[style.--hy-sidebar-item-justify]': 'isCollapsed() ? "center" : null',
  },
})
export class HySidebar {
  readonly collapsed = model(false);
  readonly tag = input<string>();
  readonly docked = input(false);
  readonly topOffset = input('0px');
  readonly bottomOffset = input('0px');
  setCollapsed(collapsed: boolean): void {
    this.expandOverride.set(!collapsed && this.collapseMatch());
    this.collapsed.set(collapsed);
  }
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
    const controller = inject(HySidebarController);
    effect(onCleanup => {
      const tag = this.tag();
      if (tag) onCleanup(controller.register(tag, this));
    });
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

  toggle(): void {
    const expand = this.isCollapsed();
    this.expandOverride.set(expand && this.collapseMatch());
    this.collapsed.set(!expand);
  }
}
export const HY_SIDEBAR = [HySidebar, HySidebarItem, HySidebarGroup, HySidebarGroups] as const;
