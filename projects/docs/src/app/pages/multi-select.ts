import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import { HyMultiSelect } from '@hyalo/angular/multi-select';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/multi-select';
@Component({selector: 'docs-multi-select-page', imports: [DocsPage, DocsExample, HyField, HyMultiSelect], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './multi-select.html'})
export default class HyMultiSelectPage {
 protected readonly examples = [EXAMPLE] as const;
 protected readonly values = signal<readonly string[]>(['design']);
protected readonly options = [{value:'design',label:'Design'}, {value:'engineering',label:'Engineering'}, {value:'research',label:'Research'}, {value:'legal',label:'Legal',disabled:true}];
}
