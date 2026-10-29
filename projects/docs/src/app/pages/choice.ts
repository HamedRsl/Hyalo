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
  template: `
    <docs-page heading="Checkbox, radio and switch" lead="Native inputs underneath, glass on top.">
      <h2>Checkbox</h2>
      <docs-example [code]="checkboxCode" column>
        <hy-checkbox
          [checked]="allChecked()"
          [indeterminate]="someChecked()"
          (checkedChange)="toggleAll($event)"
        >
          All extras
        </hy-checkbox>
        <div class="nested docs-stack">
          @for (extra of extras; track extra.id) {
            <hy-checkbox
              [checked]="picked().has(extra.id)"
              (checkedChange)="toggle(extra.id, $event)"
            >
              {{ extra.label }}
            </hy-checkbox>
          }
        </div>
        <hy-checkbox description="You can read them first." [formField]="f.terms"
          >I accept the terms</hy-checkbox
        >
      </docs-example>

      <h2>Radio group</h2>
      <docs-example [code]="radioCode" column>
        <hy-radio-group label="Delivery" [formField]="f.delivery">
          <hy-radio value="standard" description="3 to 5 days, free">Standard</hy-radio>
          <hy-radio value="express" description="Next day, 12 EUR">Express</hy-radio>
          <hy-radio value="pickup" disabled description="Not available in your area"
            >Pick up</hy-radio
          >
        </hy-radio-group>
      </docs-example>

      <h2>Switch</h2>
      <docs-example [code]="switchCode" column>
        <hy-switch [(checked)]="notify" description="One email a week, never more."
          >Product news</hy-switch
        >
        <hy-switch disabled>Beta features</hy-switch>
      </docs-example>
      <p>
        A switch takes effect right away, like a setting. A checkbox is a choice that is submitted
        later, like a form field. If there is a Save button, use a checkbox.
      </p>

      <h2>Accessibility</h2>
      <ul>
        <li>Each control is a real input, so labels, form submit and browser autofill all work.</li>
        <li>The whole row, including the description, is the click target.</li>
        <li>Radios inside a group move with the arrow keys and share one tab stop.</li>
        <li>
          Mixed checkboxes announce themselves as mixed through the native indeterminate state.
        </li>
      </ul>

      <h2>API</h2>
      <p><code>hy-checkbox</code></p>
      <docs-api-table [rows]="checkboxRows" />
      <p><code>hy-radio-group</code> and <code>hy-radio</code></p>
      <docs-api-table [rows]="radioRows" />
      <p><code>hy-switch</code></p>
      <docs-api-table [rows]="switchRows" />
    </docs-page>
  `,
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
