import { EXAMPLES } from './examples/text-field';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { HyButton } from '@hyalo/angular/button';
import { HY_TEXT_FIELD } from '@hyalo/angular/field';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-text-field-page',
  imports: [DocsPage, DocsTokens, DocsExample, DocsApiTable, HY_TEXT_FIELD, HyButton, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './text-field.html',
})
export default class TextFieldPage {
  protected readonly examples = EXAMPLES;

  protected readonly model = signal({ email: '', budget: '', message: '' });
  protected readonly f = form(this.model, (p) => {
    required(p.email, { message: 'Enter your email' });
    email(p.email, { message: 'That does not look like an email' });
    required(p.budget, { message: 'Give us a rough number' });
  });

  protected submit(event: Event): void {
    event.preventDefault();
    for (const field of [this.f.email, this.f.budget, this.f.message]) field().markAsTouched();
  }

  protected readonly fieldRows: ApiRow[] = [
    { name: 'label', type: 'string', description: 'Visible label.' },
    { name: 'hint', type: 'string', description: 'Help text under the input.' },
    {
      name: 'error',
      type: 'string',
      description: 'Message that wins over the form errors, such as a server error.',
    },
    {
      name: 'forceError',
      type: 'boolean',
      default: 'false',
      description: 'Shows the error even before the field is touched.',
    },
    { name: 'size', type: 'HySize', default: "'md'", description: 'Height of the box.' },
  ];
}
