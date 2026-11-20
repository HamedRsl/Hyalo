import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, disabled, form, readonly, required } from '@angular/forms/signals';
import { HyField, HyForms } from '@hyalo/angular/field';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../src/testing/axe';
import { HySelectableCard } from './selectable-card';

const options = [
  { value: 'unavailable', label: 'Unavailable', disabled: true },
  { value: 'basic', label: 'Basic', description: 'For individuals' },
  { value: 'team', label: 'Team' },
];

@Component({
  imports: [HySelectableCard, HyField, FormField],
  template: `
    <form>
      <hy-field label="Plan" hint="Choose your plan">
        <hy-selectable-card [options]="options" [formField]="fields.plan" />
      </hy-field>
    </form>
  `,
})
class Host {
  readonly options = options;
  readonly model = signal({ plan: '' });
  readonly locked = signal(false);
  readonly readOnly = signal(false);
  readonly fields = form(this.model, (path) => {
    required(path.plan, { message: 'Choose a plan' });
    disabled(path.plan, { when: () => this.locked() });
    readonly(path.plan, { when: () => this.readOnly() });
  });
}

@Component({
  imports: [HySelectableCard, HyForms, ReactiveFormsModule],
  template: `<hy-selectable-card
    #card
    label="Plan"
    [options]="options"
    [hyForms]="card"
    [formControl]="control"
  />`,
})
class ReactiveHost {
  readonly options = options;
  readonly control = new FormControl('basic', { nonNullable: true });
}

describe('HySelectableCard', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const inputs = [...root.querySelectorAll('input')];
    return { fixture, root, inputs, host: fixture.componentInstance };
  }

  it('focuses the selected enabled option rather than a disabled first option', async () => {
    const fixture = TestBed.createComponent(HySelectableCard);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('value', 'team');
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    fixture.componentInstance.focus();

    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('input[value="team"]'));
  });

  it('focuses the first enabled option when no current option is selected', async () => {
    const fixture = TestBed.createComponent(HySelectableCard);
    fixture.componentRef.setInput('options', options);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    fixture.componentInstance.focus();
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('input[value="basic"]'),
    );
    (document.activeElement as HTMLElement).blur();
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    fixture.componentInstance.focus();
    expect(document.activeElement).toBe(document.body);
  });

  it('exposes native labelled radios with one group name and unique IDs', async () => {
    const { root, inputs } = await setup();
    const group = root.querySelector('[role="radiogroup"]')!;
    expect(group.getAttribute('aria-labelledby')).toBe(root.querySelector('hy-field > label')!.id);
    expect(group.getAttribute('aria-describedby')).toBe(root.querySelector('.hy-field__hint')!.id);
    expect(group.getAttribute('aria-required')).toBe('true');
    expect(new Set(inputs.map((input) => input.name)).size).toBe(1);
    expect(inputs[0]!.name).toBeTruthy();
    expect(new Set(inputs.map((input) => input.id)).size).toBe(inputs.length);
    for (const input of inputs) {
      expect(input.type).toBe('radio');
      expect(input.required).toBe(true);
      expect(input.labels!.length).toBeGreaterThan(0);
    }
    expect(inputs[1]!.closest('label')!.textContent).toContain('For individuals');
  });

  it('updates Signal Forms through card-label activation and submits exactly one selected value', async () => {
    const { fixture, root, inputs, host } = await setup();
    inputs[1]!.closest('label')!.click();
    await fixture.whenStable();
    expect(host.model().plan).toBe('basic');
    expect(host.fields.plan().dirty()).toBe(true);
    inputs[2]!.click();
    await fixture.whenStable();
    expect(host.model().plan).toBe('team');
    expect(inputs.map((input) => input.checked)).toEqual([false, false, true]);
    expect(new FormData(root.querySelector('form')!).getAll(inputs[0]!.name)).toEqual(['team']);
    inputs[2]!.click();
    await fixture.whenStable();
    expect(host.model().plan).toBe('team');
  });

  it('does not select disabled options or a disabled group', async () => {
    const { fixture, inputs, host } = await setup();
    inputs[0]!.click();
    await fixture.whenStable();
    expect(host.model().plan).toBe('');
    host.locked.set(true);
    await fixture.whenStable();
    expect(inputs.every((input) => input.disabled)).toBe(true);
    inputs[1]!.click();
    inputs[1]!.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();
    expect(host.model().plan).toBe('');
    host.locked.set(false);
    await fixture.whenStable();
    expect(inputs.map((input) => input.disabled)).toEqual([true, false, false]);
  });

  it('blocks read-only selection while preserving the selected value', async () => {
    const { fixture, inputs, host } = await setup();
    host.model.set({ plan: 'basic' });
    host.readOnly.set(true);
    await fixture.whenStable();
    expect(inputs.every((input) => input.disabled)).toBe(true);
    inputs[2]!.click();
    inputs[2]!.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();
    expect(host.model().plan).toBe('basic');
    expect(inputs[1]!.checked).toBe(true);
  });

  it('marks touched only when focus leaves the group and exposes the field error', async () => {
    const { fixture, root, inputs, host } = await setup();
    inputs[1]!.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: inputs[2]! }),
    );
    await fixture.whenStable();
    expect(host.fields.plan().touched()).toBe(false);
    inputs[2]!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await fixture.whenStable();
    expect(host.fields.plan().touched()).toBe(true);
    expect(root.querySelector('[role="radiogroup"]')!.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('.hy-field__error')!.textContent).toContain('Choose a plan');
  });

  it('resets checked state, dirty and touched through Signal Forms', async () => {
    const { fixture, inputs, host } = await setup();
    inputs[2]!.click();
    inputs[2]!.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();
    expect(host.fields.plan().touched()).toBe(true);
    host.fields().reset({ plan: 'basic' });
    await fixture.whenStable();
    expect(inputs.map((input) => input.checked)).toEqual([false, true, false]);
    expect(host.fields.plan().dirty()).toBe(false);
    expect(host.fields.plan().touched()).toBe(false);
    host.fields().reset({ plan: '' });
    await fixture.whenStable();
    expect(inputs.every((input) => !input.checked)).toBe(true);
  });

  it('isolates generated radio names across independent controls', async () => {
    const first = TestBed.createComponent(HySelectableCard);
    const second = TestBed.createComponent(HySelectableCard);
    for (const fixture of [first, second]) {
      fixture.componentRef.setInput('options', options);
      document.body.appendChild(fixture.nativeElement);
    }
    await Promise.all([first.whenStable(), second.whenStable()]);
    const one: HTMLInputElement = first.nativeElement.querySelector('input[value="basic"]');
    const two: HTMLInputElement = second.nativeElement.querySelector('input[value="team"]');
    expect(one.name).not.toBe(two.name);
    one.click();
    two.click();
    await Promise.all([first.whenStable(), second.whenStable()]);
    expect(one.checked).toBe(true);
    expect(two.checked).toBe(true);
    expect(first.componentInstance.value()).toBe('basic');
    expect(second.componentInstance.value()).toBe('team');
  });

  it('leaves arrow, Space and Tab default actions to native radios', async () => {
    const { inputs } = await setup();
    expect(inputs[1]!.tabIndex).toBe(0);
    for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', ' ', 'Tab']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      inputs[1]!.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    // jsdom does not perform native radio navigation for untrusted key events.
  });

  it('supports classic forms value, touched, disabled and reset via HyForms', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    await fixture.whenStable();
    const inputs: HTMLInputElement[] = [...fixture.nativeElement.querySelectorAll('input')];
    const control = fixture.componentInstance.control;
    expect(inputs[1]!.checked).toBe(true);
    inputs[2]!.click();
    inputs[2]!.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();
    expect(control.value).toBe('team');
    expect(control.touched).toBe(true);
    control.disable();
    await fixture.whenStable();
    expect(inputs.every((input) => input.disabled)).toBe(true);
    control.enable();
    control.reset();
    await fixture.whenStable();
    expect(inputs.map((input) => input.checked)).toEqual([false, true, false]);
    expect(control.touched).toBe(false);
    expect(inputs.map((input) => input.disabled)).toEqual([true, false, false]);
  });

  it('has no axe violations in its field composition', async () => {
    const { root } = await setup();
    await expectNoAxeViolations(root);
  });
});
