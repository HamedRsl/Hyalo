import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import { HyPassword } from '@hyalo/angular/password';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/password';
@Component({selector: 'docs-password-page', imports: [DocsPage, DocsExample, HyField, HyPassword], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './password.html'})
export default class HyPasswordPage {
 protected readonly examples = [EXAMPLE] as const;
 protected readonly password = signal('');
}
