import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/button-group';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyButtonGroup } from '@hyalo/angular/button-group';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-button-group-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HyButtonGroup, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button-group.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    { name: 'label', type: 'string', default: 'required', description: 'Accessible group name.' },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: 'horizontal',
      description: 'Layout direction.',
    },
  ];
}
