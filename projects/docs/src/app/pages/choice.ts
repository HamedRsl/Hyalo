import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { HyCheckbox, HyRadio, HyRadioGroup, HySwitch } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-choice-page',
  imports: [
    DocsPage,
    DocsExample,
    DocsApiTable,
    HyCheckbox,
    HyRadioGroup,
    HyRadio,
    HySwitch,
    FormField,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './choice.html',
  styles: `
    .nested {
      padding-inline-start: var(--hy-space-6);
    }
  `,
})
export default class ChoicePage {
  protected readonly extras = [
    { id: 'box', label: 'Gift box' },
    { id: 'strap', label: 'Second strap' },
    { id: 'engraving', label: 'Engraving' },
  ];
  protected readonly picked = signal(new Set(['box']));
  protected readonly allChecked = computed(() => this.picked().size === this.extras.length);
  protected readonly someChecked = computed(() => this.picked().size > 0 && !this.allChecked());
  protected readonly notify = signal(true);

  protected readonly model = signal({ terms: false, delivery: '' });
  protected readonly f = form(this.model, (p) =>
    required(p.delivery, { message: 'Choose a delivery option' }),
  );

  protected toggle(id: string, on: boolean): void {
    this.picked.update((set) => {
      const next = new Set(set);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  protected toggleAll(on: boolean): void {
    this.picked.set(new Set(on ? this.extras.map((e) => e.id) : []));
  }

  protected readonly checkboxCode = `<hy-checkbox [checked]="all()" [indeterminate]="some()" (checkedChange)="toggleAll($event)">
  All extras
</hy-checkbox>
<hy-checkbox description="You can read them first." [formField]="f.terms">
  I accept the terms
</hy-checkbox>`;
  protected readonly radioCode = `<hy-radio-group label="Delivery" [formField]="f.delivery">
  <hy-radio value="standard" description="3 to 5 days, free">Standard</hy-radio>
  <hy-radio value="express" description="Next day, 12 EUR">Express</hy-radio>
  <hy-radio value="pickup" disabled>Pick up</hy-radio>
</hy-radio-group>`;
  protected readonly switchCode = `<hy-switch [(checked)]="notify" description="One email a week, never more.">
  Product news
</hy-switch>`;
  protected readonly checkboxRows: ApiRow[] = [
    {
      name: 'checked',
      type: 'model<boolean>',
      default: 'false',
      description: 'Works with [formField].',
    },
    {
      name: 'indeterminate',
      type: 'model<boolean>',
      default: 'false',
      description: 'Mixed state. Cleared when the user clicks.',
    },
    { name: 'description', type: 'string', description: 'Second line under the label.' },
    { name: 'name', type: 'string', description: 'Native name for plain form posts.' },
    {
      name: 'disabled, required, invalid, touched',
      type: 'boolean',
      description: 'Set by Signal Forms when bound.',
    },
  ];
  protected readonly radioRows: ApiRow[] = [
    {
      name: 'value (group)',
      type: 'model<T | undefined>',
      description: 'Selected value. Works with [formField].',
    },
    { name: 'label (group)', type: 'string', description: 'Visible label that names the group.' },
    {
      name: 'orientation (group)',
      type: "'vertical' | 'horizontal'",
      default: "'vertical'",
      description: 'Layout of the radios.',
    },
    { name: 'value (radio)', type: 'T', description: 'Required. Value this radio stands for.' },
    { name: 'description (radio)', type: 'string', description: 'Second line under the label.' },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'On the group or on one radio.',
    },
  ];
  protected readonly switchRows: ApiRow[] = [
    {
      name: 'checked',
      type: 'model<boolean>',
      default: 'false',
      description: 'Works with [formField].',
    },
    { name: 'description', type: 'string', description: 'Second line under the label.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Native disabled.' },
  ];
}
