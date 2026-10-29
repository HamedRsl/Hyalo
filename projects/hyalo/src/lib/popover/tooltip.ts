import { AriaDescriber } from '@angular/cdk/a11y';
import {
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
  type OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
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
import { hyConnectedPositions, type HyPlacement } from '../overlay/positions';

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
  private panel: HyTooltipPanel | null = null;
  private showTimer: ReturnType<typeof setTimeout> | undefined;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;

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
    this.showTimer = setTimeout(() => this.attach(), delay);
  }

  /** Hides the tooltip now. */
  hide(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    this.overlayRef?.detach();
  }

  protected scheduleHide(): void {
    clearTimeout(this.showTimer);
    this.hideTimer = setTimeout(() => this.hide(), 120);
  }

  private attach(): void {
    if (!this.overlayRef) {
      this.overlayRef = createOverlayRef(this.injector, {
        positionStrategy: createFlexibleConnectedPositionStrategy(this.injector, this.host)
          .withPositions(hyConnectedPositions(this.tooltipPlacement()))
          .withFlexibleDimensions(false)
          .withViewportMargin(8),
        scrollStrategy: createRepositionScrollStrategy(this.injector),
        panelClass: 'hy-tooltip-pane',
      });
      // Hovering the tooltip itself keeps it open.
      this.overlayRef.overlayElement.addEventListener('pointerenter', () =>
        clearTimeout(this.hideTimer),
      );
      this.overlayRef.overlayElement.addEventListener('pointerleave', () => this.scheduleHide());
    }
    if (this.overlayRef.hasAttached()) return;
    const ref = this.overlayRef.attach(new ComponentPortal(HyTooltipPanel, null, this.injector));
    this.panel = ref.instance;
    this.panel.message.set(this.message());
    ref.onDestroy(() => (this.panel = null));
  }
}
