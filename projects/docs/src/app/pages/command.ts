import { EXAMPLE } from './examples/command';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HyCommand } from '@hyalo/angular/command';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-command-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './command.html',
  styleUrl: './phase3.css',
})
export default class CommandPage {
  protected readonly example = EXAMPLE;

  private readonly command = inject(HyCommand);
  protected readonly chosen = signal('');
  protected search(): void {
    this.command
      .open({
        label: 'Search workspace',
        items: [
          {
            id: 'overview',
            label: 'Overview',
            description: 'Revenue and activity',
            group: 'Pages',
            value: 'overview',
          },
          {
            id: 'projects',
            label: 'Projects',
            keywords: ['work', 'tasks'],
            group: 'Pages',
            value: 'projects',
          },
          { id: 'export', label: 'Export report', group: 'Actions', value: 'export' },
          { id: 'archive', label: 'Archive workspace', value: 'archive', disabled: true },
        ],
      })
      .closed.subscribe((item) => {
        if (item) this.chosen.set('Selected ' + item.label);
      });
  }
  protected readonly rows: ApiRow[] = [
    {
      name: 'HyCommand.open(config)',
      type: 'DialogRef<HyCommandItem<T>>',
      default: '',
      description: 'Opens a focus-trapped palette; closed emits the chosen item.',
    },
    {
      name: 'config.items',
      type: 'readonly HyCommandItem<T>[]',
      default: 'required',
      description:
        'Stable id, label and typed value; optional keywords, group, description, shortcut, disabled.',
    },
    {
      name: 'config.label / placeholder / emptyLabel',
      type: 'string',
      default: 'English labels',
      description: 'Accessible search label and UI copy.',
    },
  ];
}
