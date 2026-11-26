import { EXAMPLE } from './examples/context-menu';
import {ChangeDetectionStrategy,Component,ElementRef,signal,viewChild} from '@angular/core';
import {HyContextMenu, HyContextMenuTrigger, type HyContextAction} from '@hyalo/angular/context-menu';

import {HyButton} from '@hyalo/angular/button';
import {DocsPage} from '../shared/page';
import {DocsExample} from '../shared/example';
import {DocsImport} from '../shared/import';
import {DocsApiTable} from '../shared/api-table';
import {PHASE6_API} from './phase6-api';
@Component({selector:'docs-context-menu-page',imports:[HyContextMenu,HyContextMenuTrigger,HyButton,DocsPage,DocsExample,DocsImport,DocsApiTable],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./context-menu.html',styleUrl:'./phase6.css'})
export default class ContextMenuPage{
  protected readonly example = EXAMPLE;

protected readonly rows=PHASE6_API['context-menu']??[];
protected readonly restoreButton = viewChild('actionButton', { read: ElementRef<HTMLButtonElement> });

protected readonly actions:readonly HyContextAction[]=[{id:'open',label:'Open details',icon:'arrow-end',shortcut:'Enter'},{id:'assign',label:'Assign to',children:[{id:'design',label:'Design team'},{id:'engineering',label:'Engineering team'}]},{id:'watch',label:'Watch changes',role:'checkbox',checked:true},{id:'divider',label:'',separator:true},{id:'delete',label:'Delete',disabled:true}];
protected readonly lastAction=signal('No action yet');

}
