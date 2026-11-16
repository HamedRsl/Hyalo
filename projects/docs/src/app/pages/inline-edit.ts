import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import { HyInlineEdit } from '@hyalo/angular/inline-edit';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/inline-edit';
@Component({selector: 'docs-inline-edit-page', imports: [DocsPage, DocsExample, HyField, HyInlineEdit], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './inline-edit.html'})
export default class HyInlineEditPage {
 protected readonly examples = [EXAMPLE] as const;
 protected readonly title = signal('Design consultation');
protected readonly notes = signal('Bring your project brief.');
protected readonly validate = (value: string): string | undefined => value.trim().length < 3 ? 'Use at least three characters.' : undefined;
}
