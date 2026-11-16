import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import { HySearchField } from '@hyalo/angular/search-field';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/search-field';
@Component({selector: 'docs-search-field-page', imports: [DocsPage, DocsExample, HyField, HySearchField], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './search-field.html'})
export default class HySearchFieldPage {
 protected readonly examples = [EXAMPLE] as const;
 protected readonly query = signal('');
}
