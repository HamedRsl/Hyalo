
import { ChangeDetectionStrategy,Component,DestroyRef,ElementRef,InjectionToken,afterNextRender,afterRenderEffect,computed,inject,input,model,output,signal,untracked,viewChild } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
import type { Editor,EditorOptions,Extensions,JSONContent } from '@tiptap/core';
import type { StarterKitOptions } from '@tiptap/starter-kit';
export type HyRichTextCommand='bold'|'italic'|'underline'|'strike'|'code'|'bulletList'|'orderedList'|'blockquote'|'horizontalRule'|'undo'|'redo'|'clear'|'paragraph'|'heading1'|'heading2'|'heading3';
export interface HyRichTextAction{readonly command:HyRichTextCommand;readonly label:string;}
export const HY_RICH_TEXT_ACTIONS:readonly HyRichTextAction[]=[{command:'bold',label:'Bold'},{command:'italic',label:'Italic'},{command:'underline',label:'Underline'},{command:'strike',label:'Strike through'},{command:'heading2',label:'Heading'},{command:'bulletList',label:'Bullet list'},{command:'orderedList',label:'Numbered list'},{command:'blockquote',label:'Quote'},{command:'undo',label:'Undo'},{command:'redo',label:'Redo'}];
export function getHyRichTextText(value:JSONContent|null):string{
 const visit=(node:JSONContent,depth:number):string=>depth>100?'':(node.text??'')+(node.content?.map(child=>visit(child,depth+1)).join(node.type==='doc'?'\n':'')??'');return value?visit(value,0):'';
}
export function isHyRichTextUrl(value:string,image=false):boolean{
 try{const url=new URL(value);return (image?['https:','http:']:['https:','http:','mailto:','tel:']).includes(url.protocol);}catch{return false;}
}
let engine:Promise<typeof import('./engine')>|undefined;
const loadEngine=():Promise<typeof import('./engine')>=>engine??=import('./engine').catch((error:unknown)=>{engine=undefined;throw error;});
export const HY_RICH_TEXT_LOADER=new InjectionToken<()=>Promise<typeof import('./engine')>>('HY_RICH_TEXT_LOADER',{providedIn:'root',factory:()=>loadEngine});
@Component({selector:'hy-rich-text',changeDetection:ChangeDetectionStrategy.OnPush,host:{'(focusout)':'leave($event)'},templateUrl:'./rich-text.html',styleUrl:'./rich-text.css'})
export class HyRichText extends HyValueControl implements FormValueControl<JSONContent|null>{
 override readonly labelable=false;readonly value=model<JSONContent|null>(null);readonly placeholder=input('Write something');readonly minHeight=input('12rem');readonly maxHeight=input('32rem');
 readonly toolbar=input<readonly HyRichTextAction[]>(HY_RICH_TEXT_ACTIONS);readonly showToolbar=input(true);readonly showCount=input(true);readonly characterLimit=input<number|null>(null);readonly images=input(false);readonly links=input(true);
 readonly starterKit=input<Partial<StarterKitOptions>>({});readonly extensions=input<Extensions|(()=>Promise<Extensions>)>([]);readonly editorOptions=input<Partial<EditorOptions>>({});
 readonly initialized=output<Editor>();readonly updated=output<{readonly json:JSONContent|null;readonly html:string;readonly text:string}>();readonly selectionChanged=output<{readonly from:number;readonly to:number}>();readonly focused=output<void>();readonly blurred=output<void>();readonly failed=output<unknown>();
 private readonly load=inject(HY_RICH_TEXT_LOADER);private readonly destroy=inject(DestroyRef);private readonly mount=viewChild.required<ElementRef<HTMLElement>>('mount');private editor:Editor|undefined;private revision=0;private lastValue='';
 protected readonly ready=signal(false);protected readonly status=signal<'loading'|'ready'|'error'>('loading');protected readonly revisionSignal=signal(0);protected readonly characters=signal(0);protected readonly urlEditor=signal<'link'|'image'|null>(null);protected readonly url=signal('');protected readonly urlError=signal('');
 protected readonly fallback=computed(()=>getHyRichTextText(this.value())||this.placeholder());protected readonly actions=computed(()=>this.toolbar().map(action=>({...action,active:this.active(action.command),available:this.available(action.command)})));
 private readonly settings=computed(()=>({starterKit:this.starterKit(),extensions:this.extensions(),placeholder:this.placeholder(),limit:this.characterLimit(),images:this.images(),options:this.editorOptions()}));
 constructor(){
  super();afterNextRender(()=>this.ready.set(true));
  afterRenderEffect(()=>{const ready=this.ready(),settings=this.settings();if(ready)untracked(()=>{void this.initialize(settings);});});
  afterRenderEffect(()=>{this.status();const value=this.value(),blocked=this.blocked(),label=this.label(),name=this.name(),invalid=this.showsError(),describedBy=this.describedBy(),required=this.required();untracked(()=>{
   if(!this.editor)return;this.editor.setEditable(!blocked,false);this.editor.setOptions({editorProps:{...this.editorOptions().editorProps,attributes:{...(this.editorOptions().editorProps?.attributes instanceof Function?{}:this.editorOptions().editorProps?.attributes),class:'hy-rich-text-content',id:this.id(),role:'textbox','aria-multiline':'true',...(this.field?{'aria-labelledby':this.field.labelId}:{'aria-label':label||'Rich text'}),'aria-readonly':String(this.readonly()),'aria-disabled':String(this.disabled()),'aria-required':String(required),'aria-invalid':String(invalid),...(describedBy?{'aria-describedby':describedBy}:{}),...(name?{'data-name':name}:{})}}});
   const serialized=JSON.stringify(value);if(serialized!==this.lastValue){try{this.editor.commands.setContent(value??{type:'doc',content:[{type:'paragraph'}]},{emitUpdate:false,errorOnInvalidContent:true});this.lastValue=serialized;this.refreshState();}catch(error){this.failed.emit(error);}}
  });});
  this.destroy.onDestroy(()=>{this.revision++;this.editor?.destroy();this.editor=undefined;});
 }
 private async initialize(settings:ReturnType<HyRichText['settings']>):Promise<void>{
  const revision=++this.revision;this.editor?.destroy();this.editor=undefined;this.mount().nativeElement.replaceChildren();this.status.set('loading');
  try{
   const [engine,extensions]=await Promise.all([this.load(),typeof settings.extensions==='function'?settings.extensions():settings.extensions]);if(this.destroy.destroyed||revision!==this.revision)return;
   const options=settings.options,editor=engine.createEditor(this.mount().nativeElement,{starterKit:settings.starterKit,extensions,placeholder:settings.placeholder,limit:settings.limit,images:settings.images,editor:{...options,editable:!this.blocked(),content:this.value()??{type:'doc',content:[{type:'paragraph'}]},editorProps:{...options.editorProps,attributes:{...(typeof options.editorProps?.attributes==='object'?options.editorProps.attributes:{}),class:'hy-rich-text-content',id:this.id(),role:'textbox','aria-multiline':'true',...(this.field?{'aria-labelledby':this.field.labelId}:{'aria-label':this.label()||'Rich text'}),'aria-readonly':String(this.readonly()),'aria-disabled':String(this.disabled()),'aria-required':String(this.required()),'aria-invalid':String(this.showsError()),...(this.describedBy()?{'aria-describedby':this.describedBy()??''}:{})}},
    onUpdate:(props)=>{if(!this.blocked()){const json=props.editor.isEmpty?null:props.editor.getJSON();this.lastValue=JSON.stringify(json);this.value.set(json);this.updated.emit({json,html:props.editor.getHTML(),text:props.editor.getText()});}this.refreshState();options.onUpdate?.(props);},
    onSelectionUpdate:(props)=>{this.selectionChanged.emit({from:props.editor.state.selection.from,to:props.editor.state.selection.to});this.refreshState();options.onSelectionUpdate?.(props);},
    onFocus:(props)=>{this.focused.emit();options.onFocus?.(props);},onBlur:(props)=>{this.blurred.emit();options.onBlur?.(props);},onTransaction:(props)=>{this.refreshState();options.onTransaction?.(props);},
   }});
   this.editor=editor;this.lastValue=JSON.stringify(this.value());this.status.set('ready');this.refreshState();this.initialized.emit(editor);
  }catch(error){if(!this.destroy.destroyed&&revision===this.revision){this.status.set('error');this.failed.emit(error);}}
 }
 private refreshState():void{this.characters.set(this.editor?.getText().length??0);this.revisionSignal.update(value=>value+1);}
 private active(command:HyRichTextCommand):boolean{this.revisionSignal();if(command.startsWith('heading'))return this.editor?.isActive('heading',{level:Number(command.slice(-1))})??false;return this.editor?.isActive(command)??false;}
 private available(command:HyRichTextCommand):boolean{this.revisionSignal();if(!this.editor||this.blocked())return false;if(command==='undo')return this.editor.can().undo();if(command==='redo')return this.editor.can().redo();return true;}
 run(command:HyRichTextCommand):boolean{
  if(!this.editor||this.blocked())return false;const chain=this.editor.chain().focus();switch(command){
   case 'bold':return chain.toggleBold().run();case 'italic':return chain.toggleItalic().run();case 'underline':return chain.toggleUnderline().run();case 'strike':return chain.toggleStrike().run();case 'code':return chain.toggleCode().run();
   case 'bulletList':return chain.toggleBulletList().run();case 'orderedList':return chain.toggleOrderedList().run();case 'blockquote':return chain.toggleBlockquote().run();case 'horizontalRule':return chain.setHorizontalRule().run();
   case 'undo':return chain.undo().run();case 'redo':return chain.redo().run();case 'clear':return chain.clearNodes().unsetAllMarks().run();case 'paragraph':return chain.setParagraph().run();
   case 'heading1':return chain.toggleHeading({level:1}).run();case 'heading2':return chain.toggleHeading({level:2}).run();case 'heading3':return chain.toggleHeading({level:3}).run();
  }
 }
 setLink(href:string):boolean{if(!this.editor||this.blocked()||!this.links()||href&&!isHyRichTextUrl(href))return false;return href?this.editor.chain().focus().extendMarkRange('link').setLink({href}).run():this.editor.chain().focus().extendMarkRange('link').unsetLink().run();}
 insertImage(src:string,alt=''):boolean{if(!this.editor||this.blocked()||!this.images()||!isHyRichTextUrl(src,true))return false;return this.editor.chain().focus().setImage({src,alt}).run();}
 getEditor():Editor|undefined{return this.editor;}
 getHTML():string{return this.editor?.getHTML()??'';}
 getText():string{return this.editor?.getText()??getHyRichTextText(this.value());}
 setHTML(html:string):boolean{if(!this.editor||this.blocked())return false;return this.editor.commands.setContent(html,{emitUpdate:true,errorOnInvalidContent:true});}
 override focus():void{this.editor?.commands.focus();}
 reset():void{this.urlEditor.set(null);this.urlError.set('');if(this.editor){this.editor.commands.setContent(this.value()??{type:'doc',content:[{type:'paragraph'}]},{emitUpdate:false});this.lastValue=JSON.stringify(this.value());this.refreshState();}}
 retry():void{if(this.ready()&&this.status()==='error')void this.initialize(this.settings());}
 protected editUrl(kind:'link'|'image'):void{this.urlEditor.set(kind);this.url.set(kind==='link'?String(this.editor?.getAttributes('link')['href']??''):'');this.urlError.set('');}
 protected applyUrl():void{const applied=this.urlEditor()==='link'?this.setLink(this.url()):this.insertImage(this.url());if(applied)this.urlEditor.set(null);else this.urlError.set('Enter an absolute HTTP or HTTPS URL. Links also accept mailto and tel.');}
 protected updateUrl(event:Event):void{this.url.set((event.target as HTMLInputElement).value);}
}
