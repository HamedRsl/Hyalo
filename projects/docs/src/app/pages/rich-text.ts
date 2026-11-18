import { EXAMPLE } from './examples/rich-text';
import {ChangeDetectionStrategy,Component,signal} from '@angular/core';
import {HyRichText} from '@hyalo/angular/rich-text';
import type {JSONContent} from '@tiptap/core';
import {HY_TEXT_FIELD} from '@hyalo/angular/field';
import {HyButton} from '@hyalo/angular/button';
import {DocsPage} from '../shared/page';
import {DocsExample} from '../shared/example';
import {DocsImport} from '../shared/import';
import {DocsApiTable} from '../shared/api-table';
import {PHASE6_API} from './phase6-api';
@Component({selector:'docs-rich-text-page',imports:[HyRichText,HY_TEXT_FIELD,HyButton,DocsPage,DocsExample,DocsImport,DocsApiTable],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./rich-text.html',styleUrl:'./phase6.css'})
export default class RichTextPage{
  protected readonly example = EXAMPLE;

protected readonly rows=PHASE6_API['rich-text']??[];

protected readonly document=signal<JSONContent|null>({type:'doc',content:[{type:'heading',attrs:{level:2},content:[{type:'text',text:'Release notes'}]},{type:'paragraph',content:[{type:'text',text:'Write the decisions your team needs next.'}]}]});
protected readonly readonly=signal(false);

}
