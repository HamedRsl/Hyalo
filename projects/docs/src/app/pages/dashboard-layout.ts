import { EXAMPLE } from './examples/dashboard-layout';
import {ChangeDetectionStrategy,Component,signal} from '@angular/core';
import {HyDashboardLayout, type HyDashboardTile} from '@hyalo/angular/dashboard-layout';

import {HyButton} from '@hyalo/angular/button';
import {DocsPage} from '../shared/page';
import {DocsExample} from '../shared/example';
import {DocsImport} from '../shared/import';
import {DocsApiTable} from '../shared/api-table';
import {PHASE6_API} from './phase6-api';
@Component({selector:'docs-dashboard-layout-page',imports:[HyDashboardLayout,HyButton,DocsPage,DocsExample,DocsImport,DocsApiTable],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./dashboard-layout.html',styleUrl:'./phase6.css'})
export default class DashboardLayoutPage{
  protected readonly example = EXAMPLE;

protected readonly rows=PHASE6_API['dashboard-layout']??[];

protected readonly tiles=signal<readonly HyDashboardTile[]>([{id:'capacity',label:'Capacity',x:0,y:0,width:6,height:3,minWidth:3,minHeight:2},{id:'activity',label:'Activity',x:6,y:0,width:6,height:3,minWidth:3,minHeight:2},{id:'notes',label:'Notes',x:0,y:3,width:12,height:2,minHeight:2}]);
protected readonly saved=signal('');

}
