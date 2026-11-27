import { HySelect } from '@hyalo/angular/select';
import { HyIcon } from '@hyalo/angular/icon';
import { NgTemplateOutlet } from '@angular/common';
import { Grid,GridRow,GridCell,GridCellWidget } from '@angular/aria/grid';
import { CdkVirtualScrollViewport,CdkVirtualForOf,CdkFixedSizeVirtualScroll } from '@angular/cdk/scrolling';
import { CdkDrag,CdkDragHandle,CdkDropList,type CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy,Component,DestroyRef,ElementRef,InjectionToken,TemplateRef,afterNextRender,computed,effect,inject,input,model,output,signal,viewChild } from '@angular/core';
import { HyLocale,normalizeSearch,parseLocaleNumber } from '@hyalo/angular/core';
import { aggregateHyGrid,compareHyGridValues,filterHyGridValue,exportHyGridCsv,encodeHyGridState,decodeHyGridState,type HyGridKey,type HyGridValue,type HyGridColumn,type HyGridSort,type HyGridFilter,type HyGridQuery,type HyGridConfig,type HyGridRowMetadata,type HyGridCellContext,type HyGridEditorContext,type HyGridEdit,type HyGridState,type HyGridCsvOptions } from './grid-model';
export const HY_DATA_GRID_DEFAULT_CONFIG:Required<HyGridConfig>={pagination:true,pageSizes:[10,25,50,100],virtualScroll:false,rowHeight:48,height:400,minBufferPx:100,maxBufferPx:250,selectionMode:'none',selectAllMode:'page',resizeColumns:true,reorderColumns:true,columnPicker:true,showFilters:false,showToolbar:true,editMode:'cell',emptyLabel:'No results',loadingLabel:'Loading rows',errorLabel:'Could not load rows',searchLabel:'Search rows',selectionLabel:'Select rows on this page'};
export const HY_DATA_GRID_DEFAULTS=new InjectionToken<HyGridConfig>('HY_DATA_GRID_DEFAULTS',{providedIn:'root',factory:()=>HY_DATA_GRID_DEFAULT_CONFIG});
interface Cell<T>{readonly column:HyGridColumn<T>;readonly value:HyGridValue;readonly text:string;readonly context:HyGridCellContext<T>;readonly editorContext:HyGridEditorContext<T>;readonly width:number;readonly pinStart:number|null;readonly pinEnd:number|null;}
interface Row<T>{readonly kind:'row'|'group';readonly key:string;readonly domKey:string;readonly row:T|null;readonly rowKey:HyGridKey;readonly label:string;readonly cells:readonly Cell<T>[];readonly level:number;readonly expanded:boolean|undefined;readonly position?:number;readonly siblingCount?:number;readonly count:number;readonly selected:boolean;readonly disabled:boolean;readonly groupId?:string;}
interface EditSession<T>{readonly key:HyGridKey;readonly row:T;readonly column:string|null;readonly values:Readonly<Record<string,HyGridValue>>;readonly token:number;}
interface ColumnGesture{readonly pointer:number;readonly id:string;readonly x:number;readonly width:number;readonly direction:number;readonly target:HTMLElement;readonly widths:Readonly<Record<string,number>>;}
@Component({selector:'hy-data-grid',imports:[HySelect,HyIcon,NgTemplateOutlet,Grid,GridRow,GridCell,GridCellWidget,CdkVirtualScrollViewport,CdkVirtualForOf,CdkFixedSizeVirtualScroll,CdkDropList,CdkDrag,CdkDragHandle],changeDetection:ChangeDetectionStrategy.OnPush,host:{'(keydown.escape)':'cancelInteractions()'},templateUrl:'./data-grid.html',styleUrl:'./data-grid.css'})
export class HyDataGrid<T>{
 readonly data=model<readonly T[]>([]);readonly columns=input.required<readonly HyGridColumn<T>[]>();readonly rowKey=input.required<(row:T)=>HyGridKey>();readonly caption=input.required<string>();
 readonly config=input<HyGridConfig>({});readonly locale=input<string>();readonly lazy=input(false);readonly totalRecords=input<number|null>(null);readonly loading=input(false);readonly error=input('');readonly disabled=input(false);
 readonly page=model(1);readonly pageSize=model(25);readonly sorts=model<readonly HyGridSort[]>([]);readonly filters=model<readonly HyGridFilter[]>([]);readonly search=model('');readonly groupBy=model<readonly string[]>([]);readonly expandedGroups=model<readonly string[]|null>(null);
 readonly selected=model<readonly HyGridKey[]>([]);readonly columnWidths=model<Readonly<Record<string,number>>>({});readonly columnOrder=model<readonly string[]>([]);readonly hiddenColumns=model<readonly string[]>([]);
 readonly expandedRows=model<readonly HyGridKey[]>([]);readonly rowDetailTemplate=input<TemplateRef<{$implicit:T}>>();readonly rowLabel=input<(row:T)=>string>(()=>'Row');readonly rowDisabled=input<(row:T)=>boolean>(()=>false);readonly rowMetadata=input<(row:T)=>HyGridRowMetadata>(()=>({}));readonly treeGrid=input(false);
 readonly canCommit=input<(edit:HyGridEdit<T>)=>boolean|Promise<boolean>>(()=>true);
 readonly queryChange=output<HyGridQuery>();readonly rowActivated=output<T>();readonly rowContext=output<{readonly row:T;readonly originalEvent:MouseEvent}>();
 readonly editStarted=output<{readonly row:T;readonly column:string|null}>();readonly editCommitted=output<HyGridEdit<T>>();readonly editCancelled=output<{readonly row:T}>();readonly editError=output<unknown>();
 readonly columnResized=output<{readonly column:string;readonly width:number}>();readonly columnsReordered=output<readonly string[]>();
 readonly exported=output<{readonly csv:string;readonly filename:string;readonly count:number}>();readonly retryRequested=output<void>();readonly cellKeydown=output<{readonly row:T;readonly column:string;readonly originalEvent:KeyboardEvent}>();
 private readonly defaults=inject(HY_DATA_GRID_DEFAULTS);private readonly globalLocale=inject(HyLocale);private readonly element=inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;private readonly destroy=inject(DestroyRef);
 private readonly viewport=viewChild(CdkVirtualScrollViewport);private readonly header=viewChild<ElementRef<HTMLElement>>('header');
 protected readonly ready=signal(false);protected readonly editing=signal<EditSession<T>|null>(null);protected readonly editMessage=signal('');readonly saving=signal(false);
 private dragCancelled=false;private editToken=0;private activeSave=0;private columnGesture:ColumnGesture|null=null;
 readonly options=computed(()=>{const options={...HY_DATA_GRID_DEFAULT_CONFIG,...this.defaults,...this.config()};if(!Number.isFinite(options.rowHeight)||options.rowHeight<32||!Number.isFinite(options.height)||options.height<1||options.minBufferPx<0||options.maxBufferPx<options.minBufferPx)throw new RangeError('Invalid grid viewport geometry');return options;});
 protected readonly effectiveLocale=computed(()=>this.locale()??this.globalLocale.locale());
 protected readonly visibleColumns=computed(()=>{if(!this.columns().length)throw new Error('A data grid needs at least one column');
  const hidden=new Set(this.hiddenColumns()),order=this.columnOrder(),ids=new Set<string>();
  const columns=this.columns().filter(column=>{if(ids.has(column.id))throw new Error('Duplicate column id: '+column.id);ids.add(column.id);return !hidden.has(column.id);});
  return [...columns].sort((a,b)=>{const left=order.indexOf(a.id),right=order.indexOf(b.id);return (left<0?1e6:left)-(right<0?1e6:right);}).map(column=>({...column,width:Math.min(column.maxWidth??1000,Math.max(column.minWidth??80,this.columnWidths()[column.id]??column.width??160))}));
 });
 protected readonly selectionEnabled=computed(()=>this.options().selectionMode!=='none');
 protected readonly selectionWidth=computed(()=>this.selectionEnabled()?48:0);
 protected readonly virtualHeight=computed(()=>Math.min(this.options().height, this.viewRows().length*this.options().rowHeight));
 protected readonly columnsWidth=computed(()=>this.visibleColumns().reduce((sum,column)=>sum+column.width,this.selectionWidth()));
 protected readonly columnsStyle=computed(()=>(this.selectionEnabled()?'48px ':'')+this.visibleColumns().map((column,index,columns)=>index===columns.length-1&&!column.pinned?'minmax('+column.width+'px,1fr)':column.width+'px').join(' '));
 readonly filteredData=computed(()=>{
  const data=this.data(),seen=new Set<HyGridKey>();for(const row of data){const key=this.rowKey()(row);if(seen.has(key))throw new Error('Duplicate row key: '+key);seen.add(key);}
  if(this.lazy())return data;
  const columns=new Map(this.columns().map(column=>[column.id,column])),locale=this.effectiveLocale(),query=normalizeSearch(this.search(),locale),collator=new Intl.Collator(locale,{numeric:true,sensitivity:'base'});
  const result=data.filter(row=>this.filters().every(filter=>{const column=columns.get(filter.column);return !!column&&filterHyGridValue(column.cell(row),filter,locale);})&&(!query||this.columns().some(column=>normalizeSearch(String(column.cell(row)??''),locale).includes(query))));
  return [...result].sort((a,b)=>{for(const sort of this.sorts()){const column=columns.get(sort.column);if(!column?.sortable)continue;const value=column.compare?column.compare(a,b):compareHyGridValues(column.cell(a),column.cell(b),collator);if(Number.isFinite(value)&&value)return value*(sort.direction==='asc'?1:-1);}return 0;});
 });
 readonly total=computed(()=>this.lazy()?Math.max(0,this.totalRecords()??this.data().length):this.filteredData().length);
 protected readonly size=computed(()=>Math.max(1,Math.trunc(this.pageSize())||25));
 readonly pageCount=computed(()=>Math.max(1,Math.ceil(this.total()/this.size())));
 protected readonly currentPage=computed(()=>Math.min(this.pageCount(),Math.max(1,this.page())));
 readonly query=computed<HyGridQuery>(()=>({page:this.currentPage(),pageSize:this.size(),first:(this.currentPage()-1)*this.size(),sorts:this.sorts(),filters:this.filters(),search:this.search(),groupBy:this.groupBy()}),{equal:(a,b)=>JSON.stringify(a)===JSON.stringify(b)});
 readonly pageData=computed(()=>this.lazy()||!this.options().pagination?this.filteredData():this.filteredData().slice((this.currentPage()-1)*this.size(),this.currentPage()*this.size()));
 private readonly selectionData=computed(()=>this.options().selectAllMode==='filtered'?this.filteredData():this.pageData());
 readonly allSelected=computed(()=>{const rows=this.selectionData().filter(row=>!this.rowDisabled()(row)),selected=new Set(this.selected());return rows.length>0&&rows.every(row=>selected.has(this.rowKey()(row)));});
 readonly someSelected=computed(()=>!this.allSelected()&&this.selectionData().some(row=>this.selected().includes(this.rowKey()(row))));
 protected readonly viewRows=computed(()=>{
  const selected=new Set(this.selected()),columns=this.visibleColumns(),locale=this.effectiveLocale(),formatter=new Intl.NumberFormat(locale),date=new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeZone:'UTC'});
  const cells=(row:T,index:number):readonly Cell<T>[]=>columns.map((column,columnIndex)=>{
   const value=column.cell(row),text=column.format?column.format(value,row):value instanceof Date?(Number.isNaN(value.getTime())?'':date.format(value)):typeof value==='number'?formatter.format(value):String(value??'');
   const context={$implicit:row,value,column,rowIndex:index};
   const pinStart=column.pinned==='start'?this.selectionWidth()+columns.slice(0,columnIndex).filter(item=>item.pinned==='start').reduce((sum,item)=>sum+item.width,0):null;
   const pinEnd=column.pinned==='end'?columns.slice(columnIndex+1).filter(item=>item.pinned==='end').reduce((sum,item)=>sum+item.width,0):null;
   return {column,value,text,context,editorContext:{...context,update:(next:HyGridValue)=>this.updateEdit(column.id,next),commit:()=>{void this.commitEdit();},cancel:()=>this.cancelEdit()},width:column.width,pinStart,pinEnd};
  });
  const rowView=(row:T,index:number):Row<T>=>{const key=this.rowKey()(row),metadata=this.rowMetadata()(row);return {kind:'row',key:'row:'+typeof key+':'+key,domKey:typeof key+':'+encodeURIComponent(String(key)),row,rowKey:key,label:this.rowLabel()(row),cells:cells(row,index),level:metadata.level??1,expanded:metadata.expanded,position:metadata.position,siblingCount:metadata.siblingCount,count:1,selected:selected.has(key),disabled:this.rowDisabled()(row)};};
  const expanded=this.expandedGroups(),groups=this.groupBy(),result:Row<T>[]=[];
  const walk=(rows:readonly T[],depth:number,path:readonly string[]):void=>{
   const column=this.columns().find(column=>column.id===groups[depth]);
   if(!column){rows.forEach((row,index)=>result.push(rowView(row,index)));return;}
   const map=new Map<string,{value:HyGridValue;rows:T[]}>();
   for(const row of rows){const value=column.cell(row),key=JSON.stringify([typeof value,value]);let group=map.get(key);if(!group){group={value,rows:[]};map.set(key,group);}group.rows.push(row);}
   for(const [key,group] of map){const id=JSON.stringify([...path,column.id,key]),open=expanded===null||expanded.includes(id);const sample=group.rows[0];if(sample===undefined)continue;
    result.push({kind:'group',key:'group:'+id,domKey:'group:'+encodeURIComponent(id),row:null,rowKey:id,groupId:id,label:column.header+': '+String(group.value??'Empty'),count:group.rows.length,level:depth+1,expanded:open,selected:false,disabled:false,cells:columns.map((item,index)=>{const value=aggregateHyGrid(group.rows,item);const context={$implicit:sample,value,column:item,rowIndex:index};return {column:item,value,text:value===null?'':typeof value==='number'?formatter.format(value):String(value),context,editorContext:{...context,update:()=>undefined,commit:()=>undefined,cancel:()=>undefined},width:item.width,pinStart:null,pinEnd:null};})});
    if(open)walk(group.rows,depth+1,[...path,column.id,key]);
   }
  };walk(this.pageData(),0,[]);return result;
 });
 protected readonly rowTrack=(_index:number,row:Row<T>):string=>row.key;
 protected readonly headerPins=computed(()=>Object.fromEntries(this.visibleColumns().map((column,index,columns)=>[column.id,{start:column.pinned==='start'?this.selectionWidth()+columns.slice(0,index).filter(item=>item.pinned==='start').reduce((sum,item)=>sum+item.width,0):null,end:column.pinned==='end'?columns.slice(index+1).filter(item=>item.pinned==='end').reduce((sum,item)=>sum+item.width,0):null}])));
 protected readonly headerSorts=computed(()=>Object.fromEntries(this.sorts().map(sort=>[sort.column,sort.direction==='asc'?'ascending':'descending'])));
 protected readonly filterValues=computed(()=>Object.fromEntries(this.filters().filter(filter=>filter.operator==='contains').map(filter=>[filter.column,filter.value])));
 constructor(){
  effect(()=>this.queryChange.emit(this.query()));
  afterNextRender(()=>{this.ready.set(true);if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(()=>this.viewport()?.checkViewportSize());observer.observe(this.element);this.destroy.onDestroy(()=>observer.disconnect());}});
  this.destroy.onDestroy(()=>{this.editToken++;this.releaseResize();});
 }
 setPage(page:number):void{if(!this.disabled()&&Number.isFinite(page))this.page.set(Math.min(this.pageCount(),Math.max(1,Math.trunc(page))));}
 setPageSize(size:number):void{if(this.disabled()||!Number.isFinite(size)||size<1)return;this.pageSize.set(Math.trunc(size));this.page.set(1);}
 setFilter(filter:HyGridFilter|null,column?:string):void{if(this.disabled())return;const id=filter?.column??column;if(!id)return;this.filters.update(filters=>[...filters.filter(item=>item.column!==id),...(filter?[filter]:[])]);this.page.set(1);}
 setSearch(search:string):void{if(!this.disabled()){this.search.set(search);this.page.set(1);}}
 toggleSort(column:string,multiple=false):void{
  const definition=this.columns().find(item=>item.id===column);if(this.disabled()||!definition?.sortable)return;const current=this.sorts().find(sort=>sort.column===column),next=current?.direction==='asc'?{column,direction:'desc' as const}:current?null:{column,direction:'asc' as const};this.sorts.set([...(multiple?this.sorts().filter(sort=>sort.column!==column):[]),...(next?[next]:[])]);this.page.set(1);
 }
 toggleRow(key:HyGridKey):void{
  if(this.disabled()||!this.selectionEnabled())return;const row=this.data().find(row=>this.rowKey()(row)===key);if(row===undefined||this.rowDisabled()(row))return;
  this.selected.update(keys=>this.options().selectionMode==='single'?(keys.includes(key)?[]:[key]):keys.includes(key)?keys.filter(id=>id!==key):[...keys,key]);
 }
 toggleAll():void{if(this.disabled()||this.options().selectionMode!=='multiple')return;const next=new Set(this.selected()),all=this.allSelected();for(const row of this.selectionData())if(!this.rowDisabled()(row)){const key=this.rowKey()(row);if(all)next.delete(key);else next.add(key);}this.selected.set([...next]);}
 toggleGroup(id:string):void{if(this.disabled())return;const open=this.expandedGroups()??this.viewRows().filter(row=>row.kind==='group').map(row=>row.groupId??'');this.expandedGroups.set(open.includes(id)?open.filter(key=>key!==id):[...open,id]);}
 toggleDetails(key:HyGridKey):void{if(!this.disabled())this.expandedRows.update(keys=>keys.includes(key)?keys.filter(id=>id!==key):[...keys,key]);}
 setColumnVisible(id:string,visible:boolean):void{if(this.disabled()||!this.columns().some(column=>column.id===id))return;if(!visible&&this.visibleColumns().length<=1)return;this.hiddenColumns.update(ids=>visible?ids.filter(key=>key!==id):[...new Set([...ids,id])]);}
 resizeColumn(id:string,width:number):boolean{const column=this.columns().find(column=>column.id===id);if(this.disabled()||!this.options().resizeColumns||column?.resizable===false||!column||!Number.isFinite(width))return false;const next=Math.min(column.maxWidth??1000,Math.max(column.minWidth??80,width));this.columnWidths.update(widths=>({...widths,[id]:next}));this.columnResized.emit({column:id,width:next});return true;}
 moveColumn(id:string,before:string):void{if(this.disabled()||!this.options().reorderColumns)return;const columns=this.visibleColumns();if(columns.find(column=>column.id===id)?.reorderable===false)return;const ids=columns.map(column=>column.id).filter(key=>key!==id),index=ids.indexOf(before);if(index<0)return;ids.splice(index,0,id);this.columnOrder.set([...ids,...this.columns().filter(column=>!ids.includes(column.id)).map(column=>column.id)]);this.columnsReordered.emit(this.columnOrder());}
 protected dragStarted():void{this.dragCancelled=false;}
 cancelInteractions():void{this.dragCancelled=true;this.cancelResize();}
 protected shiftColumn(id:string,delta:number):void{this.reorderColumn(id,this.visibleColumns().findIndex(column=>column.id===id)+delta);}
 reorderColumn(id:string,index:number):void{if(this.disabled()||!this.options().reorderColumns||!Number.isInteger(index))return;const columns=this.visibleColumns(),from=columns.findIndex(column=>column.id===id);if(from<0||index<0||index>=columns.length||columns[from]?.reorderable===false||columns[index]?.reorderable===false)return;const order=columns.map(column=>column.id);order.splice(index,0,...order.splice(from,1));this.columnOrder.set([...order,...this.hiddenColumns()]);this.columnsReordered.emit(this.columnOrder());}
 protected reorder(event:CdkDragDrop<readonly unknown[]>):void{if(this.dragCancelled||event.event.type==='touchcancel'||!event.isPointerOverContainer)return;if(this.disabled()||!this.options().reorderColumns)return;const columns=this.visibleColumns(),source=columns[event.previousIndex],target=columns[event.currentIndex];if(!source||!target||source.reorderable===false||target.reorderable===false)return;const ids=columns.map(column=>column.id);ids.splice(event.currentIndex,0,...ids.splice(event.previousIndex,1));this.columnOrder.set([...ids,...this.hiddenColumns()]);this.columnsReordered.emit(this.columnOrder());}
 beginEdit(row:T,column:string|null=null):void{
  if(this.disabled()||this.rowDisabled()(row)||this.saving())return;const columns=this.columns().filter(item=>item.write&&(this.options().editMode==='row'||item.id===column));if(!columns.length)return;
  const values=Object.fromEntries(columns.map(item=>[item.id,item.cell(row)]));this.editing.set({key:this.rowKey()(row),row,column:this.options().editMode==='row'?null:column,values,token:++this.editToken});this.editMessage.set('');this.editStarted.emit({row,column});
  queueMicrotask(()=>this.element.querySelector<HTMLElement>('[data-grid-editor]')?.focus());
 }
 updateEdit(column:string,value:HyGridValue):void{const edit=this.editing();if(edit&&!this.saving()&&column in edit.values)this.editing.set({...edit,values:{...edit.values,[column]:value}});}
 protected editorInput(event:Event,column:HyGridColumn<T>):void{
  const element=event.target as HTMLInputElement;let value:HyGridValue=element.value;
  if(column.editor==='checkbox')value=element.checked;
  else if(column.editor==='number'){const number=parseLocaleNumber(element.value,this.effectiveLocale());if(element.value.trim()&&number===undefined){this.editMessage.set('Enter a valid number.');element.setCustomValidity('Enter a valid number.');return;}element.setCustomValidity('');this.editMessage.set('');value=number??null;}
  else if(column.editor==='select')value=column.options?.[Number(element.value)]?.value??null;
  this.updateEdit(column.id,value);
 }
 async commitEdit():Promise<boolean>{
  const edit=this.editing();if(!edit||this.disabled()||this.saving()||this.element.querySelector<HTMLInputElement>('[data-grid-editor]:invalid'))return false;
  const saveToken=++this.activeSave;this.saving.set(true);
  try{let next=edit.row;for(const column of this.columns())if(column.id in edit.values){const value=edit.values[column.id]??null,message=column.validate?.(value,edit.row);if(message){this.editMessage.set(message);return false;}if(column.write)next=column.write(next,value);}
   const proposal={key:edit.key,row:edit.row,next,changes:edit.values};if(!await this.canCommit()(proposal))return false;if(this.destroy.destroyed||this.editing()?.token!==edit.token)return false;
   const index=this.data().findIndex(row=>this.rowKey()(row)===edit.key);if(index<0||this.data()[index]!==edit.row){this.editMessage.set('The row changed while saving. Cancel and try again.');return false;}
   this.data.update(rows=>rows.map((row,i)=>i===index?next:row));this.editing.set(null);this.editMessage.set('');this.editCommitted.emit(proposal);return true;
  }catch(error){if(!this.destroy.destroyed&&this.activeSave===saveToken){this.editMessage.set('Could not save. Try again.');this.editError.emit(error);}return false;}finally{if(!this.destroy.destroyed&&this.activeSave===saveToken)this.saving.set(false);}
 }
 cancelEdit():void{const edit=this.editing();this.editToken++;this.activeSave++;this.editing.set(null);this.editMessage.set('');this.saving.set(false);if(edit)this.editCancelled.emit({row:edit.row});}
 protected editKeys(event:KeyboardEvent):void{if(event.isComposing)return;if(event.key==='Escape'){event.preventDefault();event.stopPropagation();this.cancelEdit();}else if(event.key==='Enter'){event.preventDefault();event.stopPropagation();void this.commitEdit();}}
 protected cellKeys(event:KeyboardEvent,row:T,column:string):void{this.cellKeydown.emit({row,column,originalEvent:event});if(event.key==='F2'){event.preventDefault();this.beginEdit(row,column);}}
 protected activate(row:T):void{if(!this.disabled()&&!this.rowDisabled()(row))this.rowActivated.emit(row);}
 protected context(row:T,event:MouseEvent):void{if(!this.disabled()&&!this.rowDisabled()(row))this.rowContext.emit({row,originalEvent:event});}
 protected filterInput(event:Event,id:string):void{const text=(event.target as HTMLInputElement).value;this.setFilter(text?{column:id,operator:'contains',value:text}:null,id);}
 protected searchInput(event:Event):void{if(!('isComposing'in event&&event.isComposing))this.setSearch((event.target as HTMLInputElement).value);}
 protected readonly pageSizeOptions = computed(() => {
  const format = new Intl.NumberFormat(this.effectiveLocale());
  return this.options().pageSizes.map((value) => ({value, label: format.format(value)}));
 });
 protected pageSizeInput(value: number | undefined): void {
  if (value !== undefined) this.setPageSize(value);
 }
 protected widthStart(event:PointerEvent,id:string,width:number):void{
  if(this.disabled()||event.button!==0||this.columnGesture)return;event.preventDefault();event.stopPropagation();const target=event.currentTarget as HTMLElement;target.focus();target.setPointerCapture(event.pointerId);this.columnGesture={pointer:event.pointerId,id,x:event.clientX,width,direction:getComputedStyle(this.element).direction==='rtl'?-1:1,target,widths:this.columnWidths()};
 }
 protected widthMove(event:PointerEvent):void{const gesture=this.columnGesture;if(gesture&&gesture.pointer===event.pointerId)this.resizeColumn(gesture.id,gesture.width+(event.clientX-gesture.x)*gesture.direction);}
 protected widthEnd(event:PointerEvent):void{if(this.columnGesture?.pointer===event.pointerId)this.releaseResize();}
 cancelResize():void{const gesture=this.columnGesture;if(!gesture)return;this.columnWidths.set(gesture.widths);this.releaseResize();}
 private releaseResize():void{const gesture=this.columnGesture;this.columnGesture=null;if(gesture?.target.hasPointerCapture(gesture.pointer))gesture.target.releasePointerCapture(gesture.pointer);}
 protected widthKeys(event:KeyboardEvent,id:string,width:number):void{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();event.stopPropagation();const column=this.columns().find(column=>column.id===id),rtl=getComputedStyle(this.element).direction==='rtl';this.resizeColumn(id,event.key==='Home'?column?.minWidth??80:event.key==='End'?column?.maxWidth??1000:width+(event.key==='ArrowRight'?1:-1)*(rtl?-1:1)*(event.shiftKey?32:8));}
 protected syncScroll(event:Event):void{const header=this.header();if(header)header.nativeElement.scrollLeft=(event.target as HTMLElement).scrollLeft;}
 exportCsv(options:HyGridCsvOptions={}):string{
  const rows=options.scope==='page'?this.pageData():options.scope==='selected'?this.filteredData().filter(row=>this.selected().includes(this.rowKey()(row))):this.filteredData();
  const csv=exportHyGridCsv(rows,this.visibleColumns(),options),filename=options.filename??'export.csv';this.exported.emit({csv,filename,count:rows.length});
  if(options.download&&typeof window!=='undefined'){const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})),anchor=this.element.ownerDocument.createElement('a');anchor.href=url;anchor.download=filename;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),0);}return csv;
 }
 getState():HyGridState{return {version:1,query:this.query(),widths:this.columnWidths(),order:this.columnOrder(),hidden:this.hiddenColumns(),selected:this.selected(),expandedGroups:this.expandedGroups(),expandedRows:this.expandedRows()};}
 saveState():string{return encodeHyGridState(this.getState());}
 restoreState(text:string):void{const state=decodeHyGridState(text,this.columns().map(column=>column.id));this.page.set(state.query.page);this.pageSize.set(state.query.pageSize);this.sorts.set(state.query.sorts);this.filters.set(state.query.filters);this.search.set(state.query.search);this.groupBy.set(state.query.groupBy);this.columnWidths.set(state.widths);this.columnOrder.set(state.order);this.hiddenColumns.set(state.hidden);this.selected.set(state.selected);this.expandedGroups.set(state.expandedGroups??null);this.expandedRows.set(state.expandedRows??[]);}
 reset():void{this.cancelEdit();this.cancelResize();this.page.set(1);this.pageSize.set(25);this.expandedRows.set([]);this.sorts.set([]);this.filters.set([]);this.search.set('');this.groupBy.set([]);this.expandedGroups.set(null);this.selected.set([]);this.columnWidths.set({});this.columnOrder.set([]);this.hiddenColumns.set([]);}
 scrollToRow(key:HyGridKey):void{const index=this.viewRows().findIndex(row=>row.rowKey===key);if(index>=0&&this.options().virtualScroll&&this.ready())this.viewport()?.scrollToIndex(index);else this.element.querySelector<HTMLElement>('[data-row-key="'+typeof key+':'+encodeURIComponent(String(key))+'"]')?.scrollIntoView({block:'nearest'});}
 focusCell(key:HyGridKey,column:string):void{this.scrollToRow(key);queueMicrotask(()=>{const row=this.element.querySelector<HTMLElement>('[data-row-key="'+typeof key+':'+encodeURIComponent(String(key))+'"]');Array.from(row?.querySelectorAll<HTMLElement>('[data-column]')??[]).find(cell=>cell.dataset['column']===column)?.focus();});}
 refresh():void{this.viewport()?.checkViewportSize();}
}
