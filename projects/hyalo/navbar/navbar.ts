import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { HyIcon } from '@hyalo/angular/icon';
import { HyMaterialDirective, injectId } from '@hyalo/angular';

/** The logo or product name, at the start of the bar. */
@Directive({ selector: '[hyNavbarBrand]', host: { class: 'hy-navbar__brand' } })
export class HyNavbarBrand {}

/** Buttons at the end of the bar, such as sign in or a cart. Always visible. */
@Directive({ selector: '[hyNavbarActions]', host: { class: 'hy-navbar__actions' } })
export class HyNavbarActions {}

/**
 * - `floating`: a detached glass pill with space around it.
 * - `full`: a full-width bar. Once content scrolls under it, a soft fade
 *   at its lower edge separates the two instead of a hard line.
 */
export type HyNavbarAppearance = 'floating' | 'full';

/**
 * A glass app bar. Links go in the default slot and are wrapped in a
 * `<nav>`. On narrow screens they collapse behind a menu button and open as
 * a panel under the bar. Bind `menuOpen` if you would rather open your own
 * drawer.
 *
 * ```html
 * <hy-navbar label="Main">
 *   <a hyNavbarBrand routerLink="/">Atelier</a>
 *   <a routerLink="/watches" routerLinkActive="active" ariaCurrentWhenActive="page">Watches</a>
 *   <a routerLink="/journal">Journal</a>
 *   <div hyNavbarActions><button hyButton size="sm">Book a visit</button></div>
 * </hy-navbar>
 * ```
 *
 * The bar compacts once the page scrolls, and with `hideOnScroll` it slides
 * away while scrolling down and returns on the way up. It never hides while
 * the menu is open or focus is inside it. The collapse point is a container
 * query on the navbar's own width (48rem by default).
 */
@Component({
  selector: 'hy-navbar',
  imports: [HyIcon, HyMaterialDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-navbar',
    '[attr.data-appearance]': 'appearance()',
    '[attr.data-position]': 'position()',
    '[attr.data-scrolled]': 'scrolled() || null',
    '[attr.data-hidden]': 'hidden() || null',
    '[attr.data-menu-open]': 'menuOpen() || null',
    '(keydown.escape)': 'closeMenu(true)',
    '(focusin)': 'hidden.set(false)',
    '(click)': 'onClick($event)',
  },
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class HyNavbar {
  private readonly toggle = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');
  protected readonly linksId = injectId('navbar-links');

  /** Accessible name of the `<nav>` landmark. */
  readonly label = input('Main');
  /** Accessible name of the menu button on narrow screens. */
  readonly menuLabel = input('Menu');
  /** Visual style of the bar. */
  readonly appearance = input<HyNavbarAppearance>('floating');
  /** CSS positioning of the navbar. */
  readonly position = input<'sticky' | 'fixed' | 'static'>('sticky');
  /** Material of the bar. */
  readonly material = input<'clear' | 'frosted' | 'tinted' | 'solid' | ''>('');
  /** Slide away while scrolling down. */
  readonly hideOnScroll = input(false, { transform: booleanAttribute });
  /** Scroll distance in pixels after which the bar compacts. */
  readonly scrollThreshold = input(8, { transform: numberAttribute });
  /** Whether the collapsed menu is open. Two-way bindable. */
  readonly menuOpen = model(false);

  protected readonly scrolled = signal(false);
  protected readonly hidden = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      const view = host.ownerDocument.defaultView;
      if (!view) return;
      let last = view.scrollY;
      const onScroll = (): void => {
        const y = view.scrollY;
        this.scrolled.set(y > this.scrollThreshold());
        if (
          this.hideOnScroll() &&
          !this.menuOpen() &&
          !host.contains(host.ownerDocument.activeElement)
        ) {
          const delta = y - last;
          if (Math.abs(delta) > 6) this.hidden.set(delta > 0 && y > host.offsetHeight * 2);
        } else {
          this.hidden.set(false);
        }
        last = y;
      };
      onScroll();
      view.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => view.removeEventListener('scroll', onScroll));
    });
  }

  /** Closes the collapsed menu. */
  closeMenu(restoreFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (restoreFocus) this.toggle().nativeElement.focus();
  }

  protected onClick(event: MouseEvent): void {
    if ((event.target as Element | null)?.closest('.hy-navbar__links a')) this.closeMenu();
  }
}

/** Everything needed to build a navbar. */
export const HY_NAVBAR = [HyNavbar, HyNavbarBrand, HyNavbarActions] as const;
