import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import {
  HyDatePicker,
  HyDateRangePicker,
  HyJalaliDateAdapter,
  type HyDate,
  type HyDateRange,
} from '@hyalo/angular/dates';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/date-picker';
@Component({
  selector: 'docs-date-picker-page',
  imports: [DocsPage, DocsExample, HyField, HyDatePicker, HyDateRangePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-picker.html',
})
export default class HyDatePickerPage {
  protected readonly examples = [EXAMPLE] as const;
  protected readonly date = signal<HyDate | null>('2026-11-16');
  protected readonly range = signal<HyDateRange | null>(null);
  protected readonly jalali = new HyJalaliDateAdapter();
}
