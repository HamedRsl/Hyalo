import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, TemplateRef, afterNextRender, afterRenderEffect, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { CdkVirtualForOf, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll } from '@angular/cdk/scrolling';
import type { ListRange } from '@angular/cdk/collections';
export interface HyVirtualItemContext<T>{readonly $implicit:T;readonly index:number;readonly count:number;readonly first:boolean;readonly last:boolean;readonly even:boolean;readonly odd:boolean;}
@Component({selector:'hy-virtual-scroller',imports:[NgTemplateOutlet,CdkVirtualForOf,CdkVirtualScrollViewport,CdkFixedSizeVirtualScroll],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./virtual-scroller.html',styleUrl:'./virtual-scroller.css'})
export class HyVirtualScroller<T>{
 readonly items=input.required<readonly T[]>();
 readonly itemSize=input(48);
 readonly height=input(360);
 readonly orientation=input<'vertical'|'horizontal'>('vertical');
 readonly minBufferPx=input(100);
 readonly maxBufferPx=input(240);
 readonly templateCacheSize=input(20);
 readonly appendOnly=input(false);
 readonly itemTemplate=input.required<TemplateRef<HyVirtualItemContext<T>>>();
 readonly itemLabel=input.required<(item:T)=>string>();
 readonly trackBy=input.required<(item:T)=>string|number>();
 readonly label=input('Scrollable items');
 readonly loading=input(false);
 readonly error=input('');
 readonly emptyLabel=input('No items');
 readonly loadingLabel=input('Loading items');
 readonly fallbackCount=input(12);
 readonly rangeChanged=output<ListRange>();
 readonly indexChanged=output<number>();
 readonly retryRequested=output<void>();
 private readonly destroy=inject(DestroyRef);
 private readonly element=inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
 protected readonly viewport=viewChild(CdkVirtualScrollViewport);
 protected readonly ready=signal(false);
 protected readonly baseline=computed(()=>this.items().slice(0,Math.max(1,this.fallbackCount())).map(item=>({key:this.trackBy()(item),label:this.itemLabel()(item)})));
 protected readonly key=computed(()=>{const track=this.trackBy();return (_index:number,item:T):string|number=>track(item);});
 protected readonly size=computed(()=>{const size=this.itemSize();if(!Number.isFinite(size)||size<=0)throw new RangeError('itemSize must be positive');return size;});
 constructor(){
  afterNextRender(()=>{this.ready.set(true);const viewport=this.viewport();const subscription=viewport?.renderedRangeStream.subscribe(range=>this.rangeChanged.emit(range));this.destroy.onDestroy(()=>subscription?.unsubscribe());if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(()=>this.viewport()?.checkViewportSize());observer.observe(this.element);this.destroy.onDestroy(()=>observer.disconnect());}});
  afterRenderEffect(()=>{this.height();this.orientation();if(this.ready())this.viewport()?.checkViewportSize();});
 }
 scrollToIndex(index:number,behavior:ScrollBehavior='auto'):void{this.viewport()?.scrollToIndex(Math.min(Math.max(0,Math.trunc(index)),Math.max(0,this.items().length-1)),behavior);}
 scrollToOffset(offset:number,behavior:ScrollBehavior='auto'):void{this.viewport()?.scrollToOffset(Math.max(0,offset),behavior);}
 scrollToEnd():void{this.scrollToIndex(this.items().length-1);}
 checkViewportSize():void{this.viewport()?.checkViewportSize();}
 measureScrollOffset():number{return this.viewport()?.measureScrollOffset()??0;}
 getRenderedRange():ListRange{return this.viewport()?.getRenderedRange()??{start:0,end:this.baseline().length};}
}
