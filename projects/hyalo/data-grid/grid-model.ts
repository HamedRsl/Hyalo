import type {TemplateRef} from '@angular/core';
export type HyGridKey=string|number;
export type HyGridValue=string|number|boolean|Date|null;
export type HyGridPrimitive=string|number|boolean|null;
export interface HyGridSort{readonly column:string;readonly direction:'asc'|'desc';}
export type HyGridFilter=
 | {readonly column:string;readonly operator:'contains'|'startsWith'|'endsWith';readonly value:string}
 | {readonly column:string;readonly operator:'eq'|'neq';readonly value:HyGridPrimitive}
 | {readonly column:string;readonly operator:'gt'|'gte'|'lt'|'lte';readonly value:number}
 | {readonly column:string;readonly operator:'between';readonly value:readonly[number,number]}
 | {readonly column:string;readonly operator:'in';readonly value:readonly HyGridPrimitive[]};
export interface HyGridCellContext<T>{readonly $implicit:T;readonly value:HyGridValue;readonly column:HyGridColumn<T>;readonly rowIndex:number;}
export interface HyGridEditorContext<T> extends HyGridCellContext<T>{readonly update:(value:HyGridValue)=>void;readonly commit:()=>void;readonly cancel:()=>void;}
export interface HyGridColumn<T>{
 readonly id:string;readonly header:string;readonly cell:(row:T)=>HyGridValue;
 readonly width?:number;readonly minWidth?:number;readonly maxWidth?:number;readonly sortable?:boolean;readonly filterable?:boolean;readonly resizable?:boolean;readonly reorderable?:boolean;
 readonly pinned?:'start'|'end';readonly align?:'start'|'center'|'end';readonly compare?:(a:T,b:T)=>number;readonly format?:(value:HyGridValue,row:T)=>string;
 readonly template?:TemplateRef<HyGridCellContext<T>>;readonly editorTemplate?:TemplateRef<HyGridEditorContext<T>>;
 readonly editor?:'text'|'number'|'checkbox'|'select';readonly options?:readonly {readonly value:HyGridPrimitive;readonly label:string}[];
 readonly write?:(row:T,value:HyGridValue)=>T;readonly validate?:(value:HyGridValue,row:T)=>string|null;
 readonly aggregate?:'sum'|'count'|'avg'|'min'|'max'|((rows:readonly T[])=>HyGridValue);readonly exportable?:boolean;
}
export interface HyGridQuery{readonly page:number;readonly pageSize:number;readonly first:number;readonly sorts:readonly HyGridSort[];readonly filters:readonly HyGridFilter[];readonly search:string;readonly groupBy:readonly string[];}
export interface HyGridConfig{
 readonly pagination?:boolean;readonly pageSizes?:readonly number[];readonly virtualScroll?:boolean;readonly rowHeight?:number;readonly height?:number;readonly minBufferPx?:number;readonly maxBufferPx?:number;
 readonly selectionMode?:'none'|'single'|'multiple';readonly selectAllMode?:'page'|'filtered';readonly resizeColumns?:boolean;readonly reorderColumns?:boolean;readonly columnPicker?:boolean;readonly showFilters?:boolean;readonly showToolbar?:boolean;
 readonly editMode?:'cell'|'row';readonly emptyLabel?:string;readonly loadingLabel?:string;readonly errorLabel?:string;readonly searchLabel?:string;readonly selectionLabel?:string;
}
export interface HyGridRowMetadata{readonly level?:number;readonly expanded?:boolean;readonly position?:number;readonly siblingCount?:number;}
export interface HyGridEdit<T>{readonly key:HyGridKey;readonly row:T;readonly next:T;readonly changes:Readonly<Record<string,HyGridValue>>;}
export interface HyGridState{readonly version:1;readonly query:HyGridQuery;readonly widths:Readonly<Record<string,number>>;readonly order:readonly string[];readonly hidden:readonly string[];readonly selected:readonly HyGridKey[];readonly expandedGroups?:readonly string[]|null;readonly expandedRows?:readonly HyGridKey[];}
export interface HyGridCsvOptions{readonly scope?:'page'|'filtered'|'selected';readonly delimiter?:','|';'|'\t';readonly filename?:string;readonly bom?:boolean;readonly download?:boolean;readonly escapeFormulae?:boolean;}
export function compareHyGridValues(a:HyGridValue,b:HyGridValue,collator:Intl.Collator):number{
 if(a===null)return b===null?0:1;if(b===null)return -1;
 const first=a instanceof Date?a.getTime():a,second=b instanceof Date?b.getTime():b;
 if(typeof first==='number'&&typeof second==='number')return first-second;
 return collator.compare(String(first),String(second));
}
export function filterHyGridValue(value:HyGridValue,filter:HyGridFilter,locale:string):boolean{
 const normalize=(text:string):string=>text.normalize('NFKD').replace(/[\u0300-\u036f]/gu,'').replace(/ي/gu,'ی').replace(/ك/gu,'ک').toLocaleLowerCase(locale);
 const cell=value instanceof Date?value.getTime():value;
 switch(filter.operator){
 case 'contains':return normalize(String(cell??'')).includes(normalize(filter.value));
 case 'startsWith':return normalize(String(cell??'')).startsWith(normalize(filter.value));
 case 'endsWith':return normalize(String(cell??'')).endsWith(normalize(filter.value));
 case 'eq':return cell===filter.value;case 'neq':return cell!==filter.value;
 case 'in':return filter.value.some(item=>item===cell);
 case 'between':return typeof cell==='number'&&cell>=filter.value[0]&&cell<=filter.value[1]&&filter.value[0]<=filter.value[1];
 case 'gt':return typeof cell==='number'&&cell>filter.value;case 'gte':return typeof cell==='number'&&cell>=filter.value;
 case 'lt':return typeof cell==='number'&&cell<filter.value;case 'lte':return typeof cell==='number'&&cell<=filter.value;
 }
}
export function aggregateHyGrid<T>(rows:readonly T[],column:HyGridColumn<T>):HyGridValue{
 if(typeof column.aggregate==='function')return column.aggregate(rows);if(column.aggregate==='count')return rows.length;
 const values=rows.map(row=>column.cell(row)).filter((value):value is number=>typeof value==='number'&&Number.isFinite(value));
 if(!values.length)return null;if(column.aggregate==='min')return values.reduce((a,b)=>Math.min(a,b));if(column.aggregate==='max')return values.reduce((a,b)=>Math.max(a,b));
 const total=values.reduce((a,b)=>a+b,0);return column.aggregate==='avg'?total/values.length:column.aggregate==='sum'?total:null;
}
export function encodeHyGridState(state:HyGridState):string{return JSON.stringify(state);}
export function decodeHyGridState(text:string,columns:readonly string[]):HyGridState{
 const state:unknown=JSON.parse(text);if(!state||typeof state!=='object'||!('version'in state)||state.version!==1||!('query'in state)||!('widths'in state)||!('order'in state)||!('hidden'in state)||!('selected'in state))throw new Error('Invalid grid state');
 const query=state.query;
 if(!query||typeof query!=='object'||!('page'in query)||!Number.isInteger(query.page)||Number(query.page)<1||!('pageSize'in query)||!Number.isInteger(query.pageSize)||Number(query.pageSize)<1||!('first'in query)||!Number.isInteger(query.first)||Number(query.first)<0||!('search'in query)||typeof query.search!=='string'||!('sorts'in query)||!Array.isArray(query.sorts)||!('filters'in query)||!Array.isArray(query.filters)||!('groupBy'in query)||!Array.isArray(query.groupBy))throw new Error('Invalid grid query');
 if('expandedGroups'in state&&state.expandedGroups!==null&&(!Array.isArray(state.expandedGroups)||!state.expandedGroups.every(key=>typeof key==='string'))||'expandedRows'in state&&(!Array.isArray(state.expandedRows)||!state.expandedRows.every(key=>typeof key==='string'||typeof key==='number'&&Number.isFinite(key))))throw new Error('Invalid grid expansion state');
 const known=new Set(columns),strings=(value:unknown):value is string[]=>Array.isArray(value)&&value.every(item=>typeof item==='string'&&known.has(item))&&new Set(value).size===value.length;
 if(!strings(state.order)||!strings(state.hidden)||!strings(query.groupBy)||!Array.isArray(state.selected)||!state.selected.every(key=>typeof key==='string'||typeof key==='number'&&Number.isFinite(key))||!state.widths||typeof state.widths!=='object'||Array.isArray(state.widths)||!Object.entries(state.widths).every(([key,width])=>known.has(key)&&typeof width==='number'&&Number.isFinite(width)&&width>0))throw new Error('Invalid grid layout');
 for(const sort of query.sorts)if(!sort||typeof sort!=='object'||!known.has(sort.column)||!['asc','desc'].includes(sort.direction))throw new Error('Invalid grid sort');
 for(const filter of query.filters){
  if(!filter||typeof filter!=='object'||!known.has(filter.column))throw new Error('Invalid grid filter');
  const primitive=(value:unknown):boolean=>value===null||typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value);
  if(['contains','startsWith','endsWith'].includes(filter.operator)){if(typeof filter.value!=='string')throw new Error('Invalid text filter');}
  else if(['eq','neq'].includes(filter.operator)){if(!primitive(filter.value))throw new Error('Invalid equality filter');}
  else if(['gt','gte','lt','lte'].includes(filter.operator)){if(typeof filter.value!=='number'||!Number.isFinite(filter.value))throw new Error('Invalid numeric filter');}
  else if(filter.operator==='in'){if(!Array.isArray(filter.value)||!filter.value.every(primitive))throw new Error('Invalid set filter');}
  else if(filter.operator==='between'){if(!Array.isArray(filter.value)||filter.value.length!==2||!filter.value.every((n:unknown)=>typeof n==='number'&&Number.isFinite(n))||filter.value[0]>filter.value[1])throw new Error('Invalid range filter');}
  else throw new Error('Unsupported grid filter operator');
 }
 return state as HyGridState;
}
export function exportHyGridCsv<T>(rows:readonly T[],columns:readonly HyGridColumn<T>[],options:HyGridCsvOptions={}):string{
 const delimiter=options.delimiter??',';
 const cell=(value:HyGridValue):string=>{let text=value instanceof Date?(Number.isNaN(value.getTime())?'':value.toISOString()):String(value??'');if(options.escapeFormulae!==false&&typeof value==='string'&&/^[\s]*[=+\-@\t\r]/u.test(text))text="'"+text;return '"'+text.replace(/"/gu,'""')+'"';};
 const visible=columns.filter(column=>column.exportable!==false);
 const lines=[visible.map(column=>cell(column.header)).join(delimiter),...rows.map(row=>visible.map(column=>cell(column.cell(row))).join(delimiter))];
 return (options.bom?'\ufeff':'')+lines.join('\r\n');
}
