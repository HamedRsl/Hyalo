import { ChangeDetectionStrategy, Component, Directive, ElementRef, TemplateRef, inject, input, output } from '@angular/core';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem, CdkMenuItemCheckbox, CdkMenuItemRadio, CdkMenuTrigger } from '@angular/cdk/menu';
import { NgTemplateOutlet } from '@angular/common';
import { HyIcon } from '@hyalo/angular/icon';
import { HyMaterialDirective } from '@hyalo/angular/core';
export interface HyContextAction<T=unknown>{readonly id:string;readonly label:string;readonly icon?:string;readonly shortcut?:string;readonly disabled?:boolean;readonly hidden?:boolean;readonly separator?:boolean;readonly checked?:boolean;readonly role?:'item'|'checkbox'|'radio';readonly children?:readonly HyContextAction<T>[];readonly data?:T;}
export interface HyContextActionEvent<T>{readonly action:HyContextAction<T>;readonly context:T|null;}
@Directive({selector:'[hyContextMenuTriggerFor]',exportAs:'hyContextMenuTrigger',hostDirectives:[{directive:CdkContextMenuTrigger,inputs:['cdkContextMenuTriggerFor:hyContextMenuTriggerFor','cdkContextMenuTriggerData:hyContextMenuData','cdkContextMenuPosition:positions','cdkContextMenuDisabled:disabled'],outputs:['cdkContextMenuOpened:opened','cdkContextMenuClosed:closed']}],host:{'(keydown)':'keys($event)'}})
export class HyContextMenuTrigger{
 private readonly trigger=inject(CdkContextMenuTrigger);private readonly element=inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
 openAt(point:{readonly x:number;readonly y:number}):void{if(!this.trigger.disabled)this.trigger.open(point);}
 open():void{const rect=this.element.getBoundingClientRect();this.openAt({x:rect.x,y:rect.bottom});}
 close():void{this.trigger.close();}
 isOpen():boolean{return this.trigger.isOpen();}
 protected keys(event:KeyboardEvent):void{if(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10')){event.preventDefault();this.open();}}
}
@Component({selector:'hy-context-menu',imports:[HyIcon,NgTemplateOutlet,CdkMenuItem,CdkMenuItemCheckbox,CdkMenuItemRadio,CdkMenuTrigger],hostDirectives:[CdkMenu,{directive:HyMaterialDirective,inputs:['hyMaterial:material']}],changeDetection:ChangeDetectionStrategy.OnPush,host:{class:'hy-context-menu','[attr.aria-label]':'label()'},templateUrl:'./context-menu.html',styleUrl:'./context-menu.css'})
export class HyContextMenu<T=unknown>{
 readonly items=input<readonly HyContextAction<T>[]>([]);readonly context=input<T|null>(null);readonly label=input('Context actions');readonly itemTemplate=input<TemplateRef<{$implicit:HyContextAction<T>;context:T|null}>>();
 readonly activated=output<HyContextActionEvent<T>>();
 activate(action:HyContextAction<T>):void{if(!action.disabled&&!action.hidden&&!action.separator&&!action.children?.length)this.activated.emit({action,context:this.context()});}
}
