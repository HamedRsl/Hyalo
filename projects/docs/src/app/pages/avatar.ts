import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/avatar';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HY_AVATAR } from '@hyalo/angular/avatar';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-avatar-page',
  imports: [DocsImport, DocsPage, DocsExample, DocsApiTable, HY_AVATAR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar.html',
  styleUrl: './showcase.css',
})
export default class ShowcasePage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'name',
      type: 'string',
      default: 'required',
      description: 'Accessible name and source for initials.',
    },
    {
      name: 'src',
      type: 'string',
      default: "''",
      description: 'Optional image source. Failed images fall back to initials.',
    },
    { name: 'size', type: 'HySize', default: 'md', description: 'sm, md or lg.' },
    {
      name: 'HyAvatarGroup.label',
      type: 'string',
      default: 'Team',
      description: 'Accessible group name.',
    },
    {
      name: '--hy-avatar-size',
      type: 'CSS length',
      default: 'size preset',
      description: 'Override avatar dimensions.',
    },
  ];
}
