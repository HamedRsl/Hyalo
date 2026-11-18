import { NgTemplateOutlet } from '@angular/common';
import { Tree,TreeItem,TreeItemGroup } from '@angular/aria/tree';
import { ChangeDetectionStrategy,Component,DestroyRef,ElementRef,TemplateRef,computed,effect,inject,input,model,output,signal,viewChild } from '@angular/core';
import { HyLocale,injectId,normalizeSearch } from '@hyalo/angular/core';
import { HyIcon } from '@hyalo/angular/icon';
import { flattenHyTree,setHyTreeChecked,canMoveHyTreeNode,type HyTreeNode,type HyTreeKey,type HyTreeMove } from './tree-model';
export interface HyTreeNodeContext<T>{readonly $implicit:HyTreeNode<T>;readonly level:number;readonly expanded:boolean;readonly selected:boolean;readonly checked:boolean;readonly indeterminate:boolean;}
export interface HyTreeNodeEvent<T>{readonly node:HyTreeNode<T>;readonly originalEvent?:Event;}
export type HyTreeLoader<T>=(node:HyTreeNode<T>,signal:AbortSignal)=>Promise<readonly HyTreeNode<T>[]>;
interface TreeView<T> extends HyTreeNodeContext<T>{readonly node:HyTreeNode<T>;readonly children:readonly TreeView<T>[];readonly loading:boolean;readonly error:string;readonly expandable:boolean;readonly id:string;}
@Component({selector:'hy-tree',imports:[NgTemplateOutlet,Tree,TreeItem,TreeItemGroup,HyIcon],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./tree.html',styleUrl:'./tree.css'})
export class HyTree<T>{
 readonly nodes=input.required<readonly HyTreeNode<T>[]>();
 readonly label=input('Tree');readonly disabled=input(false);readonly selectionMode=input<'none'|'single'|'multiple'|'checkbox'>('single');
 readonly selectedKeys=model<readonly HyTreeKey[]>([]);readonly checkedKeys=model<readonly HyTreeKey[]>([]);readonly expandedKeys=model<readonly HyTreeKey[]>([]);
 readonly checkStrictly=input(false);readonly filter=model('');readonly locale=input<string>();readonly showLines=input(false);readonly indent=input(24);
 readonly loading=input(false);readonly emptyLabel=input('No matching items');readonly loadChildren=input<HyTreeLoader<T>>();
 readonly nodeTemplate=input<TemplateRef<HyTreeNodeContext<T>>>();readonly draggable=input(false);readonly canDrop=input<(move:HyTreeMove)=>boolean>(()=>true);
 readonly nodeActivated=output<HyTreeNodeEvent<T>>();readonly nodeContext=output<HyTreeNodeEvent<T>>();
 readonly expanded=output<{readonly node:HyTreeNode<T>;readonly expanded:boolean}>();readonly loadError=output<{readonly node:HyTreeNode<T>;readonly error:unknown}>();readonly moveRequested=output<HyTreeMove>();
 private readonly globalLocale=inject(HyLocale);private readonly destroy=inject(DestroyRef);private readonly element=inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
 private readonly prefix=injectId('tree');private readonly loaded=signal<ReadonlyMap<HyTreeKey,readonly HyTreeNode<T>[]>>(new Map());private readonly busy=signal<ReadonlySet<HyTreeKey>>(new Set());private readonly failures=signal<ReadonlyMap<HyTreeKey,string>>(new Map());private readonly requests=new Map<HyTreeKey,AbortController>();
 private readonly tree=viewChild(Tree);
 private dragged:HyTreeKey|null=null;
 readonly resolved=computed(()=>{flattenHyTree(this.nodes());const cache=this.loaded(),seen=new Set<HyTreeKey>();const visit=(nodes:readonly HyTreeNode<T>[]):readonly HyTreeNode<T>[]=>nodes.map(node=>{if(seen.has(node.key))throw new Error('Tree keys must be unique and acyclic');seen.add(node.key);return {...node,children:node.children?visit(node.children):cache.has(node.key)?visit(cache.get(node.key)??[]):undefined};});const nodes=visit(this.nodes());flattenHyTree(nodes);return nodes;});
 protected readonly selection=computed(()=>[...(this.selectionMode()==='checkbox'?this.checkedKeys():this.selectedKeys())]);
 protected readonly multi=computed(()=>this.selectionMode()==='multiple'||this.selectionMode()==='checkbox');
 protected readonly view=computed(()=>{
  const query=normalizeSearch(this.filter(),this.locale()??this.globalLocale.locale()),checked=new Set(this.checkedKeys()),selected=new Set(this.selectedKeys()),expanded=new Set(this.expandedKeys()),busy=this.busy(),failures=this.failures();
  const walk=(nodes:readonly HyTreeNode<T>[],level:number):readonly TreeView<T>[]=>nodes.filter(node=>!node.hidden).map(node=>{
   const children=walk(node.children??[],level+1),descendants=flattenHyTree(node.children??[]).filter(item=>!item.node.disabled&&item.node.checkable!==false);
   const partial=descendants.some(item=>checked.has(item.node.key))&&!checked.has(node.key);
   return {$implicit:node,node,level,children,expanded:expanded.has(node.key)||!!(query&&children.length),selected:selected.has(node.key),checked:checked.has(node.key),indeterminate:partial,loading:busy.has(node.key),error:failures.get(node.key)??'',expandable:node.leaf===false||!!node.children?.length,id:this.prefix+'-'+typeof node.key+'-'+encodeURIComponent(String(node.key))};
  }).filter(item=>!query||normalizeSearch(item.node.label,this.locale()??this.globalLocale.locale()).includes(query)||item.children.length);
  return walk(this.resolved(),1);
 });
 protected readonly errors=computed(()=>[...this.failures()].map(([key,message])=>({key,message})));
 constructor(){effect(()=>{this.nodes();for(const request of this.requests.values())request.abort();this.requests.clear();this.loaded.set(new Map());this.busy.set(new Set());this.failures.set(new Map());});this.destroy.onDestroy(()=>{for(const request of this.requests.values())request.abort();});}
 protected pick(keys:readonly HyTreeKey[]):void{
  if(this.disabled()||this.selectionMode()==='none')return;
  if(this.selectionMode()==='checkbox'){const old=this.checkedKeys(),changed=keys.find(key=>!old.includes(key))??old.find(key=>!keys.includes(key));if(changed!==undefined)this.checkedKeys.set(setHyTreeChecked(this.resolved(),old,changed,keys.includes(changed),!this.checkStrictly()));}
  else this.selectedKeys.set(this.selectionMode()==='single'?keys.slice(-1):keys);
 }
 toggle(key:HyTreeKey,open?:boolean):void{
  const node=flattenHyTree(this.resolved()).find(item=>item.node.key===key)?.node;if(!node||this.disabled()||node.disabled||node.leaf===true)return;
  const next=new Set(this.expandedKeys()),expanded=open??!next.has(key);if(expanded)next.add(key);else next.delete(key);this.expandedKeys.set([...next]);this.expanded.emit({node,expanded});
  if(expanded&&!node.children&&node.leaf===false)void this.load(key);
  else if(!expanded){this.requests.get(key)?.abort();this.requests.delete(key);this.busy.update(current=>new Set([...current].filter(item=>item!==key)));}
 }
 expandAll():void{if(!this.disabled())this.expandedKeys.set(flattenHyTree(this.resolved()).filter(item=>item.node.children?.length||item.node.leaf===false).map(item=>item.node.key));}
 collapseAll():void{if(!this.disabled()){for(const request of this.requests.values())request.abort();this.requests.clear();this.busy.set(new Set());this.expandedKeys.set([]);}}
 selectAll():void{if(this.disabled()||!this.multi())return;const keys=flattenHyTree(this.resolved()).filter(item=>!item.node.disabled&&(this.selectionMode()==='checkbox'?item.node.checkable!==false:item.node.selectable!==false)).map(item=>item.node.key);if(this.selectionMode()==='checkbox')this.checkedKeys.set(keys);else this.selectedKeys.set(keys);}
 clearSelection():void{if(!this.disabled()){this.selectedKeys.set([]);this.checkedKeys.set([]);}}
 focusNode(key:HyTreeKey):void{this.element.querySelector<HTMLElement>('#'+CSS.escape(this.prefix+'-'+typeof key+'-'+encodeURIComponent(String(key))))?.focus();}
 scrollActiveItemIntoView():void{this.tree()?.scrollActiveItemIntoView();}
 requestMove(move:HyTreeMove):boolean{if(this.disabled()||!this.draggable()||!canMoveHyTreeNode(this.resolved(),move)||!this.canDrop()(move))return false;this.moveRequested.emit(move);return true;}
 protected dragStart(event:DragEvent,node:HyTreeNode<T>):void{if(this.disabled()||!this.draggable()||node.disabled){event.preventDefault();return;}this.dragged=node.key;event.dataTransfer?.setData('text/plain',node.label);if(event.dataTransfer)event.dataTransfer.effectAllowed='move';}
 protected dragEnd():void{this.dragged=null;}
 protected dragOver(event:DragEvent,node:HyTreeNode<T>):void{if(this.dragged!==null&&canMoveHyTreeNode(this.resolved(),{key:this.dragged,parent:node.key,index:node.children?.length??0})){event.preventDefault();event.stopPropagation();}}
 protected drop(event:DragEvent,node:HyTreeNode<T>):void{if(this.dragged===null)return;event.preventDefault();event.stopPropagation();this.requestMove({key:this.dragged,parent:node.key,index:node.children?.length??0});this.dragged=null;}
 protected moveKeys(event:KeyboardEvent,node:HyTreeNode<T>):void{
  if(!event.altKey||!this.draggable()||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))return;
  event.preventDefault();event.stopPropagation();const all=flattenHyTree(this.resolved()),entry=all.find(item=>item.node.key===node.key);if(!entry)return;
  const siblings=entry.parent===null?this.resolved():all.find(item=>item.node.key===entry.parent)?.node.children??[],index=siblings.findIndex(item=>item.key===node.key);
  if(event.key==='ArrowUp'&&index>0)this.requestMove({key:node.key,parent:entry.parent,index:index-1});
  else if(event.key==='ArrowDown'&&index<siblings.length-1)this.requestMove({key:node.key,parent:entry.parent,index:index+1});
  else if(event.key==='ArrowRight'){const previous=siblings[index-1];if(previous)this.requestMove({key:node.key,parent:previous.key,index:previous.children?.length??0});}
  else if(event.key==='ArrowLeft'&&entry.parent!==null){const parent=all.find(item=>item.node.key===entry.parent);if(parent){const uncles=parent.parent===null?this.resolved():all.find(item=>item.node.key===parent.parent)?.node.children??[];this.requestMove({key:node.key,parent:parent.parent,index:uncles.findIndex(item=>item.key===parent.node.key)+1});}}
 }
 protected activate(node:HyTreeNode<T>,event:Event):void{if(!this.disabled()&&!node.disabled)this.nodeActivated.emit({node,originalEvent:event});}
 protected context(node:HyTreeNode<T>,event:Event):void{if(!this.disabled()&&!node.disabled)this.nodeContext.emit({node,originalEvent:event});}
 async load(key:HyTreeKey):Promise<void>{
  const loader=this.loadChildren(),node=flattenHyTree(this.resolved()).find(item=>item.node.key===key)?.node;if(!loader||!node||this.requests.has(key)||this.disabled())return;
  const controller=new AbortController();this.requests.set(key,controller);this.busy.update(keys=>new Set([...keys,key]));this.failures.update(errors=>new Map([...errors].filter(([id])=>id!==key)));
  try{const children=await loader(node,controller.signal);if(controller.signal.aborted||this.destroy.destroyed||this.requests.get(key)!==controller)return;flattenHyTree(children);this.loaded.update(cache=>new Map([...cache,[key,children]]));}
  catch(error){if(!controller.signal.aborted&&!this.destroy.destroyed){this.failures.update(errors=>new Map([...errors,[key,'Could not load '+node.label]]));this.loadError.emit({node,error});}}
  finally{if(this.requests.get(key)===controller){this.requests.delete(key);this.busy.update(keys=>new Set([...keys].filter(id=>id!==key)));}}
 }
}
