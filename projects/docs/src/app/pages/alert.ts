import { EXAMPLE } from './examples/alert';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyAlert } from '@hyalo/angular/alert';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-alert-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyAlert, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert.html',
  styleUrl: './phase3.css',
})
export default class AlertPage {
  protected readonly example = EXAMPLE;

  protected readonly visible = signal(true);
  protected readonly rows: ApiRow[] = [
    {
      name: 'tone',
      type: 'info | success | warning | danger',
      default: 'info',
      description: 'Semantic accent.',
    },
    { name: 'heading', type: 'string', default: '', description: 'Visible message heading.' },
    {
      name: 'announce',
      type: 'boolean',
      default: 'false',
      description: 'Opt-in status; danger uses alert.',
    },
    {
      name: 'visible',
      type: 'model<boolean>',
      default: 'true',
      description: 'Controlled message visibility.',
    },
    {
      name: 'dismissible / dismissLabel / dismissed',
      type: 'boolean / string / output<void>',
      default: 'false / Dismiss message',
      description: 'Dismissal control and notification.',
    },
  ];
}
