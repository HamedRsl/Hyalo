import { EXAMPLE } from './examples/date-time-picker';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyDateTimePicker } from '@hyalo/angular/date-time-picker';
import { HyField } from '@hyalo/angular/field';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsTokens } from '../shared/tokens-table';
@Component({
  selector: 'docs-date-time-picker-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, DocsTokens, HyDateTimePicker, HyField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-time-picker.html',
  styleUrl: './additions.css',
})
export default class DateTimePickerPage {
  protected readonly example = EXAMPLE;
  protected readonly rows: ApiRow[] = [
    {
      name: 'value',
      type: 'model<number | null>',
      default: 'null',
      description: 'Committed instant in epoch milliseconds. Selection is at minute precision.',
    },
    {
      name: 'timeZone',
      type: 'string',
      default: 'UTC',
      description: 'Explicit IANA zone used by SSR and the browser.',
    },
    {
      name: 'adapter / locale',
      type: 'HyDateAdapter<HyDate> / string',
      default: 'provided adapter / en',
      description: 'Gregorian or Jalali calendar display.',
    },
    {
      name: 'disambiguation',
      type: "'earlier' | 'later' | 'reject'",
      default: 'earlier',
      description: 'Repeated-time policy. Skipped times are always rejected.',
    },
    {
      name: 'min / max',
      type: 'number | undefined',
      default: 'undefined',
      description: 'Inclusive instant bounds, including time of day.',
    },
    {
      name: 'referenceDate / isDateDisabled',
      type: 'HyDate / (date) => boolean',
      default: '2026-01-01 / false',
      description: 'Deterministic reference and unavailable days.',
    },
    {
      name: 'dateLabel / timeLabel / calendarLabel',
      type: 'string',
      default: 'Date / Time / Calendar',
      description: 'Inner control labels.',
    },
    {
      name: 'applyLabel / cancelLabel / clearLabel',
      type: 'string',
      default: 'Apply / Cancel / Clear',
      description: 'Action labels. Empty clearLabel hides Clear.',
    },
    {
      name: 'validationMessage',
      type: 'string',
      default: 'Choose an available date and time in this time zone.',
      description: 'Local validation wording.',
    },
    {
      name: 'validationError / validationChange',
      type: 'Signal<string | null> / output<string | null>',
      default: '',
      description: 'Draft validation and notification for host validation.',
    },
    {
      name: 'applied / cancelled',
      type: 'output<number> / output<void>',
      default: '',
      description: 'Apply commits; Cancel restores the committed value.',
    },
    {
      name: 'disabled / readonly / required / name',
      type: 'field metadata',
      default: 'false / false / false / empty',
      description: 'Shared Hyalo field and Signal Forms contract.',
    },
    {
      name: 'reset()',
      type: 'method',
      default: '',
      description: 'Restores the model into the draft.',
    },
  ];
  protected readonly instant = signal<number | null>(1794817800000);
}
