import { EXAMPLE } from './examples/tree-table';
import {ChangeDetectionStrategy,Component,signal} from '@angular/core';
import {HyTreeTable} from '@hyalo/angular/tree-table';
import {type HyTreeNode} from '@hyalo/angular/tree';
import {type HyGridColumn} from '@hyalo/angular/data-grid';
import {DocsPage} from '../shared/page';
import {DocsExample} from '../shared/example';
import {DocsImport} from '../shared/import';
import {DocsApiTable} from '../shared/api-table';
import {PHASE6_API} from './phase6-api';
@Component({selector:'docs-tree-table-page',imports:[HyTreeTable,DocsPage,DocsExample,DocsImport,DocsApiTable],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./tree-table.html',styleUrl:'./phase6.css'})
export default class TreeTablePage{
  protected readonly example = EXAMPLE;

protected readonly rows=PHASE6_API['tree-table']??[];

protected readonly nodes=signal<readonly HyTreeNode<{size:number}>[]>([{key:'product',label:'Product',data:{size:140},children:[{key:'design',label:'Design',data:{size:48},leaf:true},{key:'app',label:'Application',data:{size:92},children:[{key:'core',label:'Core',data:{size:44},leaf:true},{key:'views',label:'Views',data:{size:48},leaf:true}]}]}]);
protected readonly expanded=signal<readonly (string|number)[]>(['product','app']);
protected readonly columns:readonly HyGridColumn<HyTreeNode<{size:number}>>[]=[{id:'name',header:'Folder',cell:node=>node.label,sortable:true,width:320,write:(node,value)=>({...node,label:String(value??'')})},{id:'size',header:'Size (MB)',cell:node=>node.data?.size??null,sortable:true,width:180}];

}
