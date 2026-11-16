import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import { HyMaskedInput } from '@hyalo/angular/masked-input';
import { HyPhoneInput } from '@hyalo/angular/phone-input';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/masked-input';
@Component({selector: 'docs-masked-input-page', imports: [DocsPage, DocsExample, HyField, HyMaskedInput, HyPhoneInput], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './masked-input.html'})
export default class HyMaskedInputPage {
 protected readonly examples = [EXAMPLE] as const;
 protected readonly phone = signal('09123456789');
protected readonly identifier = signal('0012345678');
}
