import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { HY_TEXT_FIELD, HyButton } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-text-field-page',
  imports: [DocsPage, DocsExample, DocsApiTable, HY_TEXT_FIELD, HyButton, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page
      heading="Text field"
      lead="A label, a glass input, a hint and an error, wired together for you."
    >
      <h2>With Signal Forms</h2>
      <docs-example [code]="formCode" column>
        <form class="docs-stack" novalidate (submit)="submit($event)">
          <hy-field label="Email" hint="We only use it for the receipt.">
            <input hyInput type="email" autocomplete="email" [formField]="f.email" />
          </hy-field>
          <hy-field label="Budget">
            <span hyPrefix>EUR</span>
            <input hyInput inputmode="numeric" [formField]="f.budget" />
          </hy-field>
          <hy-field label="Message" hint="Optional">
            <textarea hyInput rows="3" [formField]="f.message"></textarea>
          </hy-field>
          <div><button hyButton type="submit">Send</button></div>
        </form>
      </docs-example>
      <p>
        Required, invalid, touched and the error messages come from the bound field. Errors show
        after the user leaves the field or tries to submit, never while they are still typing the
        first time.
      </p>

      <h2>Without forms</h2>
      <docs-example [code]="plainCode" column>
        <hy-field label="Search" size="sm">
          <input hyInput type="search" placeholder="Calibre, strap, size" />
        </hy-field>
        <hy-field label="Coupon" error="This code has expired" forceError>
          <input hyInput value="SUMMER24" />
        </hy-field>
      </docs-example>

      <h2>Accessibility</h2>
      <ul>
        <li>
          The label, hint and error are linked with <code>for</code> and
          <code>aria-describedby</code>.
        </li>
        <li>The error region is polite, so a new message is read without stealing focus.</li>
        <li>
          Required fields get a visual star that screen readers skip, since the input already says
          required.
        </li>
        <li>Keep the label visible. A placeholder is not a label.</li>
      </ul>

      <h2>API</h2>
      <p><code>hy-field</code></p>
      <docs-api-table [rows]="fieldRows" />
      <p>
        <code>input[hyInput]</code>, <code>textarea[hyInput]</code>, plus
        <code>[hyPrefix]</code> and <code>[hySuffix]</code> for content inside the box. Everything
        comes in <code>HY_TEXT_FIELD</code>.
      </p>
    </docs-page>
  `,
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
