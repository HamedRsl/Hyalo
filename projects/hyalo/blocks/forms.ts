import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormField, email, form, required, submit } from '@angular/forms/signals';
import { HyField, HyInput } from '@hyalo/angular/field';
import { HyPassword } from '@hyalo/angular/password';
import { HyOtp } from '@hyalo/angular/otp';
import {
  HY_DATE_ADAPTER,
  HyDatePicker,
  type HyDate,
  type HyDateAdapter,
} from '@hyalo/angular/dates';
import { HyTimePicker } from '@hyalo/angular/time-picker';
import { HyNumberInput } from '@hyalo/angular/number-input';
import { HyPhoneInput } from '@hyalo/angular/phone-input';
import { HyMultiSelect } from '@hyalo/angular/multi-select';
import { HyFileUpload } from '@hyalo/angular/file-upload';
import { HySelectableCheckbox } from '@hyalo/angular/selectable-card';
import { HyButton } from '@hyalo/angular/button';

export interface HyAuthValue {
  readonly email: string;
  readonly password: string;
  readonly code: string;
}
@Component({
  selector: 'hy-auth-block',
  imports: [HyField, HyInput, HyPassword, HyOtp, HyButton, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-block.html',
  styleUrl: './form-block.css',
})
export class HyAuthBlock {
  readonly heading = input('Welcome back');
  readonly verify = input(false);
  readonly pending = input(false);
  readonly error = input('');
  readonly value = model<HyAuthValue>({ email: '', password: '', code: '' });
  readonly requested = output<HyAuthValue>();
  protected readonly f = form(this.value, (p) => {
    required(p.email);
    email(p.email);
    required(p.password, { when: () => !this.verify() });
    required(p.code, { when: () => this.verify() });
  });
  protected send(event: Event): void {
    event.preventDefault();
    if (this.pending()) return;
    void submit(this.f, async () => {
      this.requested.emit({ ...this.value() });
    });
  }
}
export interface HyBookingValue {
  readonly date: HyDate | null;
  readonly time: string;
  readonly guests: number | null;
  readonly phone: string;
}
@Component({
  selector: 'hy-booking-block',
  imports: [HyField, HyDatePicker, HyTimePicker, HyNumberInput, HyPhoneInput, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-block.html',
  styleUrl: './form-block.css',
})
export class HyBookingBlock {
  readonly heading = input('Reserve a consultation');
  readonly value = model<HyBookingValue>({ date: null, time: '', guests: 1, phone: '' });
  readonly adapter = input<HyDateAdapter<HyDate>>(inject(HY_DATE_ADAPTER));
  readonly locale = input('en');
  readonly referenceDate = input<HyDate>('2026-01-01');
  readonly timeZone = input('Asia/Tehran');
  readonly slots = input<readonly { readonly value: string; readonly disabled?: boolean }[]>([]);
  readonly summary = input('The application confirms availability and final pricing.');
  readonly pending = input(false);
  readonly error = input('');
  readonly requested = output<HyBookingValue & { readonly timeZone: string }>();
  protected readonly attempted = signal(false);
  protected readonly ready = computed(() => {
    const { date, time, guests, phone } = this.value();
    return (
      !!date &&
      this.adapter().deserialize(date) !== undefined &&
      /^([01][0-9]|2[0-3]):[0-5][0-9]$/u.test(time) &&
      (this.slots().length === 0 ||
        this.slots().some((slot) => slot.value === time && !slot.disabled)) &&
      guests !== null &&
      Number.isInteger(guests) &&
      guests >= 1 &&
      guests <= 12 &&
      /^09[0-9]{9}$/u.test(phone)
    );
  });
  protected update<K extends keyof HyBookingValue>(key: K, value: HyBookingValue[K]): void {
    this.value.update((current) => ({ ...current, [key]: value }));
  }
  protected send(event: Event): void {
    event.preventDefault();
    this.attempted.set(true);
    if (this.ready() && !this.pending())
      this.requested.emit({ ...this.value(), timeZone: this.timeZone() });
  }
}
export interface HySettingsValue {
  readonly name: string;
  readonly teams: readonly string[];
  readonly reminders: boolean;
  readonly files: readonly File[];
}
@Component({
  selector: 'hy-settings-block',
  imports: [
    HyField,
    HyInput,
    HyMultiSelect,
    HyFileUpload,
    HySelectableCheckbox,
    HyButton,
    FormField,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings-block.html',
  styleUrl: './form-block.css',
})
export class HySettingsBlock {
  readonly heading = input('Workspace settings');
  readonly value = model<HySettingsValue>({ name: '', teams: [], reminders: true, files: [] });
  readonly teams = input<readonly { readonly value: string; readonly label: string }[]>([]);
  readonly pending = input(false);
  readonly error = input('');
  readonly requested = output<HySettingsValue>();
  protected readonly f = form(this.value, (p) => required(p.name));
  protected send(event: Event): void {
    event.preventDefault();
    if (this.pending()) return;
    void submit(this.f, async () => {
      this.requested.emit({ ...this.value() });
    });
  }
}
