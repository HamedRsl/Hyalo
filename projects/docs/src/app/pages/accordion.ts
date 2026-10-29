import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_ACCORDION } from '@hyalo/angular/accordion';
import { HySwitch } from '@hyalo/angular/choice';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-accordion-page',
  imports: [DocsPage, DocsTokens, DocsExample, DocsApiTable, HY_ACCORDION, HySwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accordion.html',
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
