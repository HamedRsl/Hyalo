import { HySelect } from '@hyalo/angular/select';
import { HyButtonGroup } from '@hyalo/angular/button-group';
import { HyButton } from '@hyalo/angular/button';
import { HyIcon } from '@hyalo/angular/icon';

import { NgTemplateOutlet } from '@angular/common';
import { CdkDrag,CdkDragHandle,CdkDropList,CdkDropListGroup,type CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy,Component,DestroyRef,ElementRef,TemplateRef,computed,inject,input,model,output,signal } from '@angular/core';
import { HyLocale,injectId,normalizeSearch,type HyTone } from '@hyalo/angular/core';
export interface HyKanbanCard<T=unknown>{readonly id:string;readonly label:string;readonly description?:string;readonly data?:T;readonly lane?:string;readonly disabled?:boolean;readonly tone?:HyTone;}
export interface HyKanbanColumn<T=unknown>{readonly id:string;readonly label:string;readonly cards:readonly HyKanbanCard<T>[];readonly limit?:number;readonly disabled?:boolean;}
export interface HyKanbanLane{readonly id:string;readonly label:string;}
export interface HyKanbanMove<T>{readonly card:HyKanbanCard<T>;readonly from:string;readonly to:string;readonly index:number;readonly lane:string;readonly source:'pointer'|'keyboard'|'api';}
export interface HyKanbanCardContext<T>{readonly $implicit:HyKanbanCard<T>;readonly column:HyKanbanColumn<T>;readonly index:number;readonly move:(to:string,index?:number,lane?:string)=>Promise<boolean>;}
export function moveHyKanbanCard<T>(columns:readonly HyKanbanColumn<T>[],id:string,to:string,index:number,lane?:string):readonly HyKanbanColumn<T>[]|null{
 const from=columns.find(column=>column.cards.some(card=>card.id===id)),target=columns.find(column=>column.id===to),card=from?.cards.find(card=>card.id===id);
 if(!from||!target||!card||from.disabled||target.disabled||card.disabled||!Number.isInteger(index)||index<0)return null;
 if(from!==target&&target.limit!==undefined&&target.cards.length>=target.limit)return null;
 const destination=target.cards.filter(item=>item.id!==id);if(index>destination.length)return null;
 destination.splice(index,0,{...card,lane:lane??card.lane});return columns.map(column=>column===target?{...column,cards:destination}:column===from?{...column,cards:column.cards.filter(item=>item.id!==id)}:column);
}
@Component({selector:'hy-kanban',imports:[HySelect,HyButtonGroup,HyButton,HyIcon,NgTemplateOutlet,CdkDrag,CdkDragHandle,CdkDropList,CdkDropListGroup],changeDetection:ChangeDetectionStrategy.OnPush,host:{'(keydown.escape)':'cancelDrag()'},templateUrl:'./kanban.html',styleUrl:'./kanban.css'})
export class HyKanban<T>{
 readonly columns=model.required<readonly HyKanbanColumn<T>[]>();readonly lanes=input<readonly HyKanbanLane[]>([]);
 readonly label=input('Kanban board');readonly disabled=input(false);readonly readonly=input(false);readonly loading=input(false);readonly error=input('');readonly emptyLabel=input('No cards');readonly filter=model('');readonly locale=input<string>();readonly dragDelay=input(150);
 readonly cardTemplate=input<TemplateRef<HyKanbanCardContext<T>>>();readonly columnTemplate=input<TemplateRef<{$implicit:HyKanbanColumn<T>}>>();
 readonly canMove=input<(move:HyKanbanMove<T>)=>boolean|Promise<boolean>>(()=>true);
 readonly moveStarted=output<HyKanbanMove<T>>();readonly moved=output<HyKanbanMove<T>>();readonly moveRejected=output<HyKanbanMove<T>>();readonly moveError=output<unknown>();readonly cardActivated=output<HyKanbanCard<T>>();readonly retryRequested=output<void>();
 readonly pending=signal(false);protected readonly announcement=signal('');private dragCancelled=false;private epoch=0;private readonly element=inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;private readonly destroy=inject(DestroyRef);private readonly globalLocale=inject(HyLocale);private readonly prefix=injectId('kanban');
 protected readonly blocked=computed(()=>this.disabled()||this.readonly()||this.pending());
 protected readonly view=computed(()=>{
  const columns=this.columns(),ids=new Set<string>(),keys=new Set<string>(),lanes=this.lanes().length?this.lanes():[{id:'',label:''}],query=normalizeSearch(this.filter(),this.locale()??this.globalLocale.locale());
  for(const column of columns){if(ids.has(column.id)||column.limit!==undefined&&(!Number.isInteger(column.limit)||column.limit<0))throw new Error('Invalid kanban column');ids.add(column.id);for(const card of column.cards){if(keys.has(card.id))throw new Error('Duplicate kanban card id: '+card.id);keys.add(card.id);if(this.lanes().length&&!lanes.some(lane=>lane.id===(card.lane??'')))throw new Error('Unknown kanban lane');}}
  if(new Set(lanes.map(lane=>lane.id)).size!==lanes.length)throw new Error('Duplicate kanban lane id');
  return lanes.map(lane=>({lane,columns:columns.map(column=>({column,id:this.prefix+'-'+encodeURIComponent(lane.id)+'-'+encodeURIComponent(column.id),cards:column.cards.filter(card=>(!this.lanes().length||(card.lane??'')===lane.id)&&(!query||normalizeSearch(card.label+' '+(card.description??''),this.locale()??this.globalLocale.locale()).includes(query)))}))}));
 });
 constructor(){this.destroy.onDestroy(()=>this.epoch++);}
 async moveCard(id:string,to:string,index?:number,lane?:string,source:'pointer'|'keyboard'|'api'='api'):Promise<boolean>{
  if(this.blocked())return false;const columns=this.columns(),from=columns.find(column=>column.cards.some(card=>card.id===id)),target=columns.find(column=>column.id===to),card=from?.cards.find(card=>card.id===id);if(!from||!target||!card)return false;
  const position=index??target.cards.filter(item=>item.id!==id).length,destinationLane=lane??card.lane??'';
  if(this.lanes().length&&!this.lanes().some(item=>item.id===destinationLane))return false;
  const move={card,from:from.id,to,index:position,lane:destinationLane,source},next=moveHyKanbanCard(columns,id,to,position,destinationLane);if(!next){this.moveRejected.emit(move);return false;}
  const epoch=++this.epoch;this.pending.set(true);this.moveStarted.emit(move);
  try{const allowed=await this.canMove()(move);if(this.destroy.destroyed||epoch!==this.epoch)return false;if(!allowed||this.columns()!==columns||this.disabled()||this.readonly()){this.moveRejected.emit(move);return false;}this.columns.set(next);this.announcement.set(card.label+' moved to '+target.label+', position '+(position+1));this.moved.emit(move);if(source==='keyboard')setTimeout(()=>Array.from(this.element.querySelectorAll<HTMLElement>('[data-card-id]')).find(element=>element.dataset['cardId']===id)?.querySelector<HTMLElement>('.card-title')?.focus());return true;}
  catch(error){if(!this.destroy.destroyed&&epoch===this.epoch)this.moveError.emit(error);return false;}
  finally{if(!this.destroy.destroyed&&epoch===this.epoch)this.pending.set(false);}
 }
 cancelMove():void{this.epoch++;this.pending.set(false);}
 protected context(card:HyKanbanCard<T>,column:HyKanbanColumn<T>,index:number):HyKanbanCardContext<T>{return {$implicit:card,column,index,move:(to,position,lane)=>this.moveCard(card.id,to,position,lane)};}
 protected dragStarted():void{this.dragCancelled=false;}
 cancelDrag():void{this.dragCancelled=true;this.cancelMove();}
 protected drop(event:CdkDragDrop<{column:string;lane:string;cards:HyKanbanCard<T>[]}>,column:HyKanbanColumn<T>,lane:string,cards:readonly HyKanbanCard<T>[]):void{
  if(this.dragCancelled||event.event.type==='touchcancel'||!event.isPointerOverContainer)return;const card=event.item.data as HyKanbanCard<T>,before=cards.filter(item=>item.id!==card.id)[event.currentIndex],remaining=column.cards.filter(item=>item.id!==card.id),index=before?remaining.findIndex(item=>item.id===before.id):remaining.length;void this.moveCard(card.id,column.id,index,lane,'pointer');
 }
 protected shift(card:HyKanbanCard<T>,column:HyKanbanColumn<T>,delta:number):void{const siblings=column.cards.filter(item=>(item.lane??'')===(card.lane??'')),position=siblings.findIndex(item=>item.id===card.id),neighbor=siblings[position+delta];if(!neighbor)return;const index=column.cards.findIndex(item=>item.id===neighbor.id);void this.moveCard(card.id,column.id,index,card.lane,'keyboard');}
 protected readonly destinations = computed(() => this.columns().map((column) => ({
  value: column.id, label: column.label,
  disabled: column.disabled || (column.limit !== undefined && column.cards.length >= column.limit),
 })));
 protected readonly laneOptions = computed(() => this.lanes().map((lane) => ({ value: lane.id, label: lane.label })));
 protected destination(value: string | undefined, card: HyKanbanCard<T>, column: HyKanbanColumn<T>, picker: HySelect<string>, lane = false): void {
  if (value === undefined) return;
  picker.clear();
  if (lane ? value === card.lane : value === column.id) return;
  void this.moveCard(card.id, lane ? column.id : value, undefined, lane ? value : card.lane, 'keyboard');
 }
 protected activate(card:HyKanbanCard<T>):void{if(!this.disabled()&&!card.disabled)this.cardActivated.emit(card);}
}
