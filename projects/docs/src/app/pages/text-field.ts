import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { HY_TEXT_FIELD, HyButton } from '@hyalo/angular';
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

  protected readonly formCode = `model = signal({ email: '', budget: '', message: '' });
f = form(this.model, (p) => {
  required(p.email, { message: 'Enter your email' });
  email(p.email, { message: 'That does not look like an email' });
});

<hy-field label="Email" hint="We only use it for the receipt.">
  <input hyInput type="email" [formField]="f.email" />
</hy-field>
<hy-field label="Budget">
  <span hyPrefix>EUR</span>
  <input hyInput inputmode="numeric" [formField]="f.budget" />
</hy-field>`;
  protected readonly plainCode = `<hy-field label="Coupon" error="This code has expired" forceError>
  <input hyInput value="SUMMER24" />
</hy-field>`;
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
