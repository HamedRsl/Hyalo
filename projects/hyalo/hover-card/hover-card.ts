import { DOCUMENT } from '@angular/common';
import {
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
  type OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { HyFidelity, injectId } from '@hyalo/angular/core';
import { HyHoverIntent, hyConnectedPositions, type HyPlacement } from '@hyalo/angular/overlay';
import { take } from 'rxjs';
@Directive({
  selector: '[hyHoverCard]',
  exportAs: 'hyHoverCard',
  host: {
    '(pointerenter)': 'enter($event)',
    '(pointerleave)': 'leave($event)',
    '(focusin)': 'focusTrigger()',
    '(focusout)': 'focusOut($event)',
    '(keydown.escape)': 'escape($event)',
    '(keydown.arrowdown)': 'focusCard($event)',
    '(click)': 'show()',
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'open()',
    '[attr.aria-controls]': 'open()?id:null',
  },
})
export class HyHoverCard {
  readonly content = input.required<TemplateRef<unknown>>({ alias: 'hyHoverCard' });
  readonly hoverCardLabel = input.required<string>();
  readonly placement = input<HyPlacement>('top');
  readonly hoverCardShowDelay = input(250);
  /** Null preserves pointer-corridor grace; a number uses a fixed delay. */
  readonly hoverCardHideDelay = input<number | null>(null);
  readonly hoverCardPanelClass = input<string | string[]>('');
  /** Optional DOM parent for this card's overlay. */
  readonly hoverCardContainer = input<HTMLElement>();
  readonly open = signal(false);
  protected readonly id = injectId('hover-card');
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly container = inject(ViewContainerRef);
  private readonly fidelity = inject(HyFidelity);
  private readonly document = inject(DOCUMENT);
  private readonly intent = new HyHoverIntent(this.document);
  private ref: OverlayRef | undefined;
  private mount: HTMLElement | undefined;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private disposed = false;
  private suppressFocus = false;
  protected focusTrigger(): void {
    if (!this.suppressFocus) this.show();
  }
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.disposed = true;
      clearTimeout(this.timer);
      this.intent.cancel();
      this.ref?.dispose();
    });
  }
  protected enter(event: PointerEvent): void {
    this.intent.cancel();
    if (event.pointerType === 'touch') return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.show(), this.delay(this.hoverCardShowDelay(), 250));
  }
  protected leave(event?: PointerEvent): void {
    clearTimeout(this.timer);
    const close = (): void => {
      if (
        this.ref?.overlayElement.contains(this.document.activeElement) ||
        this.host.nativeElement.contains(this.document.activeElement)
      )
        return;
      this.hide();
    };
    if (this.hoverCardHideDelay() === null)
      this.intent.leave(event, this.ref?.overlayElement, close);
    else {
      this.intent.cancel();
      this.timer = setTimeout(close, this.delay(this.hoverCardHideDelay() ?? 150, 150));
    }
  }
  private delay(value: number, fallback: number): number {
    return Number.isFinite(value) ? Math.max(0, value) : fallback;
  }
  protected focusOut(event: FocusEvent): void {
    if (event.relatedTarget && this.ref?.overlayElement.contains(event.relatedTarget as Node))
      return;
    this.leave();
  }
  protected escape(event: Event): void {
    if (this.open()) {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
      this.suppressFocus = true;
      this.host.nativeElement.focus();
      this.suppressFocus = false;
    }
  }
  protected focusCard(event: Event): void {
    event.preventDefault();
    this.show();
    const pane = this.ref?.overlayElement;
    if (!pane) return;
    const focusable = pane.querySelector<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),[tabindex="0"]',
    );
    pane.tabIndex = -1;
    (focusable ?? pane).focus();
  }
  show(): void {
    clearTimeout(this.timer);
    if (this.disposed || this.open()) return;
    const mount = this.hoverCardContainer();
    if (this.ref && this.mount !== mount) {
      this.ref.dispose();
      this.ref = undefined;
    }
    if (!this.ref) {
      this.mount = mount;
      const position = createFlexibleConnectedPositionStrategy(this.injector, this.host)
        .withPositions(hyConnectedPositions(this.placement(), 8))
        .withViewportMargin(12)
        .withPush(true);
      if (mount) position.withPopoverLocation({ type: 'parent', element: mount });
      this.ref = createOverlayRef(this.injector, {
        positionStrategy: position,
        scrollStrategy: createRepositionScrollStrategy(this.injector),
        panelClass: ['hy-hover-card-pane', ...[this.hoverCardPanelClass()].flat().filter(Boolean)],
        ...(mount ? { usePopover: true } : {}),
      });
      const pane = this.ref.overlayElement;
      pane.classList.add('hy-glass');
      pane.style.cssText =
        'max-inline-size:min(22rem,calc(100vw - 2rem));max-block-size:70dvh;overflow:auto;padding:1.25rem;border-radius:var(--hy-radius-m);border:1px solid var(--hy-line-strong);color:var(--hy-ink)';
      pane.id = this.id;
      pane.setAttribute('role', 'dialog');
      pane.addEventListener('pointerenter', () => {
        clearTimeout(this.timer);
        this.intent.cancel();
      });
      pane.addEventListener('pointerleave', () => this.leave());
      pane.addEventListener('focusout', (event) => {
        const next = event.relatedTarget as Node | null;
        if (!next || (!pane.contains(next) && !this.host.nativeElement.contains(next)))
          this.leave();
      });
      this.ref.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape') this.escape(event);
      });
      this.ref.outsidePointerEvents().subscribe((event) => {
        if (!this.host.nativeElement.contains(event.target as Node)) this.hide();
      });
    }
    const pane = this.ref.overlayElement;
    pane.setAttribute('aria-label', this.hoverCardLabel());
    pane.dataset['material'] = this.fidelity.tier() === 'low' ? 'solid' : 'frosted';
    pane.style.visibility = 'hidden';
    const strategy = this.ref.getConfig().positionStrategy as ReturnType<
      typeof createFlexibleConnectedPositionStrategy
    >;
    strategy.withPositions(hyConnectedPositions(this.placement(), 8));
    strategy.positionChanges.pipe(take(1)).subscribe(() => pane.style.removeProperty('visibility'));
    this.open.set(true);
    this.ref.attach(new TemplatePortal(this.content(), this.container));
  }
  hide(): void {
    clearTimeout(this.timer);
    this.intent.cancel();
    this.open.set(false);
    this.ref?.detach();
  }
}
