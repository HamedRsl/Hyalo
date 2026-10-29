import { AriaDescriber } from '@angular/cdk/a11y';
import type { FlexibleConnectedPositionStrategy, OverlayRef } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  booleanAttribute,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import {
  hyConnectedPositions,
  type HyPlacement,
  ɵHyPresence as HyPresence,
} from '@hyalo/angular/overlay';
import { loadOverlay } from './load-overlay';

@Component({
  selector: 'hy-tooltip-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hy-tooltip', 'aria-hidden': 'true' },
  template: `{{ message() }}`,
})
export class HyTooltipPanel {
  readonly message = signal('');
}

/**
 * A short text hint on hover or keyboard focus.
 *
 * ```html
 * <button hyButton iconOnly aria-label="Copy link" hyTooltip="Copy link">...</button>
 * ```
 *
 * The text is also added to the trigger's `aria-describedby` through a
 * hidden element, so screen readers get it without the visual tooltip. The
 * tooltip stays open while the pointer is over it and closes on Escape, as
 * WCAG 1.4.13 asks. Keep it short and never put interactive content in it;
 * use `hyPopover` for that.
 */
@Directive({
  selector: '[hyTooltip]',
  host: {
    '(pointerenter)': 'onPointerEnter($event)',
    '(pointerleave)': 'scheduleHide()',
    '(focusin)': 'show(0)',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
  },
})
export class HyTooltip {
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly describer = inject(AriaDescriber);
  private overlayRef: OverlayRef | null = null;
  private position: FlexibleConnectedPositionStrategy | null = null;
  private panel: HyTooltipPanel | null = null;
  private panelEl: HTMLElement | null = null;
  private readonly presence = new HyPresence();
  private showTimer: ReturnType<typeof setTimeout> | undefined;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  /** True from show() until hide(), so a late overlay load knows to stop. */
  private wanted = false;
  private destroyed = false;

  /** The tooltip text. */
  readonly message = input('', { alias: 'hyTooltip' });
  /** Preferred side. Flips when there is no room. */
  readonly tooltipPlacement = input<HyPlacement>('top');
  /** Hover delay in milliseconds. Focus shows it right away. */
  readonly tooltipDelay = input(400, { transform: numberAttribute });
  readonly tooltipDisabled = input(false, { transform: booleanAttribute });

  constructor() {
    let described = '';
    effect(() => {
      const message = this.message();
      if (described) this.describer.removeDescription(this.host.nativeElement, described);
      if (message) this.describer.describe(this.host.nativeElement, message);
      described = message;
      if (this.panel) this.panel.message.set(message);
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      clearTimeout(this.showTimer);
      clearTimeout(this.hideTimer);
      if (described) this.describer.removeDescription(this.host.nativeElement, described);
      this.overlayRef?.dispose();
    });
  }

  protected onPointerEnter(event: PointerEvent): void {
    if (event.pointerType !== 'touch') this.show(this.tooltipDelay());
  }

  /** Shows the tooltip after the given delay. */
  show(delay = this.tooltipDelay()): void {
    if (this.tooltipDisabled() || !this.message()) return;
    clearTimeout(this.hideTimer);
    clearTimeout(this.showTimer);
    this.wanted = true;
    // Load during the hover delay, so the tooltip is ready when it ends.
    loadOverlay().catch(() => undefined);
    this.showTimer = setTimeout(() => void this.attach(), delay);
  }

  /** Starts hiding the tooltip now. It fades out quickly. */
  hide(): void {
    this.wanted = false;
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    const ref = this.overlayRef;
    if (!ref?.hasAttached() || !this.panelEl) return;
    this.presence.leave(this.panelEl, () => ref.detach());
  }

  protected scheduleHide(): void {
    clearTimeout(this.showTimer);
    this.hideTimer = setTimeout(() => this.hide(), 120);
  }

  private async attach(): Promise<void> {
    const kit = await loadOverlay().catch(() => null);
    if (!kit || !this.wanted || this.destroyed) return;
    const {
      ComponentPortal,
      createFlexibleConnectedPositionStrategy,
      createOverlayRef,
      createRepositionScrollStrategy,
    } = kit;
    if (!this.overlayRef) {
      this.position = createFlexibleConnectedPositionStrategy(this.injector, this.host)
        .withFlexibleDimensions(false)
        .withViewportMargin(8)
        .withTransformOriginOn('.hy-tooltip');
      this.overlayRef = createOverlayRef(this.injector, {
        positionStrategy: this.position,
        scrollStrategy: createRepositionScrollStrategy(this.injector),
        panelClass: 'hy-tooltip-pane',
      });
      // Hovering the tooltip itself keeps it open.
      this.overlayRef.overlayElement.addEventListener('pointerenter', () =>
        clearTimeout(this.hideTimer),
      );
      this.overlayRef.overlayElement.addEventListener('pointerleave', () => this.scheduleHide());
    }
    if (this.overlayRef.hasAttached()) {
      if (this.presence.leaving && this.panelEl) this.presence.enter(this.panelEl);
      return;
    }
    // Read on every show, so a changed placement applies next time.
    this.position?.withPositions(hyConnectedPositions(this.tooltipPlacement()));
    const ref = this.overlayRef.attach(new ComponentPortal(HyTooltipPanel, null, this.injector));
    this.panel = ref.instance;
    this.panel.message.set(this.message());
    const el = ref.location.nativeElement as HTMLElement;
    this.panelEl = el;
    this.presence.enter(el);
    ref.onDestroy(() => {
      this.panel = null;
      this.panelEl = null;
    });
  }
}
