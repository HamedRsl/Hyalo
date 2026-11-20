import { EXAMPLE } from './examples/scheduler';
import {ChangeDetectionStrategy,Component,signal} from '@angular/core';
import {HyScheduler} from '@hyalo/angular/scheduler';

import {DocsPage} from '../shared/page';
import {DocsExample} from '../shared/example';
import {DocsImport} from '../shared/import';
import {DocsApiTable} from '../shared/api-table';
import {PHASE6_API} from './phase6-api';
@Component({selector:'docs-scheduler-page',imports:[HyScheduler,DocsPage,DocsExample,DocsImport,DocsApiTable],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./scheduler.html',styleUrl:'./phase6.css'})
export default class SchedulerPage{
  protected readonly example = EXAMPLE;

protected readonly rows=PHASE6_API['scheduler']??[];

protected readonly date=signal<string|null>('2026-11-18');
protected readonly events=[{id:'review',title:'Design review',start:'2026-11-18T10:00:00',end:'2026-11-18T11:00:00'},{id:'release',title:'Release window',start:'2026-11-20',allDay:true},{id:'planning',title:'Planning',daysOfWeek:[1],startTime:'09:00:00',endTime:'09:30:00'}];
protected readonly feedback=signal('Choose an event or a date');

}
