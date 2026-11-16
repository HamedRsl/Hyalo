import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, form, min, validate } from '@angular/forms/signals';
import { HyField } from '@hyalo/angular/field';
import { HyNumberInput } from '@hyalo/angular/number-input';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/number-input';
@Component({
  selector: 'docs-number-input-page',
  imports: [DocsPage, DocsExample, HyField, HyNumberInput, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './number-input.html',
})
export default class HyNumberInputPage {
  protected readonly examples = [EXAMPLE] as const;
  protected readonly model = signal({ amount: 1250000 as number | null });
  protected readonly parseError = signal<string | null>(null);
  protected readonly f = form(this.model, (p) => {
    min(p.amount, 0);
    validate(p.amount, () => {
      const message = this.parseError();
      return message ? { kind: 'parse', message } : undefined;
    });
  });
}
