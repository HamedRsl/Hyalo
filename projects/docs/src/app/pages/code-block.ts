import { EXAMPLE } from './examples/code-block';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HyCodeBlock } from '@hyalo/angular/code-block';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-code-block-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyCodeBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-block.html',
  styleUrl: './phase3.css',
})
export default class CodeBlockPage {
  protected readonly example = EXAMPLE;

  protected readonly sample =
    "import { HyTable } from '@hyalo/angular/table';\n\n// Supply stable keys so selection survives sorting.\nconst rowKey = (row: { id: string }) => row.id;";
  protected readonly rows: ApiRow[] = [
    {
      name: 'code',
      type: 'string',
      default: 'required',
      description: 'Rendered as text; HTML is never executed.',
    },
    {
      name: 'language / label',
      type: 'string',
      default: 'text / Code sample',
      description: 'Visible language and accessible name.',
    },
    {
      name: 'copyable',
      type: 'boolean',
      default: 'true',
      description: 'Shows a copy control with live status.',
    },
  ];
}
