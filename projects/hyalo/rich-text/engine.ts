
import { Editor,type EditorOptions,type Extensions } from '@tiptap/core';
import { StarterKit,type StarterKitOptions } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
export interface HyRichTextEngineOptions{readonly editor:Partial<EditorOptions>;readonly starterKit:Partial<StarterKitOptions>;readonly extensions:Extensions;readonly placeholder:string;readonly limit:number|null;readonly images:boolean;}
export function createEditor(element:HTMLElement,options:HyRichTextEngineOptions):Editor{
 return new Editor({...options.editor,element,extensions:[StarterKit.configure({...options.starterKit,link:options.starterKit.link===false?false:{openOnClick:false,...options.starterKit.link}}),Placeholder.configure({placeholder:options.placeholder}),CharacterCount.configure({limit:options.limit}),...(options.images?[Image.configure({allowBase64:false})]:[]),...options.extensions]});
}
