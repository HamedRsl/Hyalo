import { EXAMPLE } from './examples/kanban';
import {ChangeDetectionStrategy,Component,signal} from '@angular/core';
import {HyKanban, type HyKanbanColumn} from '@hyalo/angular/kanban';

import {DocsPage} from '../shared/page';
import {DocsExample} from '../shared/example';
import {DocsImport} from '../shared/import';
import {DocsApiTable} from '../shared/api-table';
import {PHASE6_API} from './phase6-api';
@Component({selector:'docs-kanban-page',imports:[HyKanban,DocsPage,DocsExample,DocsImport,DocsApiTable],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./kanban.html',styleUrl:'./phase6.css'})
export default class KanbanPage{
  protected readonly example = EXAMPLE;

protected readonly rows=PHASE6_API['kanban']??[];

protected readonly columns=signal<readonly HyKanbanColumn[]>([
{id:'planned',label:'Planned',cards:[{id:'tokens',label:'Review design tokens',description:'Check contrast and semantic aliases',lane:'product'},{id:'docs',label:'Write integration guide',lane:'platform'}]},
{id:'active',label:'In progress',limit:3,cards:[{id:'grid',label:'Ship the data grid',description:'Finish keyboard and resize checks',lane:'product'}]},
{id:'done',label:'Done',cards:[{id:'core',label:'Publish core primitives',lane:'platform'}]}
]);

}
