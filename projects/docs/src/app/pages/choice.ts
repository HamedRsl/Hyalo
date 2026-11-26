import { EXAMPLES } from './examples/choice';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { HyCheckbox, HyRadio, HyRadioGroup, HySwitch } from '@hyalo/angular/choice';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-choice-page',
  imports: [
    DocsPage,
    DocsTokens,
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
  protected readonly examples = EXAMPLES;

  protected readonly extras = [
    { id: 'box', label: 'Gift box' },
    { id: 'strap', label: 'Second strap' },
    { id: 'engraving', label: 'Engraving' },
  ];
  protected readonly picked = signal(new Set(['box']));
  protected readonly allChecked = computed(() => this.picked().size === this.extras.length);
  protected readonly someChecked = computed(() => this.picked().size > 0 && !this.allChecked());
  protected readonly notify = signal(true);
  protected readonly pending = signal(false);
  protected readonly sharing = signal(false);
  protected readonly requests = signal(0);

  protected requestSharing(value: boolean): void {
    this.requests.update((count) => count + 1);
    this.sharing.set(value);
  }

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

  private readonly choicePolicyRows: ApiRow[] = [
    {
      name: 'labelPosition',
      type: "'before' | 'after'",
      default: "'after'",
      description: 'Places the label relative to the control in the current reading direction.',
    },
    {
      name: 'disabledFocusable',
      type: 'boolean',
      default: 'false',
      description: 'Allows focus on a disabled control while blocking activation.',
    },
  ];
  protected readonly checkboxRows: ApiRow[] = [
    ...this.choicePolicyRows,
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
    ...this.choicePolicyRows,
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
    ...this.choicePolicyRows,
    { name: 'controlled', type: 'boolean', description: 'The caller applies requested values.' },
    { name: 'pending', type: 'boolean', description: 'Blocks changes and marks the switch busy.' },
    { name: 'toggleRequested', type: 'output<boolean>', description: 'Proposed state on activation.' },
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
