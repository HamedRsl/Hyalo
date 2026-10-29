import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { HY_CONFIG } from '../core/config';
import type { HySize, HyTone } from '../core/axes';
import { HyFidelity } from '../fidelity/fidelity';
import { HyIcon } from '../icon/icon';
import { HyInteractive } from '../interaction/state';

/**
 * - `solid`: filled with the tone colour. The main action on a view.
 * - `glass`: a glass surface with tone-coloured text.
 * - `soft`: a light wash of the tone colour.
 * - `ghost`: text only, a surface appears on hover.
 */
export type HyButtonVariant = 'solid' | 'glass' | 'soft' | 'ghost';

/**
 * Button and link button.
 *
 * ```html
 * <button hyButton (click)="save()">Save</button>
 * <a hyButton variant="glass" routerLink="/pricing">Pricing</a>
 * <button hyButton iconOnly aria-label="Close"><hy-icon name="x" /></button>
 * ```
 *
 * It stays a native `<button>` or `<a>`, so forms, routing and keyboard
 * behaviour work as usual. A press dims and shrinks it the moment the
 * pointer goes down. Add `hyMagnetic` for the magnetic hover effect, or
 * `hyRipple` for a press ripple.
 *
 * While `loading`, the button keeps its focus and width, sets `aria-busy`
 * and ignores clicks. A disabled link gets `aria-disabled` and leaves the
 * tab order, since links have no native disabled state.
 */
@Component({
  // Attribute selector so the host stays a native <button> or <a>.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[hyButton], a[hyButton]',
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [HyInteractive],
  host: {
    class: 'hy-button',
    '[class.hy-glass]': 'variant() === "glass"',
    '[attr.data-material]': 'material()',
    // Buttons are small chips of glass, so they get the thinnest material.
    '[attr.data-thickness]': 'variant() === "glass" ? "thin" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-tone]': 'tone()',
    '[attr.data-icon-only]': 'iconOnly() || null',
    '[attr.data-loading]': 'loading() || null',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.aria-disabled]': 'blocked() || null',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.tabindex]': '!isButton && disabled() ? -1 : null',
  },
  template: `
    <span class="hy-button__label"><ng-content /></span>
    @if (loading()) {
      <span class="hy-button__spinner"><hy-icon name="spinner" /></span>
    }
  `,
  styleUrl: './button.css',
})
export class HyButton {
  private readonly config = inject(HY_CONFIG);
  private readonly fidelity = inject(HyFidelity);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isButton = this.el.tagName === 'BUTTON';

  /** Visual style. */
  readonly variant = input<HyButtonVariant>('solid');
  /** Height and padding. Defaults to the configured size. */
  readonly size = input<HySize>(this.config.size);
  /** Colour role. Defaults to the configured tone. */
  readonly tone = input<HyTone>(this.config.tone);
  /** Square button for a single icon. Give it an `aria-label`. */
  readonly iconOnly = input(false, { transform: booleanAttribute });
  /** Shows a spinner and blocks clicks without dropping focus. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Disables the button. On links this sets `aria-disabled`. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Glass follows the configured material and goes solid on the low tier. */
  protected readonly material = computed(() => {
    if (this.variant() !== 'glass') return null;
    return this.fidelity.tier() === 'low' ? 'solid' : this.config.material;
  });

  /** True when clicks should be ignored. */
  protected readonly blocked = computed(
    () => this.loading() || (!this.isButton && this.disabled()),
  );

  constructor() {
    // A capture listener on the element runs before the app's own (click)
    // handlers, so a blocked click never reaches them.
    this.el.addEventListener(
      'click',
      (event) => {
        if (!this.blocked()) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      { capture: true },
    );
  }
}
