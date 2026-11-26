import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, disabled, form, required } from '@angular/forms/signals';
import { describe, expect, it } from 'vitest';
import { HyField } from '@hyalo/angular/field';
import { HyTimePicker } from './time-picker';

@Component({
  imports: [HyField, HyTimePicker, FormField],
  template: `<hy-field label="Appointment" hint="Local wall time">
    <hy-time-picker [formField]="fields.time" />
  </hy-field>`,
})
class FormHost {
  readonly model = signal({ time: '09:30' });
  readonly locked = signal(false);
  readonly fields = form(this.model, (path) => {
    required(path.time);
    disabled(path.time, { when: () => this.locked() });
  });
}

@Component({
  imports: [HyTimePicker],
  template: `<hy-time-picker [(value)]="value" [confirmSelection]="true" [slots]="slots" [footerTemplate]="footer" />
    <ng-template #footer let-picker let-draft="draft">
      <output>{{ draft }}</output>
      <button id="custom-confirm" type="button" (click)="picker.confirm()">Apply time</button>
    </ng-template>`,
})
class FooterHost {
  readonly value = signal('09:00');
  readonly slots = [{ value: '09:00' }, { value: '11:00' }];
}

it('renders a custom footer with the draft and live picker instance', async () => {
  const fixture = TestBed.createComponent(FooterHost);
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const slot = Array.from(root.querySelectorAll('button')).find((button) => button.textContent?.trim() === '11:00');
  slot!.click();
  await fixture.whenStable();
  expect(root.querySelector('output')?.textContent?.trim()).toBe('11:00');
  expect(fixture.componentInstance.value()).toBe('09:00');
  root.querySelector<HTMLButtonElement>('#custom-confirm')!.click();
  await fixture.whenStable();
  expect(fixture.componentInstance.value()).toBe('11:00');
});

function setup() {
  const fixture = TestBed.createComponent(HyTimePicker);
  const element: HTMLElement = fixture.nativeElement;
  const input = () => element.querySelector<HTMLInputElement>('input[type=time]')!;
  const select = (label: string) =>
    element.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)!;
  const edit = (control: HTMLInputElement | HTMLSelectElement, value: string) => {
    control.value = value;
    control.dispatchEvent(new Event('change', { bubbles: true }));
  };
  return { fixture, element, input, select, edit };
}

describe('HyTimePicker', () => {
  it('accepts canonical wall times and rejects malformed or localized wire values', async () => {
    const { fixture } = setup();
    await fixture.whenStable();
    const picker = fixture.componentInstance;
    for (const value of ['00:00', '09:05', '12:34:56', '23:59']) {
      expect(picker.available(value), value).toBe(true);
    }
    // Native time inputs localize their UI, but the public value remains ASCII HH:mm[:ss].
    for (const value of [
      '',
      '9:05',
      '24:00',
      '12:60',
      '12:00:60',
      '09:05Z',
      ' 09:05',
      '۰۹:۰۵',
      '٠٩:٠٥',
    ]) {
      expect(picker.available(value), value).toBe(false);
    }
  });

  it('checks inclusive bounds and every disabled predicate including seconds', async () => {
    const { fixture } = setup();
    fixture.componentRef.setInput('min', '09:30:15');
    fixture.componentRef.setInput('max', '11:00:30');
    fixture.componentRef.setInput('isHourDisabled', (hour: number) => hour === 10);
    fixture.componentRef.setInput(
      'isMinuteDisabled',
      (_hour: number, minute: number) => minute === 45,
    );
    fixture.componentRef.setInput(
      'isSecondDisabled',
      (_hour: number, _minute: number, second: number) => second === 20,
    );
    await fixture.whenStable();
    for (const value of ['09:30:15', '11:00:30']) {
      expect(fixture.componentInstance.available(value), value).toBe(true);
    }
    for (const value of ['09:30:14', '11:00:31', '10:00:00', '09:45:00', '09:40:20']) {
      expect(fixture.componentInstance.available(value), value).toBe(false);
    }
  });

  it('selects enabled slots only and updates pressed state when availability changes', async () => {
    const { fixture, element } = setup();
    fixture.componentRef.setInput('min', '09:00');
    fixture.componentRef.setInput('slots', [
      { value: '08:00' },
      { value: '09:00', label: 'Morning' },
      { value: '10:00', disabled: true },
      { value: 'invalid' },
    ]);
    await fixture.whenStable();
    const buttons = [...element.querySelectorAll('button')];
    expect(buttons.map((button) => button.disabled)).toEqual([true, false, true, true]);
    buttons[1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('09:00');
    expect(buttons[1]!.getAttribute('aria-pressed')).toBe('true');
    for (const index of [0, 2, 3]) buttons[index]!.click();
    expect(fixture.componentInstance.value()).toBe('09:00');
    fixture.componentRef.setInput('min', '09:30');
    await fixture.whenStable();
    expect(buttons[1]!.disabled).toBe(true);
  });

  it('keeps confirmation drafts private, resets them, and confirms an empty string', async () => {
    const { fixture, element, input, edit } = setup();
    fixture.componentRef.setInput('value', '09:00');
    fixture.componentRef.setInput('confirmSelection', true);
    const confirmed: string[] = [];
    let touches = 0;
    fixture.componentInstance.confirmed.subscribe((value) => confirmed.push(value));
    fixture.componentInstance.touch.subscribe(() => touches++);
    await fixture.whenStable();
    edit(input(), '10:30');
    await fixture.whenStable();
    expect(input().value).toBe('10:30');
    expect(fixture.componentInstance.value()).toBe('09:00');
    expect(confirmed).toEqual([]);
    fixture.componentInstance.reset();
    await fixture.whenStable();
    expect(input().value).toBe('09:00');
    edit(input(), '11:30');
    await fixture.whenStable();
    element.querySelector('button')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('11:30');
    edit(input(), '');
    await fixture.whenStable();
    element.querySelector('button')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('');
    expect(confirmed).toEqual(['11:30', '']);
    expect(touches).toBe(2);
  });

  it('restores rejected native edits and publishes clearing immediately without confirmation', async () => {
    const { fixture, input, edit } = setup();
    fixture.componentRef.setInput('value', '09:30');
    fixture.componentRef.setInput('min', '09:00');
    fixture.componentRef.setInput('max', '10:00');
    await fixture.whenStable();
    edit(input(), '08:30');
    expect(input().value).toBe('09:30');
    expect(fixture.componentInstance.value()).toBe('09:30');
    edit(input(), '');
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('');
    expect(input().value).toBe('');
  });

  it('converts noon and midnight between twelve-hour parts and canonical values', async () => {
    const { fixture, select, edit, element } = setup();
    fixture.componentRef.setInput('hourFormat', '12');
    fixture.componentRef.setInput('value', '00:15');
    fixture.componentRef.setInput('name', 'time');
    await fixture.whenStable();
    expect(select('Hour').value).toBe('12');
    expect(select('Minute').value).toBe('15');
    expect(select('Period').value).toBe('0');
    edit(select('Period'), '1');
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('12:15');
    edit(select('Hour'), '1');
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('13:15');
    edit(select('Period'), '0');
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('01:15');
    expect(element.querySelector<HTMLInputElement>('input[type=hidden]')!.value).toBe('01:15');
  });

  it('honors part steps and restores a rejected second selection', async () => {
    const { fixture, select, edit } = setup();
    fixture.componentRef.setInput('hourFormat', '24');
    fixture.componentRef.setInput('showSeconds', true);
    fixture.componentRef.setInput('hourStep', 2);
    fixture.componentRef.setInput('minuteStep', 15);
    fixture.componentRef.setInput('secondStep', 10);
    fixture.componentRef.setInput('value', '10:30:10');
    fixture.componentRef.setInput(
      'isSecondDisabled',
      (_h: number, _m: number, s: number) => s === 20,
    );
    await fixture.whenStable();
    expect(select('Hour').value).toBe('10');
    expect(select('Minute').value).toBe('30');
    expect(select('Second').value).toBe('10');
    expect([...select('Hour').options].map((option) => option.value)).toEqual([
      '0',
      '2',
      '4',
      '6',
      '8',
      '10',
      '12',
      '14',
      '16',
      '18',
      '20',
      '22',
    ]);
    expect([...select('Minute').options].map((option) => option.value)).toEqual([
      '0',
      '15',
      '30',
      '45',
    ]);
    expect([...select('Second').options].map((option) => option.value)).toEqual([
      '0',
      '10',
      '20',
      '30',
      '40',
      '50',
    ]);
    expect(select('Second').querySelector<HTMLOptionElement>('option[value="20"]')!.disabled).toBe(
      true,
    );
    edit(select('Second'), '20');
    expect(select('Second').value).toBe('10');
    expect(fixture.componentInstance.value()).toBe('10:30:10');
    edit(select('Second'), '30');
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('10:30:30');
  });

  it.each(['readonly', 'disabled'])(
    'blocks native edits, slots and confirmation when %s',
    async (state) => {
      const { fixture, input, edit, element } = setup();
      fixture.componentRef.setInput('value', '09:00');
      fixture.componentRef.setInput('slots', [{ value: '10:00' }]);
      fixture.componentRef.setInput('confirmSelection', true);
      fixture.componentRef.setInput(state, true);
      const confirmed: string[] = [];
      fixture.componentInstance.confirmed.subscribe((value) => confirmed.push(value));
      await fixture.whenStable();
      expect(state === 'readonly' ? input().readOnly : input().disabled).toBe(true);
      expect([...element.querySelectorAll('button')].every((button) => button.disabled)).toBe(true);
      edit(input(), '10:00');
      fixture.componentInstance.confirm();
      await fixture.whenStable();
      expect(fixture.componentInstance.value()).toBe('09:00');
      expect(confirmed).toEqual([]);
      fixture.componentRef.setInput('hourFormat', '24');
      await fixture.whenStable();
      expect([...element.querySelectorAll('select')].every((control) => control.disabled)).toBe(
        true,
      );
    },
  );

  it('keeps selected parts synchronized after external reset and option regeneration', async () => {
    const { fixture, select } = setup();
    fixture.componentRef.setInput('hourFormat', '24');
    fixture.componentRef.setInput('showSeconds', true);
    fixture.componentRef.setInput('value', '10:30:20');
    await fixture.whenStable();
    fixture.componentRef.setInput('hourStep', 2);
    fixture.componentRef.setInput('minuteStep', 15);
    fixture.componentRef.setInput('secondStep', 10);
    await fixture.whenStable();
    expect(select('Hour').value).toBe('10');
    expect(select('Minute').value).toBe('30');
    expect(select('Second').value).toBe('20');
    fixture.componentRef.setInput('value', '12:45:30');
    await fixture.whenStable();
    expect(select('Hour').value).toBe('12');
    expect(select('Minute').value).toBe('45');
    expect(select('Second').value).toBe('30');
    fixture.componentRef.setInput('value', '');
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('');
    expect(select('Hour').value).toBe('0');
    expect(select('Minute').value).toBe('0');
    expect(select('Second').value).toBe('0');
  });

  it('touches only when focus leaves the composite', async () => {
    const { fixture, input, element } = setup();
    fixture.componentRef.setInput('slots', [{ value: '09:00' }]);
    let touches = 0;
    fixture.componentInstance.touch.subscribe(() => touches++);
    await fixture.whenStable();
    input().dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: element.querySelector('button') }),
    );
    expect(touches).toBe(0);
    element.querySelector('button')!.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(touches).toBe(1);
  });

  it('bridges required, disabled, touched, reset and field naming through Signal Forms', async () => {
    const fixture = TestBed.createComponent(FormHost);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.required).toBe(true);

    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
    input.value = '';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().time).toBe('');
    expect(fixture.componentInstance.fields.time().invalid()).toBe(true);
    expect(fixture.componentInstance.fields.time().touched()).toBe(true);
    fixture.componentInstance.locked.set(true);
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    fixture.componentInstance.fields().reset({ time: '12:30' });
    await fixture.whenStable();
    expect(input.value).toBe('12:30');
    expect(fixture.componentInstance.fields.time().touched()).toBe(false);
  });
});
