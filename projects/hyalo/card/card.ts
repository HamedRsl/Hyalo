import { ChangeDetectionStrategy, Component, Directive, input } from '@angular/core';
import { HyMaterialDirective } from '@hyalo/angular';

/** Inner spacing of a card. */
export type HyCardPadding = 'none' | 'sm' | 'md' | 'lg';

/** Full-bleed media at the top of a card: an image, video or canvas. */
@Directive({ selector: '[hyCardMedia]', host: { class: 'hy-card__media' } })
export class HyCardMedia {}

/** Title area. Put the card's heading here. */
@Directive({ selector: '[hyCardHeader]', host: { class: 'hy-card__header' } })
export class HyCardHeader {}

/** Actions or meta at the bottom. */
@Directive({ selector: '[hyCardFooter]', host: { class: 'hy-card__footer' } })
export class HyCardFooter {}

/**
 * Makes one link inside the card cover the whole card, so the card is
 * clickable while screen readers still hear a single, well-named link.
 * Other buttons in the card stay clickable on top of it.
 */
@Directive({ selector: 'a[hyCardLink]', host: { class: 'hy-card__link' } })
export class HyCardLink {}

/**
 * The kit's signature surface: a glass panel with optional media, header,
 * body and footer.
 *
 * ```html
 * <hy-card material="clear" hyTilt>
 *   <img hyCardMedia src="watch.avif" alt="" />
 *   <h3 hyCardHeader><a hyCardLink routerLink="/watch/1">Calibre 7</a></h3>
 *   <p>Hand-wound, 42 mm, sapphire caseback.</p>
 *   <div hyCardFooter>From 4 200 EUR</div>
 * </hy-card>
 * ```
 */
@Component({
  selector: 'hy-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: HyMaterialDirective, inputs: ['hyMaterial: material'] }],
  host: {
    class: 'hy-card',
    '[attr.data-padding]': 'padding()',
  },
  template: `
    <ng-content select="[hyCardMedia]" />
    <ng-content select="[hyCardHeader]" />
    <div class="hy-card__body"><ng-content /></div>
    <ng-content select="[hyCardFooter]" />
  `,
  styleUrl: './card.css',
})
export class HyCard {
  /** Inner spacing. Media always stays full bleed. */
  readonly padding = input<HyCardPadding>('md');
}

/** Everything needed to build a card. */
export const HY_CARD = [HyCard, HyCardMedia, HyCardHeader, HyCardFooter, HyCardLink] as const;
