import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy,Component,DestroyRef,ElementRef,TemplateRef,computed,inject,input,model,output,signal } from '@angular/core';
import { injectId } from '@hyalo/angular/core';
import { constrainHyPaneSizes,resizeHyPanes } from './sizes';
export interface HySplitterPane<T=unknown>{readonly id:string;readonly label:string;readonly data?:T;readonly size?:number;readonly min?:number;readonly max?:number;readonly collapsible?:boolean;readonly template?:TemplateRef<HySplitterContext<T>>;}
export interface HySplitterContext<T>{readonly $implicit:HySplitterPane<T>;readonly index:number;readonly collapsed:boolean;}
export interface HySplitterResizeEvent{readonly index:number;readonly sizes:readonly number[];readonly source:'pointer'|'keyboard'|'api';}
interface SplitGesture{readonly pointer:number;readonly index:number;readonly coordinate:number;readonly dimension:number;readonly direction:number;readonly sizes:readonly number[];readonly target:HTMLElement;}
@Component({selector:'hy-splitter',imports:[NgTemplateOutlet],changeDetection:ChangeDetectionStrategy.OnPush,host:{'(keydown.escape)':'cancel()'},templateUrl:'./splitter.html',styleUrl:'./splitter.css'})
export class HySplitter<T>{
 readonly panes=input.required<readonly HySplitterPane<T>[]>();
 readonly sizes=model<readonly number[]>([]);readonly collapsed=model<readonly string[]>([]);
 readonly orientation=input<'horizontal'|'vertical'>('horizontal');readonly disabled=input(false);readonly gutterSize=input(12);readonly keyboardStep=input(2);readonly minPaneSize=input(0);
 readonly label=input('Resizable panes');readonly paneTemplate=input<TemplateRef<HySplitterContext<T>>>();readonly height=input<string>('24rem');
 readonly resizeStarted=output<HySplitterResizeEvent>();readonly resized=output<HySplitterResizeEvent>();readonly resizeEnded=output<HySplitterResizeEvent>();readonly resizeCancelled=output<HySplitterResizeEvent>();
 readonly paneCollapsed=output<{readonly id:string;readonly collapsed:boolean}>();
 private readonly element=inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;private readonly destroy=inject(DestroyRef);private readonly prefix=injectId('splitter');
 private gesture:SplitGesture|null=null;private readonly previousSizes=new Map<string,number>();protected readonly dragging=signal(false);
 readonly effectiveSizes=computed(()=>constrainHyPaneSizes(this.sizes().length?this.sizes():this.panes().map(pane=>pane.size??1),this.constraints()));
 protected readonly view=computed(()=>{const sizes=this.effectiveSizes(),collapsed=new Set(this.collapsed()),panes=this.panes();const ids=new Set<string>();return panes.map((pane,index)=>{if(ids.has(pane.id))throw new Error('Duplicate splitter pane id: '+pane.id);ids.add(pane.id);return {pane,index,id:this.prefix+'-'+encodeURIComponent(pane.id),size:sizes[index]??0,collapsed:collapsed.has(pane.id),context:{$implicit:pane,index,collapsed:collapsed.has(pane.id)},template:pane.template??this.paneTemplate(),min:pane.min??this.minPaneSize(),max:pane.max??100};});});
 private bounds(collapsed:ReadonlySet<string>):readonly {min:number;max:number}[]{return this.panes().map(pane=>({min:collapsed.has(pane.id)?0:pane.min??this.minPaneSize(),max:collapsed.has(pane.id)?0:pane.max??100}));}
 protected readonly constraints=computed(()=>this.bounds(new Set(this.collapsed())));
 constructor(){this.destroy.onDestroy(()=>this.release());}
 resize(index:number,delta:number,source:'pointer'|'keyboard'|'api'='api'):boolean{
  if(this.disabled())return false;const next=resizeHyPanes(this.effectiveSizes(),index,delta,this.constraints());if(next===this.effectiveSizes())return false;this.sizes.set(next);this.resized.emit({index,sizes:next,source});return true;
 }
 setSizes(sizes:readonly number[]):void{if(!this.disabled())this.sizes.set(constrainHyPaneSizes(sizes,this.constraints()));}
 togglePane(id:string):void{
  const index=this.panes().findIndex(pane=>pane.id===id),pane=this.panes()[index];if(this.disabled()||!pane?.collapsible||this.panes().length<2)return;
  const collapsed=new Set(this.collapsed()),sizes=[...this.effectiveSizes()];
  if(collapsed.has(id)){sizes[index]=this.previousSizes.get(id)??pane.size??20;collapsed.delete(id);}
  else{this.previousSizes.set(id,sizes[index]??0);sizes[index]=0;collapsed.add(id);}
  let next:readonly number[];try{next=constrainHyPaneSizes(sizes,this.bounds(collapsed));}catch{return;}
  this.sizes.set(next);this.collapsed.set([...collapsed]);this.paneCollapsed.emit({id,collapsed:collapsed.has(id)});
 }
 protected start(event:PointerEvent,index:number):void{
  if(this.disabled()||event.button!==0||this.gesture)return;
  const target=event.currentTarget as HTMLElement,rect=this.element.getBoundingClientRect(),horizontal=this.orientation()==='horizontal';const dimension=horizontal?rect.width:rect.height;if(dimension<=0)return;
  event.preventDefault();target.focus();target.setPointerCapture(event.pointerId);this.gesture={pointer:event.pointerId,index,coordinate:horizontal?event.clientX:event.clientY,dimension,direction:horizontal&&getComputedStyle(this.element).direction==='rtl'?-1:1,sizes:[...this.effectiveSizes()],target};this.dragging.set(true);this.resizeStarted.emit({index,sizes:this.effectiveSizes(),source:'pointer'});
 }
 protected move(event:PointerEvent):void{
  const gesture=this.gesture;if(!gesture||gesture.pointer!==event.pointerId)return;if(this.disabled()){this.cancel();return;}
  const coordinate=this.orientation()==='horizontal'?event.clientX:event.clientY,delta=(coordinate-gesture.coordinate)/gesture.dimension*100*gesture.direction;
  const next=resizeHyPanes(gesture.sizes,gesture.index,delta,this.constraints());this.sizes.set(next);this.resized.emit({index:gesture.index,sizes:next,source:'pointer'});
 }
 protected finish(event:PointerEvent):void{if(!this.gesture||this.gesture.pointer!==event.pointerId)return;const index=this.gesture.index;this.release();this.resizeEnded.emit({index,sizes:this.effectiveSizes(),source:'pointer'});}
 cancel():void{const gesture=this.gesture;if(!gesture)return;this.sizes.set(gesture.sizes);this.release();this.resizeCancelled.emit({index:gesture.index,sizes:gesture.sizes,source:'pointer'});}
 private release():void{const gesture=this.gesture;this.gesture=null;this.dragging.set(false);if(gesture?.target.hasPointerCapture(gesture.pointer))gesture.target.releasePointerCapture(gesture.pointer);}
 protected keys(event:KeyboardEvent,index:number):void{
  if(this.disabled())return;const horizontal=this.orientation()==='horizontal',rtl=getComputedStyle(this.element).direction==='rtl';let delta:number;
  if(event.key==='Home')delta=-100;else if(event.key==='End')delta=100;else if(event.key===(horizontal?'ArrowRight':'ArrowDown'))delta=this.keyboardStep()*(horizontal&&rtl?-1:1);else if(event.key===(horizontal?'ArrowLeft':'ArrowUp'))delta=-this.keyboardStep()*(horizontal&&rtl?-1:1);else if(event.key==='Enter'){event.preventDefault();const id=this.panes()[index]?.id;if(id)this.togglePane(id);return;}else return;
  event.preventDefault();this.resizeStarted.emit({index,sizes:this.effectiveSizes(),source:'keyboard'});this.resize(index,delta,'keyboard');this.resizeEnded.emit({index,sizes:this.effectiveSizes(),source:'keyboard'});
 }
}
