import { HyButton } from '@hyalo/angular/button';
import { HyIcon } from '@hyalo/angular/icon';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import {
  HyCalendar,
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
  imports: [HyButton, HyIcon, DocsPage, DocsExample, HyField, HyCalendar, HyDatePicker, HyDateRangePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-picker.html',
})
export default class HyDatePickerPage {
  protected readonly examples = [EXAMPLE] as const;
  protected readonly date = signal<HyDate | null>('2026-11-16');
  protected readonly appointmentStatus = signal('');
  protected readonly appointmentTouch = signal(false);
  protected readonly range = signal<HyDateRange | null>(null);
  protected readonly outside = signal<'visible' | 'hidden' | 'disabled'>('disabled');
  protected readonly comparison: HyDateRange = { start: '2026-11-19', end: '2026-11-22' };
  protected readonly jalali = new HyJalaliDateAdapter();
}
