import { DocsTokens } from '../shared/tokens-table';
import { EXAMPLE } from './examples/keypad';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyNumericKeypad } from '@hyalo/angular/keypad';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-keypad-page',
  imports: [DocsTokens, DocsPage, DocsExample, DocsImport, DocsApiTable, HyNumericKeypad],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './keypad.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HyNumericKeypad.maxFractionDigits',
      type: 'number | undefined',
      default: 'undefined',
      description: 'Optional bound on canonical decimal precision; preserves leading zeros.',
    },
    {
      name: 'HyNumericKeypad.layout',
      type: '"telephone" | "calculator"',
      default: "'telephone'",
      description: 'Telephone or calculator key ordering.',
    },
    {
      name: 'HyNumericKeypad.decimalSeparator',
      type: 'string',
      default: "'.'",
      description: 'Displayed and accepted separator; the model keeps a dot.',
    },
    {
      name: 'HyNumericKeypad.autocomplete',
      type: 'string',
      default: "'off'",
      description: 'Native input autocomplete policy.',
    },
    {
      name: 'HyNumericKeypad.append()',
      type: '(value: string) => void',
      default: 'method',
      description: 'Appends canonical input if the resulting draft is permitted.',
    },
    {
      name: 'HyNumericKeypad.erase()',
      type: '() => void',
      default: 'method',
      description: 'Removes the last canonical character.',
    },
    {
      name: 'HyNumericKeypad.clear()',
      type: '() => void',
      default: 'method',
      description: 'Clears the draft.',
    },
    {
      name: 'HyNumericKeypad.sign()',
      type: '() => void',
      default: 'method',
      description: 'Toggles the sign when negative input is allowed.',
    },
    {
      name: 'HyNumericKeypad.submit()',
      type: '() => void',
      default: 'method',
      description: 'Submits only a complete canonical numeric draft.',
    },
    {
      name: 'HyNumericKeypad.value',
      type: 'string',
      default: "''",
      description: 'Canonical controlled value; supports two-way binding and Signal Forms.',
    },
    {
      name: 'HyNumericKeypad.locale',
      type: 'string',
      default: 'undefined',
      description: 'Intl locale; inherits the shared HyLocale when omitted.',
    },
    {
      name: 'HyNumericKeypad.decimal',
      type: 'boolean',
      default: 'false',
      description: 'Allows one canonical decimal separator.',
    },
    {
      name: 'HyNumericKeypad.allowNegative',
      type: 'boolean',
      default: 'false',
      description: 'Allows a leading minus sign and exposes a sign action.',
    },
    {
      name: 'HyNumericKeypad.masked',
      type: 'boolean',
      default: 'false',
      description: 'Uses password-style display; value storage remains plain text.',
    },
    {
      name: 'HyNumericKeypad.maxLength',
      type: 'number | undefined',
      default: '16',
      description: 'Maximum canonical string length including sign and separator.',
    },
    {
      name: 'HyNumericKeypad.clearLabel',
      type: 'string',
      default: "'Clear'",
      description: 'Localized text for clear.',
    },
    {
      name: 'HyNumericKeypad.backspaceLabel',
      type: 'string',
      default: "'Delete last digit'",
      description: 'Localized text for backspace.',
    },
    {
      name: 'HyNumericKeypad.decimalLabel',
      type: 'string',
      default: "'Decimal separator'",
      description: 'Localized text for decimal.',
    },
    {
      name: 'HyNumericKeypad.signLabel',
      type: 'string',
      default: "'Change sign'",
      description: 'Localized text for sign.',
    },
    {
      name: 'HyNumericKeypad.submitLabel',
      type: 'string',
      default: "''",
      description: 'Localized text for submit.',
    },
    {
      name: 'HyNumericKeypad.submitted',
      type: 'string',
      default: 'output',
      description: 'Emits the current canonical string when submit is activated.',
    },
    {
      name: 'Signal Forms metadata',
      type: 'label, name, disabled, readonly, required, invalid, touched, errors',
      default: 'shared field contract',
      description: 'Use [formField] to connect value, validation, focus and reset.',
    },
  ];
  protected readonly amount = signal('0012.50');
  protected readonly review = signal('');
}
