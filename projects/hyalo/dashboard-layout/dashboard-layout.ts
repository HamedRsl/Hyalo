
import { NgTemplateOutlet } from '@angular/common';
import { CdkDrag,CdkDragHandle,type CdkDragEnd } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy,Component,DestroyRef,ElementRef,TemplateRef,afterNextRender,computed,inject,input,model,output,signal } from '@angular/core';
import { compactHyDashboardLayout,decodeHyDashboardLayout,validateHyDashboardLayout,type HyTileRect } from './layout-model';
export interface HyDashboardTile<T=unknown> extends HyTileRect{readonly label:string;readonly data?:T;readonly locked?:boolean;readonly minWidth?:number;readonly maxWidth?:number;readonly minHeight?:number;readonly maxHeight?:number;readonly template?:TemplateRef<HyDashboardTileContext<T>>;}
export interface HyDashboardTileContext<T>{readonly $implicit:HyDashboardTile<T>;readonly resize:(width:number,height:number)=>boolean;readonly move:(x:number,y:number)=>boolean;}
export interface HyDashboardChange{readonly id:string;readonly previous:HyTileRect;readonly next:HyTileRect;readonly source:'pointer'|'keyboard'|'api';}
interface ResizeGesture{readonly pointer:number;readonly x:number;readonly y:number;readonly direction:number;readonly width:number;readonly tile:HyTileRect;readonly target:HTMLElement;}
@Component({selector:'hy-dashboard-layout',imports:[NgTemplateOutlet,CdkDrag,CdkDragHandle],changeDetection:ChangeDetectionStrategy.OnPush,host:{'(keydown.escape)':'cancelInteractions()','[class.narrow]':'narrow()'},templateUrl:'./dashboard-layout.html',styleUrl:'./dashboard-layout.css'})
export class HyDashboardLayout<T>{
 readonly tiles=model.required<readonly HyDashboardTile<T>[]>();readonly columns=input(12);readonly rowHeight=input(80);readonly gap=input(16);readonly maxRows=input(100);readonly label=input('Dashboard layout');readonly disabled=input(false);readonly readonly=input(false);readonly draggable=input(true);readonly resizable=input(true);readonly mobileBreakpoint=input(640);
 readonly tileTemplate=input<TemplateRef<HyDashboardTileContext<T>>>();readonly headerTemplate=input<TemplateRef<HyDashboardTileContext<T>>>();
 readonly canChange=input<(change:HyDashboardChange)=>boolean>(()=>true);
 readonly changeStarted=output<HyDashboardChange>();readonly changed=output<HyDashboardChange>();readonly changeRejected=output<HyDashboardChange>();readonly changeCancelled=output<HyTileRect>();readonly tileActivated=output<HyDashboardTile<T>>();
 private readonly element=inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;private readonly destroy=inject(DestroyRef);private gesture:ResizeGesture|null=null;private dragCancelled=false;
 protected readonly preview=signal<HyTileRect|null>(null);protected readonly narrow=signal(false);protected readonly announcement=signal('');
 protected readonly blocked=computed(()=>this.disabled()||this.readonly()||this.narrow());
 readonly layout=computed(()=>{const tiles=this.tiles();if(!validateHyDashboardLayout(tiles,{columns:this.columns(),maxRows:this.maxRows()}))throw new Error('Dashboard tiles must be unique, non-overlapping, and within bounds');return tiles;});
 protected readonly view=computed(()=>this.layout().map(tile=>({...tile,...(this.preview()?.id===tile.id?this.preview():{})})));
 constructor(){afterNextRender(()=>{if(typeof ResizeObserver==='undefined')return;const observer=new ResizeObserver(([entry])=>this.narrow.set((entry?.contentRect.width??Infinity)<this.mobileBreakpoint()));observer.observe(this.element);this.destroy.onDestroy(()=>observer.disconnect());});this.destroy.onDestroy(()=>this.release());}
 private proposal(id:string,rect:Partial<Pick<HyTileRect,'x'|'y'|'width'|'height'>>,source:'pointer'|'keyboard'|'api'):HyDashboardChange|null{
  const tile=this.tiles().find(tile=>tile.id===id);if(!tile||this.blocked()||tile.locked)return null;const previous={id:tile.id,x:tile.x,y:tile.y,width:tile.width,height:tile.height},next={...previous,...rect};
  if(next.width<(tile.minWidth??1)||next.width>(tile.maxWidth??this.columns())||next.height<(tile.minHeight??1)||next.height>(tile.maxHeight??this.maxRows()))return null;
  return {id,previous,next,source};
 }
 private valid(change:HyDashboardChange):boolean{return validateHyDashboardLayout(this.tiles().map(tile=>tile.id===change.id?change.next:tile),{columns:this.columns(),maxRows:this.maxRows()})&&this.canChange()(change);}
 private commit(change:HyDashboardChange):boolean{
  if(!this.valid(change)){this.changeRejected.emit(change);return false;}this.tiles.update(tiles=>tiles.map(tile=>tile.id===change.id?{...tile,...change.next}:tile));this.changed.emit(change);this.announcement.set('Updated '+(this.tiles().find(tile=>tile.id===change.id)?.label??change.id)+': column '+(change.next.x+1)+', row '+(change.next.y+1)+', '+change.next.width+' by '+change.next.height);return true;
 }
 moveTile(id:string,x:number,y:number,source:'pointer'|'keyboard'|'api'='api'):boolean{if(!this.draggable())return false;const change=this.proposal(id,{x,y},source);return !!change&&this.commit(change);}
 resizeTile(id:string,width:number,height:number,source:'pointer'|'keyboard'|'api'='api'):boolean{if(!this.resizable())return false;const change=this.proposal(id,{width,height},source);return !!change&&this.commit(change);}
 protected context(tile:HyDashboardTile<T>):HyDashboardTileContext<T>{return {$implicit:tile,resize:(width,height)=>this.resizeTile(tile.id,width,height),move:(x,y)=>this.moveTile(tile.id,x,y)};}
 cancelInteractions():void{this.dragCancelled=true;this.cancelResize();}
 protected dragStarted(tile:HyDashboardTile<T>):void{this.dragCancelled=false;const change=this.proposal(tile.id,{},'pointer');if(change)this.changeStarted.emit(change);}
 protected dragEnd(event:CdkDragEnd,tile:HyDashboardTile<T>):void{
  if(this.dragCancelled||event.event.type==='touchcancel'){event.source.reset();return;}const rect=this.element.getBoundingClientRect(),cell=(rect.width+this.gap())/this.columns(),direction=getComputedStyle(this.element).direction==='rtl'?-1:1;
  event.source.reset();this.moveTile(tile.id,tile.x+Math.round(event.distance.x/cell)*direction,tile.y+Math.round(event.distance.y/(this.rowHeight()+this.gap())),'pointer');
 }
 protected keys(event:KeyboardEvent,tile:HyDashboardTile<T>,resize=false):void{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();event.stopPropagation();const rtl=getComputedStyle(this.element).direction==='rtl',dx=(event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0)*(rtl?-1:1),dy=event.key==='ArrowDown'?1:event.key==='ArrowUp'?-1:0;
  if(resize)this.resizeTile(tile.id,tile.width+dx,tile.height+dy,'keyboard');else this.moveTile(tile.id,tile.x+dx,tile.y+dy,'keyboard');
 }
 protected startResize(event:PointerEvent,tile:HyDashboardTile<T>):void{
  if(this.blocked()||tile.locked||!this.resizable()||event.button!==0||this.gesture)return;event.preventDefault();event.stopPropagation();const target=event.currentTarget as HTMLElement;target.focus();target.setPointerCapture(event.pointerId);this.gesture={pointer:event.pointerId,x:event.clientX,y:event.clientY,direction:getComputedStyle(this.element).direction==='rtl'?-1:1,width:this.element.getBoundingClientRect().width,tile,target};this.preview.set(tile);this.changeStarted.emit({id:tile.id,previous:tile,next:tile,source:'pointer'});
 }
 protected resizeMove(event:PointerEvent):void{
  const gesture=this.gesture;if(!gesture||gesture.pointer!==event.pointerId)return;if(this.blocked()){this.cancelResize();return;}
  const width=gesture.tile.width+Math.round((event.clientX-gesture.x)/((gesture.width+this.gap())/this.columns()))*gesture.direction,height=gesture.tile.height+Math.round((event.clientY-gesture.y)/(this.rowHeight()+this.gap())),change=this.proposal(gesture.tile.id,{width,height},'pointer');
  if(change&&this.valid(change))this.preview.set(change.next);
 }
 protected finishResize(event:PointerEvent):void{if(this.gesture?.pointer!==event.pointerId)return;const preview=this.preview(),id=this.gesture.tile.id;this.release();if(preview)this.resizeTile(id,preview.width,preview.height,'pointer');}
 cancelResize():void{const tile=this.gesture?.tile;this.release();if(tile)this.changeCancelled.emit(tile);}
 private release():void{const target=this.gesture?.target,pointer=this.gesture?.pointer;this.gesture=null;this.preview.set(null);if(target&&pointer!==undefined&&target.hasPointerCapture(pointer))target.releasePointerCapture(pointer);}
 compact():void{if(!this.blocked())this.setLayout(compactHyDashboardLayout(this.tiles()));}
 setLayout(layout:readonly HyTileRect[]):void{
  if(this.blocked())return;const ids=new Set(this.tiles().map(tile=>tile.id));if(layout.length!==ids.size||layout.some(tile=>!ids.has(tile.id))||!validateHyDashboardLayout(layout,{columns:this.columns(),maxRows:this.maxRows()}))throw new Error('Invalid dashboard layout');
  const next=this.tiles().map(tile=>({...tile,...layout.find(item=>item.id===tile.id)}));for(const tile of this.tiles()){const updated=next.find(item=>item.id===tile.id);if(updated&&(tile.locked&&(updated.x!==tile.x||updated.y!==tile.y||updated.width!==tile.width||updated.height!==tile.height)||updated.width<(tile.minWidth??1)||updated.width>(tile.maxWidth??this.columns())||updated.height<(tile.minHeight??1)||updated.height>(tile.maxHeight??this.maxRows())||!this.canChange()({id:tile.id,previous:tile,next:updated,source:'api'})))throw new Error('Dashboard layout change rejected');}this.tiles.set(next);
 }
 saveLayout():string{return JSON.stringify({version:1,tiles:this.tiles().map(({id,x,y,width,height})=>({id,x,y,width,height}))});}
 restoreLayout(text:string):void{this.setLayout(decodeHyDashboardLayout(text,{columns:this.columns(),maxRows:this.maxRows()},this.tiles().map(tile=>tile.id)));}
}
