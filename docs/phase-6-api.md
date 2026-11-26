# Phase 6 public API inventory

Generated from exported source with `node tools/sync-phase6-api.mjs`. Includes declared inputs, models, outputs, public methods, derived state, inherited field metadata, forwarded host-directive input/output, exported data/configuration types, and utility signatures. Engine-native options remain typed by FullCalendar and TipTap.

## data-grid

- `HyDataGrid.data`: `readonly T[]` (default: `[]`) - Two-way model; also exposes dataChange.
- `HyDataGrid.columns`: `readonly HyGridColumn<T>[]` (default: `required`) - Input.
- `HyDataGrid.rowKey`: `(row:T)=>HyGridKey` (default: `required`) - Input.
- `HyDataGrid.caption`: `string` (default: `required`) - Input.
- `HyDataGrid.config`: `HyGridConfig` (default: `{}`) - Input.
- `HyDataGrid.locale`: `string` - Input.
- `HyDataGrid.lazy`: `false` (default: `false`) - Input.
- `HyDataGrid.totalRecords`: `number|null` (default: `null`) - Input.
- `HyDataGrid.loading`: `false` (default: `false`) - Input.
- `HyDataGrid.error`: `''` (default: `''`) - Input.
- `HyDataGrid.disabled`: `false` (default: `false`) - Input.
- `HyDataGrid.page`: `1` (default: `1`) - Two-way model; also exposes pageChange.
- `HyDataGrid.pageSize`: `25` (default: `25`) - Two-way model; also exposes pageSizeChange.
- `HyDataGrid.sorts`: `readonly HyGridSort[]` (default: `[]`) - Two-way model; also exposes sortsChange.
- `HyDataGrid.filters`: `readonly HyGridFilter[]` (default: `[]`) - Two-way model; also exposes filtersChange.
- `HyDataGrid.search`: `''` (default: `''`) - Two-way model; also exposes searchChange.
- `HyDataGrid.groupBy`: `readonly string[]` (default: `[]`) - Two-way model; also exposes groupByChange.
- `HyDataGrid.expandedGroups`: `readonly string[]|null` (default: `null`) - Two-way model; also exposes expandedGroupsChange.
- `HyDataGrid.selected`: `readonly HyGridKey[]` (default: `[]`) - Two-way model; also exposes selectedChange.
- `HyDataGrid.columnWidths`: `Readonly<Record<string,number>>` (default: `{}`) - Two-way model; also exposes columnWidthsChange.
- `HyDataGrid.columnOrder`: `readonly string[]` (default: `[]`) - Two-way model; also exposes columnOrderChange.
- `HyDataGrid.hiddenColumns`: `readonly string[]` (default: `[]`) - Two-way model; also exposes hiddenColumnsChange.
- `HyDataGrid.expandedRows`: `readonly HyGridKey[]` (default: `[]`) - Two-way model; also exposes expandedRowsChange.
- `HyDataGrid.rowDetailTemplate`: `TemplateRef<{$implicit:T}>` - Input.
- `HyDataGrid.rowLabel`: `(row:T)=>string` (default: `()=>'Row'`) - Input.
- `HyDataGrid.rowDisabled`: `(row:T)=>boolean` (default: `()=>false`) - Input.
- `HyDataGrid.rowMetadata`: `(row:T)=>HyGridRowMetadata` (default: `()=>({})`) - Input.
- `HyDataGrid.treeGrid`: `false` (default: `false`) - Input.
- `HyDataGrid.canCommit`: `(edit:HyGridEdit<T>)=>boolean|Promise<boolean>` (default: `()=>true`) - Input.
- `HyDataGrid.queryChange`: `HyGridQuery` - Typed event.
- `HyDataGrid.rowActivated`: `T` - Typed event.
- `HyDataGrid.rowContext`: `{readonly row:T;readonly originalEvent:MouseEvent}` - Typed event.
- `HyDataGrid.editStarted`: `{readonly row:T;readonly column:string|null}` - Typed event.
- `HyDataGrid.editCommitted`: `HyGridEdit<T>` - Typed event.
- `HyDataGrid.editCancelled`: `{readonly row:T}` - Typed event.
- `HyDataGrid.editError`: `unknown` - Typed event.
- `HyDataGrid.columnResized`: `{readonly column:string;readonly width:number}` - Typed event.
- `HyDataGrid.columnsReordered`: `readonly string[]` - Typed event.
- `HyDataGrid.exported`: `{readonly csv:string;readonly filename:string;readonly count:number}` - Typed event.
- `HyDataGrid.retryRequested`: `void` - Typed event.
- `HyDataGrid.cellKeydown`: `{readonly row:T;readonly column:string;readonly originalEvent:KeyboardEvent}` - Typed event.
- `HyDataGrid.saving`: `false` - Read-only derived state.
- `HyDataGrid.options`: `()=>{const options={...HY_DATA_GRID_DEFAULT_CONFIG,...this.defaults,...this.config()};if(!Number.isFinite(options.rowHeight)||options.rowHeight<32||!Number.isFinite(options.height)||options.height<1||options.minBufferPx<0||options.maxBufferPx<options.minBufferPx)throw new RangeError('Invalid grid viewport geometry');return options;}` - Read-only derived state.
- `HyDataGrid.filteredData`: `()=>{   const data=this.data(),seen=new Set<HyGridKey>();for(const row of data){const key=this.rowKey()(row);if(seen.has(key))throw new Error('Duplicate row key: '+key);seen.add(key);}   if(this.lazy())return data;   const columns=new Map(this.columns().map(column=>[column.id,column])),locale=this.effectiveLocale(),query=normalizeSearch(this.search(),locale),collator=new Intl.Collator(locale,{numeric:true,sensitivity:'base'});   const result=data.filter(row=>this.filters().every(filter=>{const column=columns.get(filter.column);return !!column&&filterHyGridValue(column.cell(row),filter,locale);})&&(!query||this.columns().some(column=>normalizeSearch(String(column.cell(row)??''),locale).includes(query))));   return [...result].sort((a,b)=>{for(const sort of this.sorts()){const column=columns.get(sort.column);if(!column?.sortable)continue;const value=column.compare?column.compare(a,b):compareHyGridValues(column.cell(a),column.cell(b),collator);if(Number.isFinite(value)&&value)return value*(sort.direction==='asc'?1:-1);}return 0;});  }` - Read-only derived state.
- `HyDataGrid.total`: `()=>this.lazy()?Math.max(0,this.totalRecords()??this.data().length):this.filteredData().length` - Read-only derived state.
- `HyDataGrid.pageCount`: `()=>Math.max(1,Math.ceil(this.total()/this.size()))` - Read-only derived state.
- `HyDataGrid.query`: `HyGridQuery` - Read-only derived state.
- `HyDataGrid.pageData`: `()=>this.lazy()||!this.options().pagination?this.filteredData():this.filteredData().slice((this.currentPage()-1)*this.size(),this.currentPage()*this.size())` - Read-only derived state.
- `HyDataGrid.allSelected`: `()=>{const rows=this.selectionData().filter(row=>!this.rowDisabled()(row)),selected=new Set(this.selected());return rows.length>0&&rows.every(row=>selected.has(this.rowKey()(row)));}` - Read-only derived state.
- `HyDataGrid.someSelected`: `()=>!this.allSelected()&&this.selectionData().some(row=>this.selected().includes(this.rowKey()(row)))` - Read-only derived state.
- `HyDataGrid.setPage`: `setPage(page:number):void{i` - Public method.
- `HyDataGrid.setPageSize`: `setPageSize(size:number):void{i` - Public method.
- `HyDataGrid.setFilter`: `setFilter(filter:HyGridFilter|null,column?:string):void{i` - Public method.
- `HyDataGrid.setSearch`: `setSearch(search:string):void{i` - Public method.
- `HyDataGrid.toggleSort`: `toggleSort(column:string,multiple=false):void{` - Public method.
- `HyDataGrid.toggleRow`: `toggleRow(key:HyGridKey):void{` - Public method.
- `HyDataGrid.toggleAll`: `toggleAll():void{i` - Public method.
- `HyDataGrid.toggleGroup`: `toggleGroup(id:string):void{i` - Public method.
- `HyDataGrid.toggleDetails`: `toggleDetails(key:HyGridKey):void{i` - Public method.
- `HyDataGrid.setColumnVisible`: `setColumnVisible(id:string,visible:boolean):void{i` - Public method.
- `HyDataGrid.resizeColumn`: `resizeColumn(id:string,width:number):boolean{c` - Public method.
- `HyDataGrid.moveColumn`: `moveColumn(id:string,before:string):void{i` - Public method.
- `HyDataGrid.cancelInteractions`: `cancelInteractions():void{t` - Public method.
- `HyDataGrid.reorderColumn`: `reorderColumn(id:string,index:number):void{i` - Public method.
- `HyDataGrid.beginEdit`: `beginEdit(row:T,column:string|null=null):void{` - Public method.
- `HyDataGrid.updateEdit`: `updateEdit(column:string,value:HyGridValue):void{c` - Public method.
- `HyDataGrid.commitEdit`: `commitEdit():Promise<boolean>{` - Public method.
- `HyDataGrid.cancelEdit`: `cancelEdit():void{c` - Public method.
- `HyDataGrid.cancelResize`: `cancelResize():void{c` - Public method.
- `HyDataGrid.exportCsv`: `exportCsv(options:HyGridCsvOptions={}):string{` - Public method.
- `HyDataGrid.getState`: `getState():HyGridState{r` - Public method.
- `HyDataGrid.saveState`: `saveState():string{r` - Public method.
- `HyDataGrid.restoreState`: `restoreState(text:string):void{c` - Public method.
- `HyDataGrid.reset`: `reset():void{t` - Public method.
- `HyDataGrid.scrollToRow`: `scrollToRow(key:HyGridKey):void{c` - Public method.
- `HyDataGrid.focusCell`: `focusCell(key:HyGridKey,column:string):void{t` - Public method.
- `HyDataGrid.refresh`: `refresh():void{t` - Public method.

~~~ts
HY_DATA_GRID_DEFAULT_CONFIG:Required<HyGridConfig>={pagination:true,pageSizes:[10,25,50,100],virtualScroll:false,rowHeight:48,height:400,minBufferPx:100,maxBufferPx:250,selectionMode:'none',selectAllMode:'page',resizeColumns:true,reorderColumns:true,columnPicker:true,showFilters:false,showToolbar:true,editMode:'cell',emptyLabel:'No results',loadingLabel:'Loading rows',errorLabel:'Could not load rows',searchLabel:'Search rows',selectionLabel:'Select rows on this page'}
~~~

~~~ts
HY_DATA_GRID_DEFAULTS=new InjectionToken<HyGridConfig>('HY_DATA_GRID_DEFAULTS',{providedIn:'root',factory:()=>HY_DATA_GRID_DEFAULT_CONFIG})
~~~

~~~ts
export type HyGridKey=string|number;
~~~

~~~ts
export type HyGridValue=string|number|boolean|Date|null;
~~~

~~~ts
export type HyGridPrimitive=string|number|boolean|null;
~~~

~~~ts
export interface HyGridSort{readonly column:string;readonly direction:'asc'|'desc';}
~~~

~~~ts
export type HyGridFilter=
 | {readonly column:string;readonly operator:'contains'|'startsWith'|'endsWith';readonly value:string}
 | {readonly column:string;readonly operator:'eq'|'neq';readonly value:HyGridPrimitive}
 | {readonly column:string;readonly operator:'gt'|'gte'|'lt'|'lte';readonly value:number}
 | {readonly column:string;readonly operator:'between';readonly value:readonly[number,number]}
 | {readonly column:string;readonly operator:'in';readonly value:readonly HyGridPrimitive[]};
~~~

~~~ts
export interface HyGridCellContext<T>{readonly $implicit:T;readonly value:HyGridValue;readonly column:HyGridColumn<T>;readonly rowIndex:number;}
~~~

~~~ts
export interface HyGridEditorContext<T> extends HyGridCellContext<T>{readonly update:(value:HyGridValue)=>void;readonly commit:()=>void;readonly cancel:()=>void;}
~~~

~~~ts
export interface HyGridColumn<T>{
 readonly id:string;readonly header:string;readonly cell:(row:T)=>HyGridValue;
 readonly width?:number;readonly minWidth?:number;readonly maxWidth?:number;readonly sortable?:boolean;readonly filterable?:boolean;readonly resizable?:boolean;readonly reorderable?:boolean;
 readonly pinned?:'start'|'end';readonly align?:'start'|'center'|'end';readonly compare?:(a:T,b:T)=>number;readonly format?:(value:HyGridValue,row:T)=>string;
 readonly template?:TemplateRef<HyGridCellContext<T>>;readonly editorTemplate?:TemplateRef<HyGridEditorContext<T>>;
 readonly editor?:'text'|'number'|'checkbox'|'select';readonly options?:readonly {readonly value:HyGridPrimitive;readonly label:string}[];
 readonly write?:(row:T,value:HyGridValue)=>T;readonly validate?:(value:HyGridValue,row:T)=>string|null;
 readonly aggregate?:'sum'|'count'|'avg'|'min'|'max'|((rows:readonly T[])=>HyGridValue);readonly exportable?:boolean;
}
~~~

~~~ts
export interface HyGridQuery{readonly page:number;readonly pageSize:number;readonly first:number;readonly sorts:readonly HyGridSort[];readonly filters:readonly HyGridFilter[];readonly search:string;readonly groupBy:readonly string[];}
~~~

~~~ts
export interface HyGridConfig{
 readonly pagination?:boolean;readonly pageSizes?:readonly number[];readonly virtualScroll?:boolean;readonly rowHeight?:number;readonly height?:number;readonly minBufferPx?:number;readonly maxBufferPx?:number;
 readonly selectionMode?:'none'|'single'|'multiple';readonly selectAllMode?:'page'|'filtered';readonly resizeColumns?:boolean;readonly reorderColumns?:boolean;readonly columnPicker?:boolean;readonly showFilters?:boolean;readonly showToolbar?:boolean;
 readonly editMode?:'cell'|'row';readonly emptyLabel?:string;readonly loadingLabel?:string;readonly errorLabel?:string;readonly searchLabel?:string;readonly selectionLabel?:string;
}
~~~

~~~ts
export interface HyGridRowMetadata{readonly level?:number;readonly expanded?:boolean;readonly position?:number;readonly siblingCount?:number;}
~~~

~~~ts
export interface HyGridEdit<T>{readonly key:HyGridKey;readonly row:T;readonly next:T;readonly changes:Readonly<Record<string,HyGridValue>>;}
~~~

~~~ts
export interface HyGridState{readonly version:1;readonly query:HyGridQuery;readonly widths:Readonly<Record<string,number>>;readonly order:readonly string[];readonly hidden:readonly string[];readonly selected:readonly HyGridKey[];readonly expandedGroups?:readonly string[]|null;readonly expandedRows?:readonly HyGridKey[];}
~~~

~~~ts
export interface HyGridCsvOptions{readonly scope?:'page'|'filtered'|'selected';readonly delimiter?:','|';'|'\t';readonly filename?:string;readonly bom?:boolean;readonly download?:boolean;readonly escapeFormulae?:boolean;}
~~~

~~~ts
export function compareHyGridValues(a:HyGridValue,b:HyGridValue,collator:Intl.Collator):number{;
~~~

~~~ts
export function filterHyGridValue(value:HyGridValue,filter:HyGridFilter,locale:string):boolean{;
~~~

~~~ts
export function aggregateHyGrid<T>(rows:readonly T[],column:HyGridColumn<T>):HyGridValue{;
~~~

~~~ts
export function encodeHyGridState(state:HyGridState):string{;
~~~

~~~ts
export function decodeHyGridState(text:string,columns:readonly string[]):HyGridState{;
~~~

~~~ts
export function exportHyGridCsv<T>(rows:readonly T[],columns:readonly HyGridColumn<T>[],options:HyGridCsvOptions={}):string{;
~~~

## tree

- `HyTree.nodes`: `readonly HyTreeNode<T>[]` (default: `required`) - Input.
- `HyTree.label`: `'Tree'` (default: `'Tree'`) - Input.
- `HyTree.disabled`: `false` (default: `false`) - Input.
- `HyTree.selectionMode`: `'none'|'single'|'multiple'|'checkbox'` (default: `'single'`) - Input.
- `HyTree.selectedKeys`: `readonly HyTreeKey[]` (default: `[]`) - Two-way model; also exposes selectedKeysChange.
- `HyTree.checkedKeys`: `readonly HyTreeKey[]` (default: `[]`) - Two-way model; also exposes checkedKeysChange.
- `HyTree.expandedKeys`: `readonly HyTreeKey[]` (default: `[]`) - Two-way model; also exposes expandedKeysChange.
- `HyTree.checkStrictly`: `false` (default: `false`) - Input.
- `HyTree.filter`: `''` (default: `''`) - Two-way model; also exposes filterChange.
- `HyTree.locale`: `string` - Input.
- `HyTree.showLines`: `false` (default: `false`) - Input.
- `HyTree.indent`: `24` (default: `24`) - Input.
- `HyTree.loading`: `false` (default: `false`) - Input.
- `HyTree.emptyLabel`: `'No matching items'` (default: `'No matching items'`) - Input.
- `HyTree.loadChildren`: `HyTreeLoader<T>` - Input.
- `HyTree.nodeTemplate`: `TemplateRef<HyTreeNodeContext<T>>` - Input.
- `HyTree.draggable`: `false` (default: `false`) - Input.
- `HyTree.canDrop`: `(move:HyTreeMove)=>boolean` (default: `()=>true`) - Input.
- `HyTree.nodeActivated`: `HyTreeNodeEvent<T>` - Typed event.
- `HyTree.nodeContext`: `HyTreeNodeEvent<T>` - Typed event.
- `HyTree.expanded`: `{readonly node:HyTreeNode<T>;readonly expanded:boolean}` - Typed event.
- `HyTree.loadError`: `{readonly node:HyTreeNode<T>;readonly error:unknown}` - Typed event.
- `HyTree.moveRequested`: `HyTreeMove` - Typed event.
- `HyTree.resolved`: `()=>{flattenHyTree(this.nodes());const cache=this.loaded(),seen=new Set<HyTreeKey>();const visit=(nodes:readonly HyTreeNode<T>[]):readonly HyTreeNode<T>[]=>nodes.map(node=>{if(seen.has(node.key))throw new Error('Tree keys must be unique and acyclic');seen.add(node.key);return {...node,children:node.children?visit(node.children):cache.has(node.key)?visit(cache.get(node.key)??[]):undefined};});const nodes=visit(this.nodes());flattenHyTree(nodes);return nodes;}` - Read-only derived state.
- `HyTree.toggle`: `toggle(key:HyTreeKey,open?:boolean):void{` - Public method.
- `HyTree.expandAll`: `expandAll():void{i` - Public method.
- `HyTree.collapseAll`: `collapseAll():void{i` - Public method.
- `HyTree.selectAll`: `selectAll():void{i` - Public method.
- `HyTree.clearSelection`: `clearSelection():void{i` - Public method.
- `HyTree.focusNode`: `focusNode(key:HyTreeKey):void{t` - Public method.
- `HyTree.scrollActiveItemIntoView`: `scrollActiveItemIntoView():void{t` - Public method.
- `HyTree.requestMove`: `requestMove(move:HyTreeMove):boolean{i` - Public method.
- `HyTree.load`: `load(key:HyTreeKey):Promise<void>{` - Public method.

~~~ts
export type HyTreeKey=string|number;
~~~

~~~ts
export interface HyTreeNode<T=unknown>{
 readonly key:HyTreeKey;readonly label:string;readonly data?:T;readonly children?:readonly HyTreeNode<T>[];
 readonly leaf?:boolean;readonly disabled?:boolean;readonly selectable?:boolean;readonly checkable?:boolean;readonly icon?:string;readonly hidden?:boolean;
}
~~~

~~~ts
export interface HyFlatTreeNode<T>{readonly node:HyTreeNode<T>;readonly parent:HyTreeKey|null;readonly level:number;readonly position:number;readonly siblingCount:number;}
~~~

~~~ts
export function flattenHyTree<T>(nodes:readonly HyTreeNode<T>[],expanded?:ReadonlySet<HyTreeKey>):readonly HyFlatTreeNode<T>[]{
 const seen=new Set<HyTreeKey>(),result:HyFlatTreeNode<T>[]=[];
 const visit=(items:readonly HyTree;
~~~

~~~ts
export function setHyTreeChecked<T>(nodes:readonly HyTreeNode<T>[],current:readonly HyTreeKey[],key:HyTreeKey,checked:boolean,cascade=true):readonly HyTreeKey[]{;
~~~

~~~ts
export interface HyTreeMove{readonly key:HyTreeKey;readonly parent:HyTreeKey|null;readonly index:number;}
~~~

~~~ts
export function canMoveHyTreeNode<T>(nodes:readonly HyTreeNode<T>[],move:HyTreeMove):boolean{;
~~~

~~~ts
export interface HyTreeNodeContext<T>{readonly $implicit:HyTreeNode<T>;readonly level:number;readonly expanded:boolean;readonly selected:boolean;readonly checked:boolean;readonly indeterminate:boolean;}
~~~

~~~ts
export interface HyTreeNodeEvent<T>{readonly node:HyTreeNode<T>;readonly originalEvent?:Event;}
~~~

~~~ts
export type HyTreeLoader<T>=(node:HyTreeNode<T>,signal:AbortSignal)=>Promise<readonly HyTreeNode<T>[]>;
~~~

## tree-table

- `HyTreeTable.nodes`: `readonly HyTreeNode<T>[]` (default: `required`) - Two-way model; also exposes nodesChange.
- `HyTreeTable.columns`: `readonly HyGridColumn<HyTreeNode<T>>[]` (default: `required`) - Input.
- `HyTreeTable.caption`: `string` (default: `required`) - Input.
- `HyTreeTable.config`: `HyGridConfig` (default: `{}`) - Input.
- `HyTreeTable.disabled`: `false` (default: `false`) - Input.
- `HyTreeTable.loading`: `false` (default: `false`) - Input.
- `HyTreeTable.error`: `''` (default: `''`) - Input.
- `HyTreeTable.locale`: `string` - Input.
- `HyTreeTable.expandedKeys`: `readonly HyTreeKey[]` (default: `[]`) - Two-way model; also exposes expandedKeysChange.
- `HyTreeTable.selected`: `readonly HyTreeKey[]` (default: `[]`) - Two-way model; also exposes selectedChange.
- `HyTreeTable.sorts`: `readonly HyGridSort[]` (default: `[]`) - Two-way model; also exposes sortsChange.
- `HyTreeTable.filters`: `readonly HyGridFilter[]` (default: `[]`) - Two-way model; also exposes filtersChange.
- `HyTreeTable.search`: `''` (default: `''`) - Two-way model; also exposes searchChange.
- `HyTreeTable.loadingKeys`: `readonly HyTreeKey[]` (default: `[]`) - Input.
- `HyTreeTable.indent`: `24` (default: `24`) - Input.
- `HyTreeTable.canCommit`: `(edit:HyGridEdit<HyTreeNode<T>>)=>boolean|Promise<boolean>` (default: `()=>true`) - Input.
- `HyTreeTable.expanded`: `HyTreeTableExpand<T>` - Typed event.
- `HyTreeTable.loadRequested`: `HyTreeNode<T>` - Typed event.
- `HyTreeTable.editCommitted`: `HyGridEdit<HyTreeNode<T>>` - Typed event.
- `HyTreeTable.rowActivated`: `HyTreeNode<T>` - Typed event.
- `HyTreeTable.retryRequested`: `void` - Typed event.
- `HyTreeTable.toggle`: `toggle(key:HyTreeKey,open?:boolean):void{` - Public method.
- `HyTreeTable.expandAll`: `expandAll():void{i` - Public method.
- `HyTreeTable.collapseAll`: `collapseAll():void{i` - Public method.
- `HyTreeTable.focusNode`: `focusNode(key:HyTreeKey):void{c` - Public method.
- `HyTreeTable.exportCsv`: `exportCsv(options:HyGridCsvOptions={}):string{r` - Public method.
- `HyTreeTable.saveState`: `saveState():string{c` - Public method.
- `HyTreeTable.restoreState`: `restoreState(text:string):void{c` - Public method.

~~~ts
export interface HyTreeTableExpand<T>{readonly node:HyTreeNode<T>;readonly expanded:boolean;}
~~~

## virtual-scroller

- `HyVirtualScroller.items`: `readonly T[]` (default: `required`) - Input.
- `HyVirtualScroller.itemSize`: `48` (default: `48`) - Input.
- `HyVirtualScroller.height`: `360` (default: `360`) - Input.
- `HyVirtualScroller.orientation`: `'vertical'|'horizontal'` (default: `'vertical'`) - Input.
- `HyVirtualScroller.minBufferPx`: `100` (default: `100`) - Input.
- `HyVirtualScroller.maxBufferPx`: `240` (default: `240`) - Input.
- `HyVirtualScroller.templateCacheSize`: `20` (default: `20`) - Input.
- `HyVirtualScroller.appendOnly`: `false` (default: `false`) - Input.
- `HyVirtualScroller.itemTemplate`: `TemplateRef<HyVirtualItemContext<T>>` (default: `required`) - Input.
- `HyVirtualScroller.itemLabel`: `(item:T)=>string` (default: `required`) - Input.
- `HyVirtualScroller.trackBy`: `(item:T)=>string|number` (default: `required`) - Input.
- `HyVirtualScroller.label`: `'Scrollable items'` (default: `'Scrollable items'`) - Input.
- `HyVirtualScroller.loading`: `false` (default: `false`) - Input.
- `HyVirtualScroller.error`: `''` (default: `''`) - Input.
- `HyVirtualScroller.emptyLabel`: `'No items'` (default: `'No items'`) - Input.
- `HyVirtualScroller.loadingLabel`: `'Loading items'` (default: `'Loading items'`) - Input.
- `HyVirtualScroller.fallbackCount`: `12` (default: `12`) - Input.
- `HyVirtualScroller.rangeChanged`: `ListRange` - Typed event.
- `HyVirtualScroller.indexChanged`: `number` - Typed event.
- `HyVirtualScroller.retryRequested`: `void` - Typed event.
- `HyVirtualScroller.scrollToIndex`: `scrollToIndex(index:number,behavior:ScrollBehavior='auto'):void{t` - Public method.
- `HyVirtualScroller.scrollToOffset`: `scrollToOffset(offset:number,behavior:ScrollBehavior='auto'):void{t` - Public method.
- `HyVirtualScroller.scrollToEnd`: `scrollToEnd():void{t` - Public method.
- `HyVirtualScroller.checkViewportSize`: `checkViewportSize():void{t` - Public method.
- `HyVirtualScroller.measureScrollOffset`: `measureScrollOffset():number{r` - Public method.
- `HyVirtualScroller.getRenderedRange`: `getRenderedRange():ListRange{r` - Public method.

~~~ts
export interface HyVirtualItemContext<T>{readonly $implicit:T;readonly index:number;readonly count:number;readonly first:boolean;readonly last:boolean;readonly even:boolean;readonly odd:boolean;}
~~~

## kanban

- `HyKanban.columns`: `readonly HyKanbanColumn<T>[]` (default: `required`) - Two-way model; also exposes columnsChange.
- `HyKanban.lanes`: `readonly HyKanbanLane[]` (default: `[]`) - Input.
- `HyKanban.label`: `'Kanban board'` (default: `'Kanban board'`) - Input.
- `HyKanban.disabled`: `false` (default: `false`) - Input.
- `HyKanban.readonly`: `false` (default: `false`) - Input.
- `HyKanban.loading`: `false` (default: `false`) - Input.
- `HyKanban.error`: `''` (default: `''`) - Input.
- `HyKanban.emptyLabel`: `'No cards'` (default: `'No cards'`) - Input.
- `HyKanban.filter`: `''` (default: `''`) - Two-way model; also exposes filterChange.
- `HyKanban.locale`: `string` - Input.
- `HyKanban.dragDelay`: `150` (default: `150`) - Input.
- `HyKanban.cardTemplate`: `TemplateRef<HyKanbanCardContext<T>>` - Input.
- `HyKanban.columnTemplate`: `TemplateRef<{$implicit:HyKanbanColumn<T>}>` - Input.
- `HyKanban.canMove`: `(move:HyKanbanMove<T>)=>boolean|Promise<boolean>` (default: `()=>true`) - Input.
- `HyKanban.moveStarted`: `HyKanbanMove<T>` - Typed event.
- `HyKanban.moved`: `HyKanbanMove<T>` - Typed event.
- `HyKanban.moveRejected`: `HyKanbanMove<T>` - Typed event.
- `HyKanban.moveError`: `unknown` - Typed event.
- `HyKanban.cardActivated`: `HyKanbanCard<T>` - Typed event.
- `HyKanban.retryRequested`: `void` - Typed event.
- `HyKanban.pending`: `false` - Read-only derived state.
- `HyKanban.moveCard`: `moveCard(id:string,to:string,index?:number,lane?:string,source:'pointer'|'keyboard'|'api'='api'):Promise<boolean>{` - Public method.
- `HyKanban.cancelMove`: `cancelMove():void{t` - Public method.
- `HyKanban.cancelDrag`: `cancelDrag():void{t` - Public method.

~~~ts
export interface HyKanbanCard<T=unknown>{readonly id:string;readonly label:string;readonly description?:string;readonly data?:T;readonly lane?:string;readonly disabled?:boolean;readonly tone?:HyTone;}
~~~

~~~ts
export interface HyKanbanColumn<T=unknown>{readonly id:string;readonly label:string;readonly cards:readonly HyKanbanCard<T>[];readonly limit?:number;readonly disabled?:boolean;}
~~~

~~~ts
export interface HyKanbanLane{readonly id:string;readonly label:string;}
~~~

~~~ts
export interface HyKanbanMove<T>{readonly card:HyKanbanCard<T>;readonly from:string;readonly to:string;readonly index:number;readonly lane:string;readonly source:'pointer'|'keyboard'|'api';}
~~~

~~~ts
export interface HyKanbanCardContext<T>{readonly $implicit:HyKanbanCard<T>;readonly column:HyKanbanColumn<T>;readonly index:number;readonly move:(to:string,index?:number,lane?:string)=>Promise<boolean>;}
~~~

~~~ts
export function moveHyKanbanCard<T>(columns:readonly HyKanbanColumn<T>[],id:string,to:string,index:number,lane?:string):readonly HyKanbanColumn<T>[]|null{;
~~~

## scheduler

- `HyScheduler.label`: `string` (default: `required`) - Input.
- `HyScheduler.events`: `readonly EventInput[]` (default: `[]`) - Input.
- `HyScheduler.options`: `CalendarOptions` (default: `{}`) - Input.
- `HyScheduler.view`: `string` (default: `'dayGridMonth'`) - Two-way model; also exposes viewChange.
- `HyScheduler.date`: `string | null` (default: `null`) - Two-way model; also exposes dateChange.
- `HyScheduler.locale`: `string` - Input.
- `HyScheduler.timeZone`: `'local'` (default: `'local'`) - Input.
- `HyScheduler.direction`: `'ltr' | 'rtl'` - Input.
- `HyScheduler.editable`: `false` (default: `false`) - Input.
- `HyScheduler.selectable`: `false` (default: `false`) - Input.
- `HyScheduler.disabled`: `false` (default: `false`) - Input.
- `HyScheduler.height`: `number | string` (default: `'auto'`) - Input.
- `HyScheduler.showToolbar`: `true` (default: `true`) - Input.
- `HyScheduler.viewLabel`: `'View'` (default: `'View'`) - Input.
- `HyScheduler.views`: `readonly HySchedulerViewOption[]` (default: `[     { value: 'dayGridMonth', label: 'Month' },     { value: 'timeGridWeek', label: 'Week' },     { value: 'timeGridDay', label: 'Day' },     { value: 'listWeek', label: 'Agenda' },   ]`) - Input.
- `HyScheduler.showAgenda`: `true` (default: `true`) - Input.
- `HyScheduler.agendaLabel`: `'Event summary'` (default: `'Event summary'`) - Input.
- `HyScheduler.emptyLabel`: `'No events'` (default: `'No events'`) - Input.
- `HyScheduler.loadingLabel`: `'Loading calendar'` (default: `'Loading calendar'`) - Input.
- `HyScheduler.canChange`: `(change: HySchedulerChange) => boolean | Promise<boolean>` (default: `() => true`) - Input.
- `HyScheduler.initialized`: `CalendarApi` - Typed event.
- `HyScheduler.rangeChanged`: `DatesSetArg` - Typed event.
- `HyScheduler.eventClicked`: `EventClickArg` - Typed event.
- `HyScheduler.dateClicked`: `DateClickArg` - Typed event.
- `HyScheduler.selected`: `DateSelectArg` - Typed event.
- `HyScheduler.eventChanged`: `HySchedulerChange` - Typed event.
- `HyScheduler.changeRejected`: `HySchedulerChange` - Typed event.
- `HyScheduler.loadingChanged`: `boolean` - Typed event.
- `HyScheduler.failed`: `unknown` - Typed event.
- `HyScheduler.pending`: `0` - Read-only derived state.
- `HyScheduler.retry`: `retry(): void {` - Public method.
- `HyScheduler.getApi`: `getApi(): CalendarApi | undefined {` - Public method.
- `HyScheduler.next`: `next(): void {` - Public method.
- `HyScheduler.previous`: `previous(): void {` - Public method.
- `HyScheduler.today`: `today(): void {` - Public method.
- `HyScheduler.gotoDate`: `gotoDate(date: string): void {` - Public method.
- `HyScheduler.changeView`: `changeView(view: string, date?: string): void {` - Public method.
- `HyScheduler.refetchEvents`: `refetchEvents(): void {` - Public method.
- `HyScheduler.updateSize`: `updateSize(): void {` - Public method.

~~~ts
export type HySchedulerView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
~~~

~~~ts
export interface HySchedulerViewOption {
  readonly value: string;
  readonly label: string;
}
~~~

~~~ts
export interface HySchedulerChange {
  readonly kind: 'drop' | 'resize';
  readonly event: EventApi;
  readonly previous: EventApi;
  readonly related: readonly EventApi[];
  readonly revert: () => void;
}
~~~

~~~ts
HY_SCHEDULER_LOADER = new InjectionToken<() => Promise<typeof import('./engine')>>(
  'HY_SCHEDULER_LOADER',
  { providedIn: 'root', factory: () => loadEngine },
)
~~~

## splitter

- `HySplitter.panes`: `readonly HySplitterPane<T>[]` (default: `required`) - Input.
- `HySplitter.sizes`: `readonly number[]` (default: `[]`) - Two-way model; also exposes sizesChange.
- `HySplitter.collapsed`: `readonly string[]` (default: `[]`) - Two-way model; also exposes collapsedChange.
- `HySplitter.orientation`: `'horizontal'|'vertical'` (default: `'horizontal'`) - Input.
- `HySplitter.disabled`: `false` (default: `false`) - Input.
- `HySplitter.gutterSize`: `12` (default: `12`) - Input.
- `HySplitter.keyboardStep`: `2` (default: `2`) - Input.
- `HySplitter.minPaneSize`: `0` (default: `0`) - Input.
- `HySplitter.label`: `'Resizable panes'` (default: `'Resizable panes'`) - Input.
- `HySplitter.paneTemplate`: `TemplateRef<HySplitterContext<T>>` - Input.
- `HySplitter.height`: `string` (default: `'24rem'`) - Input.
- `HySplitter.resizeStarted`: `HySplitterResizeEvent` - Typed event.
- `HySplitter.resized`: `HySplitterResizeEvent` - Typed event.
- `HySplitter.resizeEnded`: `HySplitterResizeEvent` - Typed event.
- `HySplitter.resizeCancelled`: `HySplitterResizeEvent` - Typed event.
- `HySplitter.paneCollapsed`: `{readonly id:string;readonly collapsed:boolean}` - Typed event.
- `HySplitter.effectiveSizes`: `()=>constrainHyPaneSizes(this.sizes().length?this.sizes():this.panes().map(pane=>pane.size??1),this.constraints())` - Read-only derived state.
- `HySplitter.resize`: `resize(index:number,delta:number,source:'pointer'|'keyboard'|'api'='api'):boolean{` - Public method.
- `HySplitter.setSizes`: `setSizes(sizes:readonly number[]):void{i` - Public method.
- `HySplitter.togglePane`: `togglePane(id:string):void{` - Public method.
- `HySplitter.cancel`: `cancel():void{c` - Public method.

~~~ts
export interface HyPaneConstraint{readonly min?:number;readonly max?:number;}
~~~

~~~ts
export function constrainHyPaneSizes(sizes:readonly number[],constraints:readonly HyPaneConstraint[]):readonly number[]{;
~~~

~~~ts
export function normalizeHyPaneSizes(sizes:readonly number[],count:number):readonly number[]{;
~~~

~~~ts
export function resizeHyPanes(sizes:readonly number[],index:number,delta:number,constraints:readonly HyPaneConstraint[]):readonly number[]{;
~~~

~~~ts
export interface HySplitterPane<T=unknown>{readonly id:string;readonly label:string;readonly data?:T;readonly size?:number;readonly min?:number;readonly max?:number;readonly collapsible?:boolean;readonly template?:TemplateRef<HySplitterContext<T>>;}
~~~

~~~ts
export interface HySplitterContext<T>{readonly $implicit:HySplitterPane<T>;readonly index:number;readonly collapsed:boolean;}
~~~

~~~ts
export interface HySplitterResizeEvent{readonly index:number;readonly sizes:readonly number[];readonly source:'pointer'|'keyboard'|'api';}
~~~

## dashboard-layout

- `HyDashboardLayout.tiles`: `readonly HyDashboardTile<T>[]` (default: `required`) - Two-way model; also exposes tilesChange.
- `HyDashboardLayout.columns`: `12` (default: `12`) - Input.
- `HyDashboardLayout.rowHeight`: `80` (default: `80`) - Input.
- `HyDashboardLayout.gap`: `16` (default: `16`) - Input.
- `HyDashboardLayout.maxRows`: `100` (default: `100`) - Input.
- `HyDashboardLayout.label`: `'Dashboard layout'` (default: `'Dashboard layout'`) - Input.
- `HyDashboardLayout.disabled`: `false` (default: `false`) - Input.
- `HyDashboardLayout.readonly`: `false` (default: `false`) - Input.
- `HyDashboardLayout.draggable`: `true` (default: `true`) - Input.
- `HyDashboardLayout.resizable`: `true` (default: `true`) - Input.
- `HyDashboardLayout.mobileBreakpoint`: `640` (default: `640`) - Input.
- `HyDashboardLayout.tileTemplate`: `TemplateRef<HyDashboardTileContext<T>>` - Input.
- `HyDashboardLayout.headerTemplate`: `TemplateRef<HyDashboardTileContext<T>>` - Input.
- `HyDashboardLayout.canChange`: `(change:HyDashboardChange)=>boolean` (default: `()=>true`) - Input.
- `HyDashboardLayout.changeStarted`: `HyDashboardChange` - Typed event.
- `HyDashboardLayout.changed`: `HyDashboardChange` - Typed event.
- `HyDashboardLayout.changeRejected`: `HyDashboardChange` - Typed event.
- `HyDashboardLayout.changeCancelled`: `HyTileRect` - Typed event.
- `HyDashboardLayout.tileActivated`: `HyDashboardTile<T>` - Typed event.
- `HyDashboardLayout.layout`: `()=>{const tiles=this.tiles();if(!validateHyDashboardLayout(tiles,{columns:this.columns(),maxRows:this.maxRows()}))throw new Error('Dashboard tiles must be unique, non-overlapping, and within bounds');return tiles;}` - Read-only derived state.
- `HyDashboardLayout.moveTile`: `moveTile(id:string,x:number,y:number,source:'pointer'|'keyboard'|'api'='api'):boolean{i` - Public method.
- `HyDashboardLayout.resizeTile`: `resizeTile(id:string,width:number,height:number,source:'pointer'|'keyboard'|'api'='api'):boolean{i` - Public method.
- `HyDashboardLayout.cancelInteractions`: `cancelInteractions():void{t` - Public method.
- `HyDashboardLayout.cancelResize`: `cancelResize():void{c` - Public method.
- `HyDashboardLayout.compact`: `compact():void{i` - Public method.
- `HyDashboardLayout.setLayout`: `setLayout(layout:readonly HyTileRect[]):void{` - Public method.
- `HyDashboardLayout.saveLayout`: `saveLayout():string{r` - Public method.
- `HyDashboardLayout.restoreLayout`: `restoreLayout(text:string):void{t` - Public method.

~~~ts
export interface HyDashboardTile<T=unknown> extends HyTileRect{readonly label:string;readonly data?:T;readonly locked?:boolean;readonly minWidth?:number;readonly maxWidth?:number;readonly minHeight?:number;readonly maxHeight?:number;readonly template?:TemplateRef<HyDashboardTileContext<T>>;}
~~~

~~~ts
export interface HyDashboardTileContext<T>{readonly $implicit:HyDashboardTile<T>;readonly resize:(width:number,height:number)=>boolean;readonly move:(x:number,y:number)=>boolean;}
~~~

~~~ts
export interface HyDashboardChange{readonly id:string;readonly previous:HyTileRect;readonly next:HyTileRect;readonly source:'pointer'|'keyboard'|'api';}
~~~

~~~ts
export interface HyTileRect{readonly id:string;readonly x:number;readonly y:number;readonly width:number;readonly height:number;}
~~~

~~~ts
export interface HyTileBounds{readonly columns:number;readonly maxRows?:number;}
~~~

~~~ts
export function hyTilesOverlap(a:HyTileRect,b:HyTileRect):boolean{;
~~~

~~~ts
export function validateHyDashboardLayout(layout:readonly HyTileRect[],bounds:HyTileBounds):boolean{;
~~~

~~~ts
export function decodeHyDashboardLayout(text:string,bounds:HyTileBounds,ids:readonly string[]):readonly HyTileRect[]{;
~~~

~~~ts
export function compactHyDashboardLayout(layout:readonly HyTileRect[]):readonly HyTileRect[]{;
~~~

## context-menu

- `HyContextMenuTrigger.longPressDelay`: `0` (default: `0`) - Touch hold duration in milliseconds. Zero leaves native touch handling in place.
- `HyContextMenuTrigger.restoreFocus`: `boolean | HTMLElement` (default: `true`) - Restore focus on keyboard dismissal. May target a separate action button.
- `HyContextMenuTrigger.openAt`: `openAt(point: { readonly x: number; readonly y: number }): void {` - Public method.
- `HyContextMenuTrigger.openFromEvent`: `openFromEvent(event: MouseEvent): void {     const view = this.element.ownerDocument.defaultView;     if (!view || this.` - Opens this trigger at a context-menu event that originated elsewhere.
- `HyContextMenuTrigger.open`: `open(): void {` - Public method.
- `HyContextMenuTrigger.close`: `close(): void {` - Public method.
- `HyContextMenuTrigger.isOpen`: `isOpen(): boolean {` - Public method.
- `HyContextMenuTrigger.hyContextMenuTriggerFor`: `cdkContextMenuTriggerFor` - Forwarded inputs from the CDK/material host directive.
- `HyContextMenuTrigger.hyContextMenuData`: `cdkContextMenuTriggerData` - Forwarded inputs from the CDK/material host directive.
- `HyContextMenuTrigger.positions`: `cdkContextMenuPosition` - Forwarded inputs from the CDK/material host directive.
- `HyContextMenuTrigger.disabled`: `cdkContextMenuDisabled` - Forwarded inputs from the CDK/material host directive.
- `HyContextMenuTrigger.opened`: `cdkContextMenuOpened` - Forwarded outputs from the CDK/material host directive.
- `HyContextMenuTrigger.closed`: `cdkContextMenuClosed` - Forwarded outputs from the CDK/material host directive.
- `HyContextMenu.items`: `readonly HyContextAction<T>[]` (default: `[]`) - Input.
- `HyContextMenu.context`: `T | null` (default: `null`) - Input.
- `HyContextMenu.label`: `'Context actions'` (default: `'Context actions'`) - Input.
- `HyContextMenu.itemTemplate`: `TemplateRef<{ $implicit: HyContextAction<T>; context: T | null }>` - Input.
- `HyContextMenu.activated`: `HyContextActionEvent<T>` - Typed event.
- `HyContextMenu.activate`: `activate(action: HyContextAction<T>): void {` - Public method.
- `HyContextMenu.material`: `hyMaterial` - Forwarded inputs from the CDK/material host directive.

~~~ts
export interface HyContextAction<T = unknown> {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly shortcut?: string;
  readonly disabled?: boolean;
  readonly hidden?: boolean;
  readonly separator?: boolean;
  readonly checked?: boolean;
  readonly role?: 'item' | 'checkbox' | 'radio';
  readonly children?: readonly HyContextAction<T>[];
  readonly data?: T;
}
~~~

~~~ts
export interface HyContextActionEvent<T> {
  readonly action: HyContextAction<T>;
  readonly context: T | null;
}
~~~

## rich-text

- `HyRichText.value`: `JSONContent | null` (default: `null`) - Two-way model; also exposes valueChange.
- `HyRichText.placeholder`: `'Write something'` (default: `'Write something'`) - Input.
- `HyRichText.minHeight`: `'12rem'` (default: `'12rem'`) - Input.
- `HyRichText.maxHeight`: `'32rem'` (default: `'32rem'`) - Input.
- `HyRichText.toolbar`: `readonly HyRichTextAction[]` (default: `HY_RICH_TEXT_ACTIONS`) - Input.
- `HyRichText.showToolbar`: `true` (default: `true`) - Input.
- `HyRichText.showCount`: `true` (default: `true`) - Input.
- `HyRichText.characterLimit`: `number | null` (default: `null`) - Input.
- `HyRichText.images`: `false` (default: `false`) - Input.
- `HyRichText.links`: `true` (default: `true`) - Input.
- `HyRichText.starterKit`: `Partial<StarterKitOptions>` (default: `{}`) - Input.
- `HyRichText.extensions`: `Extensions | (() => Promise<Extensions>)` (default: `[]`) - Input.
- `HyRichText.editorOptions`: `Partial<EditorOptions>` (default: `{}`) - Input.
- `HyRichText.initialized`: `Editor` - Typed event.
- `HyRichText.updated`: `{     readonly json: JSONContent | null;     readonly html: string;     readonly text: string;   }` - Typed event.
- `HyRichText.selectionChanged`: `{ readonly from: number; readonly to: number }` - Typed event.
- `HyRichText.focused`: `void` - Typed event.
- `HyRichText.blurred`: `void` - Typed event.
- `HyRichText.failed`: `unknown` - Typed event.
- `HyRichText.run`: `run(command: HyRichTextCommand): boolean {` - Public method.
- `HyRichText.setLink`: `setLink(href: string): boolean {` - Public method.
- `HyRichText.insertImage`: `insertImage(src: string, alt = ''): boolean {` - Public method.
- `HyRichText.getEditor`: `getEditor(): Editor | undefined {` - Public method.
- `HyRichText.getHTML`: `getHTML(): string {` - Public method.
- `HyRichText.getText`: `getText(): string {` - Public method.
- `HyRichText.setHTML`: `setHTML(html: string): boolean {` - Public method.
- `HyRichText.focus`: `focus(): void {` - Public method.
- `HyRichText.reset`: `reset(): void {` - Public method.
- `HyRichText.retry`: `retry(): void {` - Public method.
- `HyValueControl.id`: `void` - Read-only derived state.
- `HyValueControl.label`: `''` (default: `''`) - Input.
- `HyValueControl.name`: `''` (default: `''`) - Input.
- `HyValueControl.disabled`: `false` (default: `false`) - Input.
- `HyValueControl.formDisabled`: `false` - Disabled state owned by the optional classic forms bridge.
- `HyValueControl.readonly`: `false` (default: `false`) - Input.
- `HyValueControl.required`: `false` (default: `false`) - Input.
- `HyValueControl.invalid`: `false` (default: `false`) - Input.
- `HyValueControl.touched`: `false` (default: `false`) - Input.
- `HyValueControl.dirty`: `false` (default: `false`) - Input.
- `HyValueControl.pending`: `false` (default: `false`) - Input.
- `HyValueControl.errors`: `readonly { readonly kind: string; readonly message?: string }[]` (default: `[]`) - Input.
- `HyValueControl.touch`: `void` - Typed event.
- `HyValueControl.errorMessage`: `() => this.errors()[0]?.message ?? this.errors()[0]?.kind` - Read-only derived state.
- `HyValueControl.focus`: `focus(): void {` - Public method.

~~~ts
export type HyRichTextCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'horizontalRule'
  | 'undo'
  | 'redo'
  | 'clear'
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3';
~~~

~~~ts
export interface HyRichTextAction {
  readonly command: HyRichTextCommand;
  readonly label: string;
}
~~~

~~~ts
HY_RICH_TEXT_ACTIONS: readonly HyRichTextAction[] = [
  { command: 'bold', label: 'Bold' },
  { command: 'italic', label: 'Italic' },
  { command: 'underline', label: 'Underline' },
  { command: 'strike', label: 'Strike through' },
  { command: 'heading2', label: 'Heading' },
  { command: 'bulletList', label: 'Bullet list' },
  { command: 'orderedList', label: 'Numbered list' },
  { command: 'blockquote', label: 'Quote' },
  { command: 'undo', label: 'Undo' },
  { command: 'redo', label: 'Redo' },
]
~~~

~~~ts
export function getHyRichTextText(value: JSONContent | null): string;
~~~

~~~ts
export function isHyRichTextUrl(value: string, image = false): boolean;
~~~

~~~ts
HY_RICH_TEXT_LOADER = new InjectionToken<() => Promise<typeof import('./engine')>>(
  'HY_RICH_TEXT_LOADER',
  { providedIn: 'root', factory: () => loadEngine },
)
~~~

## gauge

- `HyGauge.label`: `string` (default: `required`) - Input.
- `HyGauge.value`: `number | null` (default: `required`) - Input.
- `HyGauge.min`: `0` (default: `0`) - Input.
- `HyGauge.max`: `100` (default: `100`) - Input.
- `HyGauge.variant`: `'radial' | 'semicircle'` (default: `'radial'`) - Input.
- `HyGauge.tone`: `HyTone` (default: `'primary'`) - Input.
- `HyGauge.bands`: `readonly HyGaugeBand[]` (default: `[]`) - Input.
- `HyGauge.ticks`: `5` (default: `5`) - Input.
- `HyGauge.needle`: `false` (default: `false`) - Input.
- `HyGauge.showRange`: `true` (default: `true`) - Input.
- `HyGauge.locale`: `string` - Input.
- `HyGauge.format`: `Intl.NumberFormatOptions` (default: `{ maximumFractionDigits: 1 }`) - Input.
- `HyGauge.unit`: `''` (default: `''`) - Input.
- `HyGauge.valueText`: `''` (default: `''`) - Input.
- `HyGauge.emptyLabel`: `'No reading'` (default: `'No reading'`) - Input.

~~~ts
export interface HyGaugeBand {
  /** Inclusive upper bound. Supply translated threshold wording through valueText. */
  readonly to: number;
  readonly tone: HyTone;
}
~~~

~~~ts
export function pointOnGauge(angle: number, radius: number): { x: number; y: number };
~~~

~~~ts
export function gaugeArc(start: number, sweep: number, radius = 38): string;
~~~
