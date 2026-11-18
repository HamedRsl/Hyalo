
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy,Component,TemplateRef,computed,inject,input,model,output,viewChild } from '@angular/core';
import { HyLocale,normalizeSearch } from '@hyalo/angular/core';
import { HyDataGrid,decodeHyGridState,compareHyGridValues,filterHyGridValue,type HyGridColumn,type HyGridConfig,type HyGridSort,type HyGridFilter,type HyGridEdit,type HyGridCsvOptions,type HyGridCellContext,type HyGridRowMetadata } from '@hyalo/angular/data-grid';
import { flattenHyTree,type HyTreeNode,type HyTreeKey } from '@hyalo/angular/tree';
export interface HyTreeTableExpand<T>{readonly node:HyTreeNode<T>;readonly expanded:boolean;}
@Component({selector:'hy-tree-table',imports:[HyDataGrid,NgTemplateOutlet],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./tree-table.html',styleUrl:'./tree-table.css'})
export class HyTreeTable<T>{
 readonly nodes=model.required<readonly HyTreeNode<T>[]>();
 readonly columns=input.required<readonly HyGridColumn<HyTreeNode<T>>[]>();readonly caption=input.required<string>();
 readonly config=input<HyGridConfig>({});readonly disabled=input(false);readonly loading=input(false);readonly error=input('');readonly locale=input<string>();
 readonly expandedKeys=model<readonly HyTreeKey[]>([]);readonly selected=model<readonly HyTreeKey[]>([]);
 readonly sorts=model<readonly HyGridSort[]>([]);readonly filters=model<readonly HyGridFilter[]>([]);readonly search=model('');
 readonly loadingKeys=input<readonly HyTreeKey[]>([]);readonly indent=input(24);
 readonly canCommit=input<(edit:HyGridEdit<HyTreeNode<T>>)=>boolean|Promise<boolean>>(()=>true);
 readonly expanded=output<HyTreeTableExpand<T>>();readonly loadRequested=output<HyTreeNode<T>>();readonly editCommitted=output<HyGridEdit<HyTreeNode<T>>>();readonly rowActivated=output<HyTreeNode<T>>();readonly retryRequested=output<void>();
 private readonly globalLocale=inject(HyLocale);readonly grid=viewChild(HyDataGrid<HyTreeNode<T>>);protected readonly hierarchy=viewChild.required<TemplateRef<HyGridCellContext<HyTreeNode<T>>>>('hierarchy');
 protected readonly options=computed(()=>({...this.config(),pagination:false,showToolbar:false}));
 protected readonly records=computed(()=>{
  flattenHyTree(this.nodes());const locale=this.locale()??this.globalLocale.locale(),query=normalizeSearch(this.search(),locale),collator=new Intl.Collator(locale,{numeric:true,sensitivity:'base'}),columns=this.columns(),expanded=new Set(this.expandedKeys()),filtering=!!query||!!this.filters().length;
  const visit=(nodes:readonly HyTreeNode<T>[]):readonly HyTreeNode<T>[]=>nodes.filter(node=>!node.hidden).map(node=>({...node,children:node.children?visit(node.children):undefined})).filter(node=>!filtering||!!node.children?.length||(this.filters().every(filter=>{const column=columns.find(item=>item.id===filter.column);return !!column&&filterHyGridValue(column.cell(node),filter,locale);})&&(!query||columns.some(column=>normalizeSearch(String(column.cell(node)??''),locale).includes(query))))).sort((a,b)=>{for(const sort of this.sorts()){const column=columns.find(item=>item.id===sort.column);if(!column?.sortable)continue;const compared=column.compare?.(a,b)??compareHyGridValues(column.cell(a),column.cell(b),collator);if(compared)return compared*(sort.direction==='asc'?1:-1);}return 0;});
  const roots=visit(this.nodes());return flattenHyTree(roots,filtering?undefined:expanded);
 });
 protected readonly rows=computed(()=>this.records().map(item=>item.node));
 protected readonly metadataMap=computed(()=>new Map(this.records().map(item=>[item.node.key,{level:item.level,position:item.position,siblingCount:item.siblingCount,expanded:this.expandable(item.node)?(!!this.search()||!!this.filters().length||this.expandedKeys().includes(item.node.key)):undefined}])));
 protected readonly gridColumns=computed(()=>this.columns().map((column,index)=>index===0?{...column,template:this.hierarchy()}:column));
 protected readonly key=(node:HyTreeNode<T>):HyTreeKey=>node.key;
 protected readonly rowLabel=(node:HyTreeNode<T>):string=>node.label;
 protected readonly rowDisabled=(node:HyTreeNode<T>):boolean=>!!node.disabled;
 protected readonly metadata=(node:HyTreeNode<T>):HyGridRowMetadata=>this.metadataMap().get(node.key)??{};
 protected readonly firstColumn=computed(()=>this.columns()[0]);
 protected expandable(node:HyTreeNode<T>):boolean{return node.leaf===false||!!node.children?.length;}
 toggle(key:HyTreeKey,open?:boolean):void{
  const node=flattenHyTree(this.nodes()).find(item=>item.node.key===key)?.node;if(!node||this.disabled()||node.disabled||!this.expandable(node))return;
  const keys=new Set(this.expandedKeys()),expanded=open??!keys.has(key);if(expanded)keys.add(key);else keys.delete(key);this.expandedKeys.set([...keys]);this.expanded.emit({node,expanded});if(expanded&&node.leaf===false&&!node.children&&!this.loadingKeys().includes(key))this.loadRequested.emit(node);
 }
 expandAll():void{if(!this.disabled())this.expandedKeys.set(flattenHyTree(this.nodes()).filter(item=>this.expandable(item.node)).map(item=>item.node.key));}
 collapseAll():void{if(!this.disabled())this.expandedKeys.set([]);}
 protected committed(edit:HyGridEdit<HyTreeNode<T>>):void{
  const visit=(nodes:readonly HyTreeNode<T>[]):readonly HyTreeNode<T>[]=>nodes.map(node=>node.key===edit.key?{...edit.next,children:node.children}:node.children?{...node,children:visit(node.children)}:node);
  this.nodes.update(visit);this.editCommitted.emit(edit);
 }
 protected keys(event:{readonly row:HyTreeNode<T>;readonly column:string;readonly originalEvent:KeyboardEvent}):void{
  if(event.column!==this.columns()[0]?.id||event.originalEvent.altKey)return;const key=event.originalEvent.key,node=event.row;
  if(key==='ArrowRight'&&this.expandable(node)&&!this.expandedKeys().includes(node.key)){event.originalEvent.preventDefault();event.originalEvent.stopPropagation();this.toggle(node.key,true);}
  else if(key==='ArrowLeft'){const item=this.records().find(item=>item.node.key===node.key);if(this.expandedKeys().includes(node.key)){event.originalEvent.preventDefault();event.originalEvent.stopPropagation();this.toggle(node.key,false);}else if(item?.parent!==null&&item?.parent!==undefined){event.originalEvent.preventDefault();event.originalEvent.stopPropagation();this.focusNode(item.parent);}}
 }
 focusNode(key:HyTreeKey):void{const column=this.columns()[0];if(column)this.grid()?.focusCell(key,column.id);}
 exportCsv(options:HyGridCsvOptions={}):string{return this.grid()?.exportCsv(options)??'';}
 saveState():string{const grid=this.grid()?.getState();return JSON.stringify({version:1,grid:grid?{...grid,query:{...grid.query,sorts:this.sorts(),filters:this.filters(),search:this.search()}}:null,expanded:this.expandedKeys()});}
 restoreState(text:string):void{const state:unknown=JSON.parse(text);if(!state||typeof state!=='object'||!('version'in state)||state.version!==1||!('grid'in state)||!('expanded'in state)||!Array.isArray(state.expanded))throw new Error('Invalid tree-table state');const ids=new Set(flattenHyTree(this.nodes()).map(item=>item.node.key));if(!state.expanded.every(key=>ids.has(key)))throw new Error('Unknown expanded tree key');const grid=decodeHyGridState(JSON.stringify(state.grid),this.columns().map(column=>column.id));this.grid()?.restoreState(JSON.stringify(grid));this.sorts.set(grid.query.sorts);this.filters.set(grid.query.filters);this.search.set(grid.query.search);this.expandedKeys.set(state.expanded);}
}
