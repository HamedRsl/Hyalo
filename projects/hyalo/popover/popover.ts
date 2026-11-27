import type { FocusTrapFactory } from '@angular/cdk/a11y';
import { take } from 'rxjs';
import type {
  FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin,
  OverlayRef,
} from '@angular/cdk/overlay';
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
  output,
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

export interface HyPopoverDismissal {
  readonly escape?: boolean;
  readonly outsidePointer?: boolean;
  readonly focusOut?: boolean;
}

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
    '(pointerenter)': 'onPointerEnter($event)',
    '(pointerleave)': 'onPointerLeave($event)',
    '(focusin)': 'preload()',
    '(keydown.escape)': 'onHostEscape($event)',
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
  private mount: HTMLElement | undefined;
  private entrySequence = 0;
  private preserveFocus = false;
  private hoverDismissal: AbortController | undefined;
  private resizeObserver: ResizeObserver | null = null;
  private positionFrame = 0;
  private revealFrame = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  /** The content. */
  readonly content = input.required<TemplateRef<unknown>>({ alias: 'hyPopover' });
  readonly popoverContext = input<unknown>();
  readonly popoverTrigger = input<'click' | 'manual' | 'hover'>('click');
  /** False keeps the panel open on Escape, outside pointer and focus exit. */
  readonly popoverAutoClose = input<boolean | HyPopoverDismissal>(true);
  readonly popoverShowDelay = input(0);
  readonly popoverHideDelay = input(0);
  /** Accessible name of the panel. */
  readonly popoverLabel = input<string>();
  /** Use solid over image content when the background would reduce text contrast. */
  readonly popoverMaterial = input<HyMaterial>('frosted');
  /** Preferred side. Flips when there is no room. */
  readonly popoverPlacement = input<HyPlacement>('bottom');
  readonly popoverOrigin = input<FlexibleConnectedPositionStrategyOrigin>();
  readonly popoverOffset = input(10);
  /** Optional native top-layer parent. Applied when the next panel attaches. */
  readonly popoverContainer = input<HTMLElement>();
  readonly popoverOpened = output<void>();
  readonly popoverClosed = output<void>();
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
      this.hoverDismissal?.abort();
      this.stopPositionTracking();
      this.overlayRef?.dispose();
    });
  }

  toggle(): void {
    if (this.open()) this.hide();
    else this.show();
  }

  protected onTriggerClick(): void {
    if (this.popoverTrigger() === 'manual') return;
    if (this.open() && this.preserveFocus) {
      this.preserveFocus = false;
      clearTimeout(this.timer);
      void this.attach(true);
    } else this.toggle();
  }

  protected onPointerEnter(event: PointerEvent): void {
    this.preload();
    if (this.popoverTrigger() === 'hover' && event.pointerType !== 'touch') {
      if (this.hoverDismissal) return;
      if (this.open()) clearTimeout(this.timer);
      else this.scheduleShow(true);
    }
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (this.popoverTrigger() === 'hover' && event.pointerType !== 'touch') {
      clearTimeout(this.timer);
      this.timer = setTimeout(
        () => {
          const pane = this.overlayRef?.overlayElement;
          if (!pane?.contains(pane.ownerDocument.activeElement)) this.close(false);
        },
        Math.max(120, this.popoverHideDelay()),
      );
    }
  }

  private autoClose(reason: keyof HyPopoverDismissal): boolean {
    const policy = this.popoverAutoClose();
    return typeof policy === 'boolean' ? policy : (policy[reason] ?? true);
  }

  protected onHostEscape(event: Event): void {
    if (!this.open() || !this.autoClose('escape')) return;
    event.preventDefault();
    this.close();
  }

  show(): void {
    this.scheduleShow(false);
  }

  private scheduleShow(preserveFocus: boolean): void {
    clearTimeout(this.timer);
    if (this.destroyed) return;
    this.preserveFocus = preserveFocus;
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
    if (restoreFocus && this.preserveFocus) this.waitForHoverExit();
    this.open.set(false);
    if (restoreFocus) this.host.nativeElement.focus();
  }

  private waitForHoverExit(): void {
    this.hoverDismissal?.abort();
    const controller = new AbortController();
    this.hoverDismissal = controller;
    const host = this.host.nativeElement;
    host.ownerDocument.addEventListener('pointermove', (event) => {
      const rect = host.getBoundingClientRect();
      if (event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom) return;
      controller.abort();
      this.hoverDismissal = undefined;
    }, { capture: true, signal: controller.signal });
  }

  protected preload(): void {
    loadOverlay().catch(() => undefined);
  }

  private async attach(transferFocus = false): Promise<void> {
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
    const parent = this.popoverContainer();
    if (this.overlayRef && !this.overlayRef.hasAttached() && this.mount !== parent) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    if (!this.overlayRef) {
      this.mount = parent;
      this.position = createFlexibleConnectedPositionStrategy(
        this.injector,
        this.popoverOrigin() ?? this.host,
      )
        .withViewportMargin(12)
        // Content owns its scroll bounds. A flexible-fit box can be shorter
        // than the actual panel and put its heading above the viewport.
        .withFlexibleDimensions(false)
        .withPush(true);
      if (parent) this.position.withPopoverLocation({ type: 'parent', element: parent });
      this.overlayRef = createOverlayRef(this.injector, {
        positionStrategy: this.position,
        scrollStrategy: createRepositionScrollStrategy(this.injector),
        panelClass: 'hy-popover-pane',
        ...(parent ? { usePopover: true } : {}),
      });
      this.overlayRef.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape' && this.autoClose('escape')) {
          event.preventDefault();
          this.close();
        }
      });
      this.overlayRef.outsidePointerEvents().subscribe((event) => {
        if (
          this.autoClose('outsidePointer') &&
          !this.host.nativeElement.contains(event.target as Node)
        )
          this.close(false);
      });
      this.overlayRef.overlayElement.addEventListener('pointerenter', this.keepHoverOpen);
      this.overlayRef.overlayElement.addEventListener('pointerleave', this.leaveHoverPanel);
    }
    if (this.overlayRef.hasAttached()) {
      const pane = this.overlayRef.overlayElement;
      pane.addEventListener('focusout', this.onFocusOut);
      this.startPositionTracking(pane);
      // Reopened while fading out: turn the exit around.
      if (!this.positioned) this.revealAfterPositioning(pane, focusTraps);
      else if (this.presence.leaving)
        this.reveal(this.overlayRef.overlayElement, focusTraps);
      else if (transferFocus) this.focusInside(pane, focusTraps);
      return;
    }
    // Read on every open, so a changed placement applies next time.
    this.position
      ?.setOrigin(this.popoverOrigin() ?? this.host)
      .withPositions(hyConnectedPositions(this.popoverPlacement(), this.popoverOffset()));
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
    this.position?.positionChanges.pipe(take(1)).subscribe(() => {
      this.revealAfterPositioning(pane, focusTraps);
    });
    this.overlayRef.attach(
      new TemplatePortal(this.content(), this.viewContainer, this.popoverContext()),
    );
    this.startPositionTracking(pane);
  }

  private revealAfterPositioning(pane: HTMLElement, focusTraps: FocusTrapFactory): void {
    if (this.revealFrame) return;
    const show = (): void => {
      this.revealFrame = 0;
      const ref = this.overlayRef;
      if (this.destroyed || !this.open() || !ref?.hasAttached()) return;
      // Lazy content can render after CDK's first measurement. Measure the final
      // layout while the panel is still hidden so viewport fitting does not jump.
      ref.updatePosition();
      this.positioned = true;
      this.reveal(pane, focusTraps);
    };
    const view = pane.ownerDocument.defaultView;
    if (view?.requestAnimationFrame) this.revealFrame = view.requestAnimationFrame(show);
    else show();
  }

  private startPositionTracking(pane: HTMLElement): void {
    if (this.mount) pane.ownerDocument.addEventListener('fullscreenchange', this.followFullscreen);
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
    this.host.nativeElement.ownerDocument.removeEventListener('fullscreenchange', this.followFullscreen);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    const view = this.host.nativeElement.ownerDocument.defaultView;
    view?.cancelAnimationFrame?.(this.positionFrame);
    view?.cancelAnimationFrame?.(this.revealFrame);
    this.positionFrame = 0;
    this.revealFrame = 0;
  }

  private readonly followFullscreen = (): void => {
    const ref = this.overlayRef;
    if (!ref?.hasAttached() || !this.open()) return;
    const host = ref.hostElement;
    const document = host.ownerDocument;
    if (!host.isConnected || !host.hasAttribute('popover') ||
      (document.fullscreenElement && !document.fullscreenElement.contains(host))) return;

    const pane = ref.overlayElement;
    const active = document.activeElement;
    pane.removeEventListener('focusout', this.onFocusOut);
    // Entering fullscreen can move the scene above an already open top-layer host.
    host.hidePopover();
    host.showPopover();
    ref.updatePosition();
    if (active instanceof HTMLElement && pane.contains(active)) active.focus();
    pane.addEventListener('focusout', this.onFocusOut);
  };

  private reveal(pane: HTMLElement, focusTraps: FocusTrapFactory): void {
    pane.style.removeProperty('visibility');
    this.presence.enter(pane);
    const sequence = ++this.entrySequence;
    const transitions =
      pane
        .getAnimations?.()
        .filter(
          (animation) =>
            'transitionProperty' in animation && animation.transitionProperty === 'opacity',
        ) ?? [];
    void Promise.allSettled(transitions.map((transition) => transition.finished)).then(
      (results) => {
        if (
          sequence === this.entrySequence &&
          this.open() &&
          !this.destroyed &&
          results.every((result) => result.status === 'fulfilled')
        )
          this.popoverOpened.emit();
      },
    );
    if (this.preserveFocus) return;
    this.focusInside(pane, focusTraps);
  }

  private focusInside(pane: HTMLElement, focusTraps: FocusTrapFactory): void {
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
    this.entrySequence++;
    this.stopPositionTracking();
    const ref = this.overlayRef;
    if (!ref?.hasAttached()) return;
    ref.overlayElement.removeEventListener('focusout', this.onFocusOut);
    this.presence.leave(ref.overlayElement, () => {
      if (this.destroyed) return;
      ref.detach();
      this.popoverClosed.emit();
    });
  }

  private readonly keepHoverOpen = (): void => {
    if (this.popoverTrigger() === 'hover') clearTimeout(this.timer);
  };
  private readonly leaveHoverPanel = (event: PointerEvent): void => this.onPointerLeave(event);
  private readonly onFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget as Node | null;
    if (
      this.autoClose('focusOut') &&
      next &&
      !this.overlayRef?.overlayElement.contains(next) &&
      next !== this.host.nativeElement
    ) {
      this.close(false);
    }
  };
}
