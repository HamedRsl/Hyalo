import { EXAMPLE } from './examples/hover-card';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyHoverCard } from '@hyalo/angular/hover-card';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-hover-card-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyHoverCard, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hover-card.html',
  styleUrl: './phase3.css',
})
export default class HoverCardPage {
  protected readonly example = EXAMPLE;

  protected readonly rows: ApiRow[] = [
    {
      name: 'hyHoverCard',
      type: 'TemplateRef<unknown>',
      default: 'required',
      description: 'Rich contextual content.',
    },
    {
      name: 'hoverCardLabel',
      type: 'string',
      default: 'required',
      description: 'Accessible dialog name.',
    },
    {
      name: 'placement',
      type: 'HyPlacement',
      default: 'top',
      description: 'Preferred position with collision handling.',
    },
    { name: 'show() / hide()', type: 'method', default: '', description: 'Explicit controls.' },
  ];
}
