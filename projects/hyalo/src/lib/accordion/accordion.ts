import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { AccordionGroup, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';
import { HyIcon } from '../icon/icon';
import { HyMaterialDirective } from '../material/material';

/**
 * One collapsible section. The panel content stays in the DOM while closed
 * (marked `inert`), so in-page search and FAQ structured data still see it.
 */
@Component({
  selector: 'hy-accordion-item',
  imports: [AccordionTrigger, AccordionPanel, HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-accordion-item',
    '[attr.data-open]': 'expanded() || null',
  },
  templateUrl: './accordion-item.html',
  styleUrl: './accordion.css',
})
export class HyAccordionItem {
  /** Text of the header button. */
  readonly heading = input('');
  /** Heading level of the header, 2 to 6. Pick the one that fits the page outline. */
  readonly headingLevel = input(3, { transform: numberAttribute });
  /** Whether the section is open. Two-way bindable. */
  readonly expanded = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
}

/**
 * A stack of collapsible sections on Angular Aria. Arrow keys move between
 * headers, Home and End jump to the ends, Enter or Space toggles.
 *
 * ```html
 * <hy-accordion>
 *   <hy-accordion-item heading="How long does delivery take?">Three to five working days.</hy-accordion-item>
 *   <hy-accordion-item heading="Can I return it?">Within 30 days, free of charge.</hy-accordion-item>
 * </hy-accordion>
 * ```
 *
 * Only one section is open at a time unless `multiple` is set. Opening and
 * closing animate the height with CSS grid, which costs no layout script.
 */
@Component({
  selector: 'hy-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    { directive: AccordionGroup, inputs: ['multiExpandable: multiple', 'disabled'] },
    { directive: HyMaterialDirective, inputs: ['hyMaterial: material'] },
  ],
  host: { class: 'hy-accordion' },
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
      border-radius: var(--hy-radius-l);
      padding-inline: var(--hy-space-5);
    }
  `,
})
export class HyAccordion {}

/** Everything needed to build an accordion. */
export const HY_ACCORDION = [HyAccordion, HyAccordionItem] as const;
