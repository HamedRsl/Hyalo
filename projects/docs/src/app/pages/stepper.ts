import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/stepper';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_STEPPER } from '@hyalo/angular/stepper';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-stepper-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HY_STEPPER, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stepper.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly finished = signal<number | null>(null);
  protected readonly rows: ApiRow[] = [
    {
      name: 'selected',
      type: 'model<number>',
      default: '0',
      description:
        'Requested step index. Invalid or inaccessible values fall back to the first available step.',
    },
    {
      name: 'linear',
      type: 'boolean',
      default: 'true',
      description: 'Requires all previous steps to be completed before advancing.',
    },
    {
      name: 'HyStep.label',
      type: 'string',
      default: 'required',
      description: 'Navigation button label.',
    },
    {
      name: 'HyStep.completed / disabled',
      type: 'boolean',
      default: 'false',
      description: 'Completion gate and explicit disabled state.',
    },
    {
      name: 'select(index) / next() / previous()',
      type: 'methods',
      default: '',
      description: 'Navigate to an available step.',
    },
    { name: 'label', type: 'string', default: 'Steps', description: 'Accessible navigation name.' },
  ];
  protected readonly step = signal(0);
  protected readonly detailsDone = signal(false);
  protected readonly matterDone = signal(false);
}
