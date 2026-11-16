import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import { HyTimePicker } from '@hyalo/angular/time-picker';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/time-picker';
@Component({selector: 'docs-time-picker-page', imports: [DocsPage, DocsExample, HyField, HyTimePicker], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './time-picker.html'})
export default class HyTimePickerPage {
 protected readonly examples = [EXAMPLE] as const;
 protected readonly time = signal('10:30');
protected readonly slots = [{value:'09:00'}, {value:'10:30'}, {value:'12:00',disabled:true}, {value:'14:00'}];
}
