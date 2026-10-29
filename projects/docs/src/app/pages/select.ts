import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { HY_TEXT_FIELD } from '@hyalo/angular/field';
import { HySelect } from '@hyalo/angular/select';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-select-page',
  imports: [DocsPage, DocsTokens, DocsExample, DocsApiTable, HY_TEXT_FIELD, HySelect, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select.html',
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
