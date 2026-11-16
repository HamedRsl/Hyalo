import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import { HySelectableCard, HySelectableCheckbox } from '@hyalo/angular/selectable-card';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/selectable-card';
@Component({selector: 'docs-selectable-card-page', imports: [DocsPage, DocsExample, HyField, HySelectableCard, HySelectableCheckbox], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './selectable-card.html'})
export default class HySelectableCardPage {
 protected readonly examples = [EXAMPLE] as const;
 protected readonly plan = signal('standard');
protected readonly reminder = signal(true);
protected readonly options = [{value:'standard',label:'Standard visit',description:'30 minutes'}, {value:'extended',label:'Extended visit',description:'60 minutes'}];
}
