import type { FocusTrapFactory } from '@angular/cdk/a11y';
import { take } from 'rxjs';
import type { FlexibleConnectedPositionStrategy, OverlayRef } from '@angular/cdk/overlay';
import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
  model,
  effect,
  untracked,
} from '@angular/core';
import { HyFidelity, injectId, type HyMaterial } from '@hyalo/angular/core';
import {
  hyConnectedPositions,
  type HyPlacement,
  ɵHyPresence as HyPresence,
} from '@hyalo/angular/overlay';
import { loadPopoverOverlay as loadOverlay } from './load-overlay';

/**
 * A non-modal glass panel anchored to a trigger, for content that does not
 * fit in a tooltip: a short form, a menu of links, details.
 *
 * ```html
 * <button hyButton variant="glass" [hyPopover]="share" popoverLabel="Share">Share</button>
 * <ng-template #share>
 *   <a href="...">Copy link</a>
 * </ng-template>
 * ```
 *
 * Click or Enter toggles it. On open, focus moves to the first focusable
 * element inside. Escape closes it and returns focus to the trigger, and so
 * does clicking outside or tabbing out of it.
 */
@Directive({
  selector: '[hyPopover]',
  exportAs: 'hyPopover',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'open()',
    '[attr.aria-controls]': 'open() ? panelId : null',
    '(click)': 'onTriggerClick()',
    // Fetch the overlay code as soon as the user heads for the trigger.
    '(pointerenter)': 'preload()',
    '(focusin)': 'preload()',
  },
})
export class HyPopover {
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly fidelity = inject(HyFidelity);
  protected readonly panelId = injectId('popover');
  private overlayRef: OverlayRef | null = null;
  private position: FlexibleConnectedPositionStrategy | null = null;
  private readonly presence = new HyPresence();
  private destroyed = false;
  private positioned = false;
  private resizeObserver: ResizeObserver | null = null;
  private positionFrame = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  /** The content. */
  readonly content = input.required<TemplateRef<unknown>>({ alias: 'hyPopover' });
  readonly popoverContext = input<unknown>();
  readonly popoverTrigger = input<'click' | 'manual'>('click');
  /** False keeps the panel open on Escape, outside pointer and focus exit. */
  readonly popoverAutoClose = input(true);
  readonly popoverShowDelay = input(0);
  readonly popoverHideDelay = input(0);
  /** Accessible name of the panel. */
  readonly popoverLabel = input<string>();
  /** Use solid over image content when the background would reduce text contrast. */
  readonly popoverMaterial = input<HyMaterial>('frosted');
  /** Preferred side. Flips when there is no room. */
  readonly popoverPlacement = input<HyPlacement>('bottom');
  /** Whether the panel is open. Two-way bindable as `[(popoverOpen)]`. */
  readonly open = model(false, { alias: 'popoverOpen' });

  constructor() {
    effect(() => {
      const open = this.open();
      untracked(() => (open ? void this.attach() : this.detach()));
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      clearTimeout(this.timer);
      this.stopPositionTracking();
      this.overlayRef?.dispose();
    });
  }

  toggle(): void {
    if (this.open()) this.hide();
    else this.show();
  }

  protected onTriggerClick(): void {
    if (this.popoverTrigger() === 'click') this.toggle();
  }

  show(): void {
    clearTimeout(this.timer);
    if (this.destroyed) return;
    const delay = Math.max(0, this.popoverShowDelay());
    if (!delay) this.open.set(true);
    else this.timer = setTimeout(() => this.open.set(true), delay);
  }

  hide(): void {
    clearTimeout(this.timer);
    if (this.destroyed) return;
    const delay = Math.max(0, this.popoverHideDelay());
    if (!delay) this.close();
    else this.timer = setTimeout(() => this.close(), delay);
  }

  /** Closes the panel, optionally moving focus back to the trigger. */
  close(restoreFocus = true): void {
    clearTimeout(this.timer);
    if (!this.open()) return;
    this.open.set(false);
    if (restoreFocus) this.host.nativeElement.focus();
  }

  protected preload(): void {
    loadOverlay().catch(() => undefined);
  }

  private async attach(): Promise<void> {
    const kit = await loadOverlay().catch(() => null);
    if (this.destroyed) return;
    if (!kit) {
      // Without the overlay code there is no panel, so do not claim one.
      this.open.set(false);
      return;
    }
    // It may have been closed again while the code loaded.
    if (!this.open()) return;
    const focusTraps = this.injector.get(kit.FocusTrapFactory);
    const {
      TemplatePortal,
      createFlexibleConnectedPositionStrategy,
      createOverlayRef,
      createRepositionScrollStrategy,
    } = kit;
    if (!this.overlayRef) {
      this.position = createFlexibleConnectedPositionStrategy(this.injector, this.host)
        .withViewportMargin(12)
        // Content owns its scroll bounds. A flexible-fit box can be shorter
        // than the actual panel and put its heading above the viewport.
        .withFlexibleDimensions(false)
        .withPush(true)
        // The panel grows out of its trigger, not out of its own centre.
        .withTransformOriginOn('.hy-popover');
      this.overlayRef = createOverlayRef(this.injector, {
        positionStrategy: this.position,
        scrollStrategy: createRepositionScrollStrategy(this.injector),
        panelClass: 'hy-popover-pane',
      });
      this.overlayRef.overlayElement.addEventListener('transitionend', (event) => {
        if (
          event.target === this.overlayRef?.overlayElement &&
          (event.propertyName === 'scale' || event.propertyName === 'transform') &&
          this.open()
        ) {
          this.overlayRef.updatePosition();
        }
      });
      this.overlayRef.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape' && this.popoverAutoClose()) {
          event.preventDefault();
          this.close();
        }
      });
      this.overlayRef.outsidePointerEvents().subscribe((event) => {
        if (this.popoverAutoClose() && !this.host.nativeElement.contains(event.target as Node))
          this.close(false);
      });
    }
    if (this.overlayRef.hasAttached()) {
      const pane = this.overlayRef.overlayElement;
      pane.addEventListener('focusout', this.onFocusOut);
      this.startPositionTracking(pane);
      // Reopened while fading out: turn the exit around.
      if (this.presence.leaving && this.positioned)
        this.reveal(this.overlayRef.overlayElement, focusTraps);
      return;
    }
    // Read on every open, so a changed placement applies next time.
    this.position?.withPositions(hyConnectedPositions(this.popoverPlacement(), 10));
    const pane = this.overlayRef.overlayElement;
    pane.id = this.panelId;
    pane.setAttribute('role', 'dialog');
    const label = this.popoverLabel();
    if (label) pane.setAttribute('aria-label', label);
    else pane.removeAttribute('aria-label');
    pane.classList.add('hy-glass', 'hy-popover');
    pane.dataset['material'] = this.fidelity.tier() === 'low' ? 'solid' : this.popoverMaterial();
    pane.dataset['state'] = 'closed';
    pane.style.visibility = 'hidden';
    this.positioned = false;
    pane.addEventListener('focusout', this.onFocusOut);
    // CDK positions after rendering the portal. Do not expose its unpositioned first frame.
    this.position?.positionChanges.pipe(take(1)).subscribe(() => {
      this.positioned = true;
      if (this.destroyed || !this.open() || !this.overlayRef?.hasAttached()) return;
      this.reveal(pane, focusTraps);
    });
    this.overlayRef.attach(
      new TemplatePortal(this.content(), this.viewContainer, this.popoverContext()),
    );
    this.startPositionTracking(pane);
  }

  private startPositionTracking(pane: HTMLElement): void {
    // Lazy tabs/templates can change the panel size after CDK's initial
    // measurement. Reposition on actual size changes, not a guessed timer.
    if (typeof ResizeObserver === 'function') {
      this.resizeObserver?.disconnect();
      this.resizeObserver = new ResizeObserver(() => {
        const view = pane.ownerDocument.defaultView;
        if (this.positionFrame || this.destroyed || !this.open()) return;
        this.positionFrame =
          view?.requestAnimationFrame(() => {
            this.positionFrame = 0;
            if (!this.destroyed && this.open()) this.overlayRef?.updatePosition();
          }) ?? 0;
      });
      this.resizeObserver.observe(pane);
    }
  }

  private stopPositionTracking(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.host.nativeElement.ownerDocument.defaultView?.cancelAnimationFrame?.(this.positionFrame);
    this.positionFrame = 0;
  }

  private reveal(pane: HTMLElement, focusTraps: FocusTrapFactory): void {
    pane.style.removeProperty('visibility');
    this.presence.enter(pane);
    const trap = focusTraps.create(pane);
    void trap.focusFirstTabbableElementWhenReady().then((found) => {
      if (!found && this.open() && !this.destroyed) {
        pane.tabIndex = -1;
        pane.focus();
      }
      trap.destroy();
    });
  }

  private detach(): void {
    this.stopPositionTracking();
    const ref = this.overlayRef;
    if (!ref?.hasAttached()) return;
    ref.overlayElement.removeEventListener('focusout', this.onFocusOut);
    this.presence.leave(ref.overlayElement, () => ref.detach());
  }

  private readonly onFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget as Node | null;
    if (
      this.popoverAutoClose() &&
      next &&
      !this.overlayRef?.overlayElement.contains(next) &&
      next !== this.host.nativeElement
    ) {
      this.close(false);
    }
  };
}
