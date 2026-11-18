import { EXAMPLE } from './examples/virtual-scroller';
import {ChangeDetectionStrategy,Component} from '@angular/core';
import {HyVirtualScroller} from '@hyalo/angular/virtual-scroller';

import {HyButton} from '@hyalo/angular/button';
import {DocsPage} from '../shared/page';
import {DocsExample} from '../shared/example';
import {DocsImport} from '../shared/import';
import {DocsApiTable} from '../shared/api-table';
import {PHASE6_API} from './phase6-api';
@Component({selector:'docs-virtual-scroller-page',imports:[HyVirtualScroller,HyButton,DocsPage,DocsExample,DocsImport,DocsApiTable],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./virtual-scroller.html',styleUrl:'./phase6.css'})
export default class VirtualScrollerPage{
  protected readonly example = EXAMPLE;

protected readonly rows=PHASE6_API['virtual-scroller']??[];

protected readonly items=Array.from({length:10000},(_,id)=>({id,label:'Activity '+(id+1)}));
protected readonly key=(item:{id:number}):number=>item.id;
protected readonly label=(item:{label:string}):string=>item.label;

}
