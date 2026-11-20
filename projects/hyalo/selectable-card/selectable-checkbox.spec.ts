import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, disabled, form, readonly, required } from '@angular/forms/signals';
import { HyField, HyForms } from '@hyalo/angular/field';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../src/testing/axe';
import { HySelectableCheckbox } from './selectable-checkbox';

@Component({
  imports: [HySelectableCheckbox, HyField, FormField],
  template: `<form>
    <hy-field label="Updates" hint="Optional email updates">
      <hy-selectable-checkbox [formField]="fields.updates">Send me updates</hy-selectable-checkbox>
    </hy-field>
  </form>`,
})
class Host {
  readonly model = signal({ updates: false });
  readonly locked = signal(false);
  readonly readOnly = signal(false);
  readonly fields = form(this.model, (path) => {
    required(path.updates, { message: 'Confirm updates' });
    disabled(path.updates, { when: () => this.locked() });
    readonly(path.updates, { when: () => this.readOnly() });
  });
}

@Component({
  imports: [HySelectableCheckbox, HyForms, ReactiveFormsModule],
  template: `<hy-selectable-checkbox #card [hyForms]="card" [formControl]="control"
    >Updates</hy-selectable-checkbox
  >`,
})
class ReactiveHost {
  readonly control = new FormControl(false, { nonNullable: true });
}

describe('HySelectableCheckbox', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    return { fixture, root, input: root.querySelector('input')!, host: fixture.componentInstance };
  }

  it('exposes a native checkbox labelled by its card and field with required and hint metadata', async () => {
    const { root, input } = await setup();
    expect(input.type).toBe('checkbox');
    expect(input.required).toBe(true);
    expect(input.name).toBeTruthy();
    expect(root.querySelector('.card')!.getAttribute('for')).toBe(input.id);
    expect(root.querySelector('hy-field > label')!.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(root.querySelector('.hy-field__hint')!.id);
  });

  it('toggles through the whole card and submits only when checked', async () => {
    const { fixture, root, input, host } = await setup();
    expect(new FormData(root.querySelector('form')!).has(input.name)).toBe(false);
    root.querySelector<HTMLElement>('.card span')!.click();
    await fixture.whenStable();
    expect(input.checked).toBe(true);
    expect(host.model().updates).toBe(true);
    expect(host.fields.updates().dirty()).toBe(true);
    expect(new FormData(root.querySelector('form')!).get(input.name)).toBe('on');
    input.click();
    await fixture.whenStable();
    expect(host.model().updates).toBe(false);
    expect(input.checked).toBe(false);
  });

  it('marks touched on leaving and exposes the field error', async () => {
    const { fixture, root, input, host } = await setup();
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: input }));
    await fixture.whenStable();
    expect(host.fields.updates().touched()).toBe(false);
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();
    expect(host.fields.updates().touched()).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('.hy-field__error')!.textContent).toContain('Confirm updates');
    expect(input.getAttribute('aria-describedby')).toBe(root.querySelector('.hy-field__error')!.id);
  });

  it.each(['disabled', 'readonly'] as const)('blocks %s changes', async (mode) => {
    const { fixture, root, input, host } = await setup();
    (mode === 'disabled' ? host.locked : host.readOnly).set(true);
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    root.querySelector<HTMLElement>('.card')!.click();
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();
    expect(host.model().updates).toBe(false);
    expect(input.checked).toBe(false);
    (mode === 'disabled' ? host.locked : host.readOnly).set(false);
    await fixture.whenStable();
    expect(input.disabled).toBe(false);
  });

  it('resets checked, touched and dirty state through Signal Forms', async () => {
    const { fixture, input, host } = await setup();
    input.click();
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();
    expect(host.fields.updates().touched()).toBe(true);
    host.fields().reset({ updates: false });
    await fixture.whenStable();
    expect(input.checked).toBe(false);
    expect(host.fields.updates().touched()).toBe(false);
    expect(host.fields.updates().dirty()).toBe(false);
  });

  it('leaves Space and Tab activation to the native checkbox', async () => {
    const { input } = await setup();
    expect(input.tabIndex).toBe(0);
    for (const key of [' ', 'Tab']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      input.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    // jsdom does not synthesize a native Space click from untrusted key events.
  });

  it('supports classic forms checked, touched, disabled and reset via HyForms', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const control = fixture.componentInstance.control;
    input.click();
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();
    expect(control.value).toBe(true);
    expect(control.touched).toBe(true);
    control.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    control.enable();
    control.reset();
    await fixture.whenStable();
    expect(input.checked).toBe(false);
    expect(input.disabled).toBe(false);
    expect(control.touched).toBe(false);
  });

  it('has no axe violations in its field composition', async () => {
    const { root } = await setup();
    await expectNoAxeViolations(root);
  });
});
