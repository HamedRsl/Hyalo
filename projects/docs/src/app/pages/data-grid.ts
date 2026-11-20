import { EXAMPLE } from './examples/data-grid';
import {ChangeDetectionStrategy,Component,signal} from '@angular/core';
import {HyDataGrid, type HyGridColumn} from '@hyalo/angular/data-grid';

import {HyButton} from '@hyalo/angular/button';
import {DocsPage} from '../shared/page';
import {DocsExample} from '../shared/example';
import {DocsImport} from '../shared/import';
import {DocsApiTable} from '../shared/api-table';
import {PHASE6_API} from './phase6-api';
@Component({selector:'docs-data-grid-page',imports:[HyDataGrid,HyButton,DocsPage,DocsExample,DocsImport,DocsApiTable],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./data-grid.html',styleUrl:'./phase6.css'})
export default class DataGridPage{
  protected readonly example = EXAMPLE;

protected readonly rows=PHASE6_API['data-grid']??[];

protected readonly records=signal<readonly {id:number;name:string;team:string;capacity:number}[]>(Array.from({length:120},(_,index)=>({id:index+1,name:['Aster','Cedar','Juniper','Maple'][index%4]+' '+(index+1),team:['Design','Engineering','Support'][index%3]??'Design',capacity:20+index%75})));
protected readonly key=(row:{id:number}):number=>row.id;
protected readonly name=(row:{name:string}):string=>row.name;
protected readonly columns:readonly HyGridColumn<{id:number;name:string;team:string;capacity:number}>[]=[
{id:'name',header:'Project',cell:row=>row.name,sortable:true,pinned:'start',width:220,write:(row,value)=>({...row,name:String(value??'')}),validate:value=>String(value??'').trim()?null:'Enter a project name'},
{id:'team',header:'Team',cell:row=>row.team,sortable:true,width:170},
{id:'capacity',header:'Capacity',cell:row=>row.capacity,sortable:true,editor:'number',aggregate:'avg',write:(row,value)=>({...row,capacity:Number(value)}),width:160}
];
protected readonly groups=signal<readonly string[]>([]);
protected readonly virtual=signal(false);

}
