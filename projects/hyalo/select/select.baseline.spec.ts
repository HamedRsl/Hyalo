import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, disabled, form, required } from '@angular/forms/signals';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HyFidelity } from '@hyalo/angular/core';
import { HY_TEXT_FIELD, HyForms } from '@hyalo/angular/field';
import { HySelect, type HySelectOption } from './select';

interface Choice {
  id: number;
}
const first = { id: 1 },
  second = { id: 2 },
  blocked = { id: 3 };
@Component({
  imports: [HY_TEXT_FIELD, HySelect, FormField],
  template: `<form dir="rtl">
    <hy-field label="اندازه" hint="انتخاب کنید">
      <hy-select
        [native]="native()"
        [options]="options()"
        [formField]="fields.choice!"
        placeholder="انتخاب"
      /> </hy-field
    ><button type="button">Outside</button>
  </form>`,
})
class Host {
  readonly native = signal(true);
  readonly unavailable = signal(false);
  readonly model = signal<{ choice: Choice }>({ choice: first });
  readonly fields = form(this.model, (p) => {
    required(p.choice!);
    disabled(p.choice!, () => this.unavailable());
  });
  readonly options = signal<readonly HySelectOption<Choice>[]>([
    { key: 'first', value: first, label: 'یکسان' },
    { key: 'second', value: second, label: 'یکسان' },
    {
      key: 'blocked',
      value: blocked,
      label: 'غیرفعال',
      group: { key: 'group', label: 'گروه', disabled: true },
    },
  ]);
}
@Component({
  imports: [HY_TEXT_FIELD, HySelect, HyForms, ReactiveFormsModule],
  template: `<hy-field label="Size"
    ><hy-select #select native [hyForms]="select" [formControl]="control" [options]="options"
  /></hy-field>`,
})
class ReactiveHost {
  readonly control = new FormControl<number | undefined>(40, { nonNullable: true });
  readonly options = [
    { value: 38, label: 'Small' },
    { value: 40, label: 'Medium' },
  ];
}

describe('HySelect native baseline contract', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    return {
      fixture,
      host: fixture.componentInstance,
      element: fixture.nativeElement as HTMLElement,
    };
  }
  it('maps duplicate Persian labels to distinct object values and rejects disabled groups', async () => {
    const { fixture, host, element } = await setup();
    const select = element.querySelector('select')!;
    expect(select.value).toBe('string:first');
    expect(element.querySelector('label')!.htmlFor).toBe(select.id);
    select.value = 'string:second';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(host.model().choice).toBe(second);
    expect(host.fields.choice!().dirty()).toBe(true);
    select.value = 'string:blocked';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(host.model().choice).toBe(second);
    expect(select.querySelector('optgroup')!.label).toBe('گروه');
    expect(select.querySelector('option[value="string:blocked"]')!.hasAttribute('disabled')).toBe(
      true,
    );
  });
  it('preserves typed selection through async options and Signal Forms reset/disable/touch', async () => {
    const { fixture, host, element } = await setup();
    const select = element.querySelector('select')!;
    select.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(host.fields.choice!().touched()).toBe(true);
    host.unavailable.set(true);
    await fixture.whenStable();
    expect(select.disabled).toBe(true);
    host.unavailable.set(false);
    host.options.update((items) => [...items, { key: 'later', value: { id: 4 }, label: 'بعدی' }]);
    host.fields().reset({ choice: second });
    await fixture.whenStable();
    expect(select.value).toBe('string:second');
    expect(select.disabled).toBe(false);
    expect(host.fields.choice!().dirty()).toBe(false);
    expect(host.fields.choice!().touched()).toBe(false);
  });
  it('defers enhancement while the native control is focused and keeps DOM identity', async () => {
    const { fixture, host, element } = await setup();
    const select = element.querySelector('select')!;
    const trigger = element.querySelector<HTMLButtonElement>('[role="combobox"]')!;
    select.focus();
    host.native.set(false);
    TestBed.inject(HyFidelity).setTier('high');
    await fixture.whenStable();
    expect(select.hidden).toBe(false);
    expect(document.activeElement).toBe(select);
    element.querySelector('form > button')!.dispatchEvent(new FocusEvent('focus'));
    (element.querySelector('form > button') as HTMLButtonElement).focus();
    await fixture.whenStable();
    expect(element.querySelector('select')).toBe(select);
    expect(element.querySelector('[role="combobox"]')).toBe(trigger);
    expect(select.hidden).toBe(true);
    expect(select.disabled).toBe(true);
    expect(trigger.hidden).toBe(false);
    expect(trigger.textContent).toContain('یکسان');
    expect(element.querySelector('label')!.htmlFor).toBe(trigger.id);
    expect([...new FormData(element.querySelector('form')!).keys()]).toEqual([]);
  });
  it('buffers replay arriving before required inputs are bound', async () => {
    const fixture = TestBed.createComponent(HySelect<string>);
    const select = document.createElement('select');
    select.innerHTML = '<option value="string:second" selected>Second</option>';
    expect(() =>
      (fixture.componentInstance as unknown as { pickNative(e: Event): void }).pickNative({
        target: select,
      } as unknown as Event),
    ).not.toThrow();
    fixture.componentRef.setInput('options', [
      { value: 'first', label: 'First' },
      { value: 'second', label: 'Second' },
    ]);
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('second');
  });
  it('supports numeric typed Reactive Forms with the opt-in adapter', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    await fixture.whenStable();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    expect(select.value).toBe('number:40');
    select.value = 'number:38';
    select.dispatchEvent(new Event('change'));
    select.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe(38);
    expect(fixture.componentInstance.control.touched).toBe(true);
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(select.disabled).toBe(true);
    fixture.componentInstance.control.enable();
    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(select.value).toBe('number:40');
    expect(fixture.componentInstance.control.pristine).toBe(true);
  });
});
