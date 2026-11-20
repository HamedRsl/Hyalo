import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, TemplateRef, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, type Params } from '@angular/router';
export interface HyBreadcrumbItem {
  readonly label: string; readonly href?: string;
  readonly commands?: readonly unknown[]; readonly queryParams?: Params; readonly fragment?: string;
  readonly queryParamsHandling?: 'merge' | 'preserve' | 'replace';
  readonly state?: Record<string, unknown>;
}
export interface HyBreadcrumbContext { readonly $implicit: HyBreadcrumbItem; readonly index: number; readonly last: boolean; }
@Component({ selector: 'hy-breadcrumb', imports: [NgTemplateOutlet], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './breadcrumb.html', styleUrl: './breadcrumb.css' })
export class HyBreadcrumb {
  readonly items = input<readonly HyBreadcrumbItem[]>([]);
  readonly label = input('Breadcrumb');
  readonly fromRouter = input(false);
  readonly itemTemplate = input<TemplateRef<HyBreadcrumbContext>>();
  readonly separatorTemplate = input<TemplateRef<unknown>>();
  private readonly router = inject(Router, {optional:true});
  private readonly route = inject(ActivatedRoute, {optional:true});
  private readonly routeItems = signal<readonly HyBreadcrumbItem[]>([]);
  readonly visibleItems = computed(() => this.fromRouter() ? this.routeItems() : this.items());
  constructor() {
    const update = (): void => {
      const items: HyBreadcrumbItem[] = []; let route = this.route?.root.snapshot; let url = '';
      while (route) {
        url += route.url.length ? '/' + route.url.map(segment => segment.toString()).join('/') : '';
        const label = route.data['breadcrumb'];
        if (typeof label === 'string') items.push({label,href:url || '/'});
        route = route.children.find(child => child.outlet === 'primary');
      }
      this.routeItems.set(items);
    };
    update();
    const subscription = this.router?.events.subscribe(event => { if (event instanceof NavigationEnd) update(); });
    inject(DestroyRef).onDestroy(() => subscription?.unsubscribe());
  }
  href(item: HyBreadcrumbItem): string | undefined {
    return item.commands && this.router ? this.router.serializeUrl(this.router.createUrlTree([...item.commands],{queryParams:item.queryParams,fragment:item.fragment,queryParamsHandling:item.queryParamsHandling})) : item.href;
  }
  navigate(event: MouseEvent, item: HyBreadcrumbItem): void {
    if (!item.commands || !this.router || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    void this.router.navigate([...item.commands], {queryParams:item.queryParams,fragment:item.fragment,queryParamsHandling:item.queryParamsHandling,state:item.state});
  }
}
