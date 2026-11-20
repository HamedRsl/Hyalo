import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
  numberAttribute,
  Directive,
  TemplateRef,
  contentChild,
  contentChildren,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AccordionGroup, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';
import { HyIcon } from '@hyalo/angular/icon';

import { HyMaterialDirective } from '@hyalo/angular/core';

/** Content created only when its section first opens. */
@Directive({ selector: 'ng-template[hyAccordionContent]' })
export class HyAccordionContent {
  readonly template = inject(TemplateRef<unknown>);
}

@Directive({ selector: 'ng-template[hyAccordionIcon]' })
export class HyAccordionIcon {
  readonly template = inject(TemplateRef<unknown>);
}

/**
 * One collapsible section. The panel content stays in the DOM while closed
 * (marked `inert`), so in-page search and FAQ structured data still see it.
 */
@Component({
  selector: 'hy-accordion-item',
  imports: [AccordionTrigger, AccordionPanel, HyIcon, NgTemplateOutlet],
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
  readonly destroyOnClose = input(false, { transform: booleanAttribute });
  readonly hideIcon = input(false, { transform: booleanAttribute });
  /** Manual mode leaves expansion to the public model/controller. */
  readonly toggleTrigger = input<'header' | 'manual'>('header');
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly animationComplete = output<boolean>();
  protected readonly lazy = contentChild(HyAccordionContent);
  protected readonly customIcon = contentChild(HyAccordionIcon);
  protected readonly created = signal(false);
  private initial = true;
  constructor() {
    effect(() => {
      const open = this.expanded();
      if (open) this.created.set(true);
      else if (this.destroyOnClose()) this.created.set(false);
      if (this.initial) { this.initial = false; return; }
      if (open) this.opened.emit();
      else this.closed.emit();
    });
  }
  protected completed(event: TransitionEvent): void {
    if (event.target === event.currentTarget && event.propertyName === 'grid-template-rows')
      this.animationComplete.emit(this.expanded());
  }
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
export class HyAccordion {
  private readonly items = contentChildren(HyAccordionItem);
  /** Expands enabled sections. A single-open group retains only the final section. */
  expandAll(): void { for (const item of this.items()) if (!item.disabled()) item.expanded.set(true); }
  collapseAll(): void { for (const item of this.items()) if (!item.disabled()) item.expanded.set(false); }
  toggleAll(): void {
    if (this.items().some((item) => !item.disabled() && !item.expanded())) this.expandAll();
    else this.collapseAll();
  }
}

/** Everything needed to build an accordion. */
export const HY_ACCORDION = [HyAccordion, HyAccordionItem, HyAccordionContent, HyAccordionIcon] as const;
