
import {Component,signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import type {Editor,JSONContent} from '@tiptap/core';
import {HY_TEXT_FIELD} from '@hyalo/angular/field';
import {HyRichText,HY_RICH_TEXT_LOADER,isHyRichTextUrl,getHyRichTextText} from './rich-text';
import type {createEditor} from './engine';
@Component({imports:[HY_TEXT_FIELD,HyRichText],template:'<hy-field label="Case notes" hint="Visible to the team"><hy-rich-text [(value)]="value" [required]="true" [readonly]="readonly()" /></hy-field>'})
class Host{readonly value=signal<JSONContent|null>(null);readonly readonly=signal(false);}
describe('HyRichText',()=>{
 it('rejects script/data/relative URLs and keeps server text readable',()=>{expect(isHyRichTextUrl('javascript:alert(1)')).toBe(false);expect(isHyRichTextUrl('data:image/png;base64,AAAA',true)).toBe(false);expect(isHyRichTextUrl('mailto:team@example.com')).toBe(true);expect(isHyRichTextUrl('/image.png',true)).toBe(false);expect(getHyRichTextText({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Hello'}]},{type:'paragraph',content:[{type:'text',text:'Team'}]}]})).toBe('Hello\nTeam');});
 it('never creates an editor after disposal of an unresolved loader',async()=>{let complete:(engine:{createEditor:typeof createEditor})=>void=()=>undefined;const create=vi.fn();TestBed.configureTestingModule({providers:[{provide:HY_RICH_TEXT_LOADER,useValue:()=>new Promise<{createEditor:typeof createEditor}>(resolve=>complete=resolve)}]});const f=TestBed.createComponent(HyRichText);f.componentRef.setInput('label','Notes');await f.whenStable();f.destroy();complete({createEditor:create as typeof createEditor});await Promise.resolve();await Promise.resolve();expect(create).not.toHaveBeenCalled();});
 it('creates a labelled form surface with current validation metadata',async()=>{
  const attrs:Record<string,string>[]=[];let destroyed=false;
  const editor={getText:()=>'',isEmpty:true,setEditable:vi.fn(),setOptions:(options:{editorProps?:{attributes?:Record<string,string>}})=>{if(options.editorProps?.attributes)attrs.push(options.editorProps.attributes);},commands:{setContent:()=>true,focus:()=>true},destroy:()=>{destroyed=true;},isActive:()=>false,can:()=>({undo:()=>false,redo:()=>false})};
  TestBed.configureTestingModule({providers:[{provide:HY_RICH_TEXT_LOADER,useValue:async()=>({createEditor:(_element:HTMLElement,options:Parameters<typeof createEditor>[1])=>{attrs.push(options.editor.editorProps?.attributes as Record<string,string>);return editor as unknown as Editor;}})}]});
  const f=TestBed.createComponent(Host);await f.whenStable();await Promise.resolve();await f.whenStable();expect(attrs.length).toBeGreaterThan(0);const attributes=attrs[attrs.length-1]!;expect(attributes['aria-required']).toBe('true');expect(attributes['aria-labelledby']).toContain('field');expect(attributes['aria-describedby']).toContain('hint');f.componentInstance.readonly.set(true);await f.whenStable();expect(editor.setEditable).toHaveBeenCalledWith(false,false);f.destroy();expect(destroyed).toBe(true);
 });
});
