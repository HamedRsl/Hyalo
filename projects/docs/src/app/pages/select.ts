import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { HY_TEXT_FIELD, HySelect } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-select-page',
  imports: [DocsPage, DocsExample, DocsApiTable, HY_TEXT_FIELD, HySelect, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page heading="Select" lead="Pick one value from a short list, in a glass panel.">
      <docs-example [code]="code" column>
        <hy-field label="Strap" hint="Rubber is sold out this week.">
          <hy-select [options]="straps" [formField]="f.strap" placeholder="Choose a strap" />
        </hy-field>
        <hy-field label="Case size">
          <hy-select [options]="sizes" [(value)]="size" />
        </hy-field>
        <hy-field label="Country (native)">
          <hy-select native [options]="countries" [(value)]="country" />
        </hy-field>
      </docs-example>

      <h2>Native fallback</h2>
      <p>
        On the low fidelity tier, or with the <code>native</code> input, the component renders a
        real <code>&lt;select&gt;</code> with the same look. Phones then get their own picker, which
        is often the better experience for long lists.
      </p>

      <h2>Accessibility</h2>
      <ul>
        <li>Follows the APG select-only combobox pattern. Enter, Space or Down open the list.</li>
        <li>Typing a letter jumps to the next option that starts with it.</li>
        <li>
          Escape closes without changing the value. Focus stays on the trigger the whole time.
        </li>
        <li>
          For more than about 15 options, or when people need to search, use a combobox instead. It
          is planned for phase 4.
        </li>
      </ul>

      <h2>API</h2>
      <p><code>hy-select</code></p>
      <docs-api-table [rows]="rows" />
    </docs-page>
  `,
})
export default class SelectPage {
  protected readonly model = signal({ strap: '' });
  protected readonly f = form(this.model, (p) => required(p.strap, { message: 'Pick a strap' }));
  protected readonly size = signal<string | undefined>('40');
  protected readonly country = signal<string | undefined>('de');
  protected readonly straps = [
    { value: 'leather', label: 'Leather' },
    { value: 'steel', label: 'Steel bracelet' },
    { value: 'nato', label: 'Nylon' },
    { value: 'rubber', label: 'Rubber', disabled: true },
  ];
  protected readonly sizes = [
    { value: '38', label: '38 mm' },
    { value: '40', label: '40 mm' },
    { value: '42', label: '42 mm' },
  ];
  protected readonly countries = [
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'ir', label: 'Iran' },
    { value: 'nl', label: 'Netherlands' },
  ];

  protected readonly code = `straps = [
  { value: 'leather', label: 'Leather' },
  { value: 'steel', label: 'Steel bracelet' },
  { value: 'rubber', label: 'Rubber', disabled: true },
];

<hy-field label="Strap">
  <hy-select [options]="straps" [formField]="f.strap" placeholder="Choose a strap" />
</hy-field>`;
  protected readonly rows: ApiRow[] = [
    {
      name: 'options',
      type: 'HySelectOption<T>[]',
      description: 'Required. value, label and disabled.',
    },
    {
      name: 'value',
      type: 'model<T | undefined>',
      description: 'Selected value. Works with [formField].',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "'Select'",
      description: 'Shown while nothing is selected.',
    },
    {
      name: 'native',
      type: 'boolean',
      default: 'false',
      description: 'Always render a native select.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Set by Signal Forms when bound.',
    },
    {
      name: 'required, invalid, touched, errors',
      type: '',
      description: 'Set by Signal Forms. Set them by hand without forms.',
    },
  ];
}
