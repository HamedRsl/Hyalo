import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_ACCORDION, HySwitch } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-accordion-page',
  imports: [DocsPage, DocsExample, DocsApiTable, HY_ACCORDION, HySwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page
      heading="Accordion"
      lead="Stacked sections that open in place. Built on Angular Aria."
    >
      <docs-example [code]="code" column>
        <hy-switch [(checked)]="multiple">Allow several open at once</hy-switch>
        <hy-accordion [multiple]="multiple()">
          <hy-accordion-item heading="Delivery" [headingLevel]="3" [(expanded)]="first">
            Three to five working days inside the EU. Tracking arrives by email.
          </hy-accordion-item>
          <hy-accordion-item heading="Returns">
            Send it back within 30 days in the original box for a full refund.
          </hy-accordion-item>
          <hy-accordion-item heading="Warranty"
            >Five years on the movement and the case.</hy-accordion-item
          >
          <hy-accordion-item heading="Engraving" disabled>Coming soon.</hy-accordion-item>
        </hy-accordion>
      </docs-example>

      <h2>Accessibility</h2>
      <ul>
        <li>
          Each header is a real heading with a button inside. Pick <code>headingLevel</code> to fit
          the page outline.
        </li>
        <li>Up and Down move between headers, Home and End jump to the ends.</li>
        <li>Closed panels are hidden from the accessibility tree, not just collapsed.</li>
        <li>
          The height animation uses grid rows, so content of any size opens smoothly and reduced
          motion turns it off.
        </li>
      </ul>

      <h2>API</h2>
      <p><code>hy-accordion</code></p>
      <docs-api-table [rows]="groupRows" />
      <p><code>hy-accordion-item</code></p>
      <docs-api-table [rows]="itemRows" />
    </docs-page>
  `,
})
export default class AccordionPage {
  protected readonly multiple = signal(false);
  protected readonly first = signal(true);

  protected readonly code = `<hy-accordion [multiple]="multiple()">
  <hy-accordion-item heading="Delivery" [(expanded)]="first">...</hy-accordion-item>
  <hy-accordion-item heading="Returns">...</hy-accordion-item>
  <hy-accordion-item heading="Engraving" disabled>...</hy-accordion-item>
</hy-accordion>`;
  protected readonly groupRows: ApiRow[] = [
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: 'Lets several items stay open.',
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every item.' },
    {
      name: 'hyMaterial',
      type: 'HyMaterial',
      default: 'config',
      description: 'Glass material of the group.',
    },
  ];
  protected readonly itemRows: ApiRow[] = [
    { name: 'heading', type: 'string', default: "''", description: 'Text of the header button.' },
    {
      name: 'headingLevel',
      type: 'number',
      default: '3',
      description: 'Level of the wrapping heading.',
    },
    {
      name: 'expanded',
      type: 'model<boolean>',
      default: 'false',
      description: 'Open state. Two-way bindable.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Skipped by the keyboard and cannot open.',
    },
  ];
}
