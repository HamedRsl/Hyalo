import { EXAMPLE } from './examples/kbd';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyKbd } from '@hyalo/angular/kbd';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-kbd-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyKbd],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kbd.html',
  styleUrl: './phase3.css',
})
export default class KbdPage {
  protected readonly example = EXAMPLE;

  protected readonly rows: ApiRow[] = [
    { name: 'hyKbd', type: 'attribute', default: '', description: 'Styles a native kbd element.' },
  ];
}
