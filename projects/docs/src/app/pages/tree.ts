import { EXAMPLE } from './examples/tree';
import {ChangeDetectionStrategy,Component,signal} from '@angular/core';
import {HyTree, type HyTreeNode} from '@hyalo/angular/tree';

import {HyButton} from '@hyalo/angular/button';
import {DocsPage} from '../shared/page';
import {DocsExample} from '../shared/example';
import {DocsImport} from '../shared/import';
import {DocsApiTable} from '../shared/api-table';
import {PHASE6_API} from './phase6-api';
@Component({selector:'docs-tree-page',imports:[HyTree,HyButton,DocsPage,DocsExample,DocsImport,DocsApiTable],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./tree.html',styleUrl:'./phase6.css'})
export default class TreePage{
  protected readonly example = EXAMPLE;

protected readonly rows=PHASE6_API['tree']??[];

protected readonly nodes:readonly HyTreeNode[]=[{key:'workspace',label:'Workspace',children:[{key:'design',label:'Design',children:[{key:'tokens',label:'Tokens',leaf:true},{key:'components',label:'Components',leaf:true}]},{key:'engineering',label:'Engineering',children:[{key:'client',label:'Client',leaf:true},{key:'services',label:'Services',leaf:true}]}]}];
protected readonly expanded=signal<readonly (string|number)[]>(['workspace','design']);
protected readonly checked=signal<readonly (string|number)[]>([]);
protected readonly search=signal('');

}
