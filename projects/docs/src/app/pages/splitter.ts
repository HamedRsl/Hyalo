import { EXAMPLE } from './examples/splitter';
import {ChangeDetectionStrategy,Component,signal} from '@angular/core';
import {HySplitter, type HySplitterPane} from '@hyalo/angular/splitter';

import {HyButton} from '@hyalo/angular/button';
import {DocsPage} from '../shared/page';
import {DocsExample} from '../shared/example';
import {DocsImport} from '../shared/import';
import {DocsApiTable} from '../shared/api-table';
import {PHASE6_API} from './phase6-api';
@Component({selector:'docs-splitter-page',imports:[HySplitter,HyButton,DocsPage,DocsExample,DocsImport,DocsApiTable],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./splitter.html',styleUrl:'./phase6.css'})
export default class SplitterPage{
  protected readonly example = EXAMPLE;

protected readonly rows=PHASE6_API['splitter']??[];

protected readonly panes:readonly HySplitterPane[]=[{id:'folders',label:'Folders',size:25,min:15,max:50,collapsible:true},{id:'editor',label:'Editor',size:50,min:25,max:75},{id:'details',label:'Details',size:25,min:15,max:50,collapsible:true}];
protected readonly sizes=signal<readonly number[]>([25,50,25]);

}
