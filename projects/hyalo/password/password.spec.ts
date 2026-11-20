import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, disabled, form, readonly, required } from '@angular/forms/signals';
import { HyField, HyForms } from '@hyalo/angular/field';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../src/testing/axe';
import { HyPassword } from './password';

@Component({
  imports: [HyPassword, HyField, FormField],
  template: `
    <form>
      <hy-field label="Password" hint="Use a unique password">
        <hy-password [formField]="fields.password" />
      </hy-field>
    </form>
  `,
})
class Host {
  readonly model = signal({ password: '' });
  readonly locked = signal(false);
  readonly readOnly = signal(false);
  readonly fields = form(this.model, (path) => {
    required(path.password, { message: 'Enter a password' });
    disabled(path.password, { when: () => this.locked() });
    readonly(path.password, { when: () => this.readOnly() });
  });
}

@Component({
  imports: [HyPassword, HyForms, ReactiveFormsModule],
  template: `<hy-password
    #password
    label="Password"
    [hyForms]="password"
    [formControl]="control"
  />`,
})
class ReactiveHost {
  readonly control = new FormControl('Original1!password', { nonNullable: true });
}

function enter(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function leave(input: HTMLElement, relatedTarget: EventTarget | null = null): void {
  input.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget }));
}

describe('HyPassword', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    return {
      fixture,
      root,
      input: root.querySelector('input')!,
      button: root.querySelector('button')!,
      host: fixture.componentInstance,
    };
  }

  it('exposes a named native password input with field label, hint and required metadata', async () => {
    const { root, input, button } = await setup();
    expect(input.type).toBe('password');
    expect(input.name).toBeTruthy();
    expect(input.autocomplete).toBe('new-password');
    expect(input.required).toBe(true);
    expect(root.querySelector('label')!.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-labelledby')).toBe(root.querySelector('label')!.id);
    expect(input.getAttribute('aria-describedby')).toBe(root.querySelector('.hy-field__hint')!.id);
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-controls')).toBe(input.id);
    expect(button.getAttribute('aria-label')).toBe('Show password');
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('updates Signal Forms and native form submission without changing password characters', async () => {
    const { fixture, host, root, input } = await setup();
    enter(input, '  رمز۱۲Ab!  ');
    await fixture.whenStable();
    expect(host.model().password).toBe('  رمز۱۲Ab!  ');
    expect(host.fields.password().dirty()).toBe(true);
    expect(new FormData(root.querySelector('form')!).get(input.name)).toBe('  رمز۱۲Ab!  ');
  });

  it('reveals and hides without submitting, changing the value, or replacing the focused input', async () => {
    const { fixture, root, input, button, host } = await setup();
    enter(input, 'KeepThis1!password');
    await fixture.whenStable();
    let submissions = 0;
    root.querySelector('form')!.addEventListener('submit', (event) => {
      submissions++;
      event.preventDefault();
    });
    button.focus();
    button.click();
    await fixture.whenStable();
    expect(input.type).toBe('text');
    expect(button.getAttribute('aria-label')).toBe('Hide password');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(input);
    expect(root.querySelector('input')).toBe(input);
    button.click();
    await fixture.whenStable();
    expect(input.type).toBe('password');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(host.model().password).toBe('KeepThis1!password');
    expect(submissions).toBe(0);
    expect(host.fields.password().touched()).toBe(false);
  });

  it('does not mark touched while focus moves within the control, only when it leaves', async () => {
    const { fixture, input, button, host, root } = await setup();
    leave(input, button);
    leave(button, input);
    await fixture.whenStable();
    expect(host.fields.password().touched()).toBe(false);
    leave(input);
    await fixture.whenStable();
    expect(host.fields.password().touched()).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('.hy-field__error')!.textContent).toContain('Enter a password');
    expect(input.getAttribute('aria-describedby')).toBe(root.querySelector('.hy-field__error')!.id);
  });

  it('disables editing and the reveal action through Signal Forms', async () => {
    const { fixture, host, input, button } = await setup();
    host.locked.set(true);
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    enter(input, 'Blocked1!password');
    button.click();
    await fixture.whenStable();
    expect(host.model().password).toBe('');
    expect(input.type).toBe('password');
    host.locked.set(false);
    await fixture.whenStable();
    expect(input.disabled).toBe(false);
    expect(button.disabled).toBe(false);
  });

  it('keeps read-only text focusable and revealable without allowing model edits', async () => {
    const { fixture, host, input, button } = await setup();
    host.model.set({ password: 'Original1!password' });
    host.readOnly.set(true);
    await fixture.whenStable();
    expect(input.readOnly).toBe(true);
    expect(input.disabled).toBe(false);
    expect(button.disabled).toBe(false);
    input.focus();
    expect(document.activeElement).toBe(input);
    enter(input, 'Forbidden1!password');
    button.click();
    await fixture.whenStable();
    expect(host.model().password).toBe('Original1!password');
    expect(input.type).toBe('text');
  });

  it('resets visibility, native value and touched state through Signal Forms', async () => {
    const { fixture, host, input, button } = await setup();
    enter(input, 'OldSecret1!password');
    button.click();
    leave(input);
    await fixture.whenStable();
    expect(input.type).toBe('text');
    expect(host.fields.password().touched()).toBe(true);
    host.fields().reset({ password: 'Replacement1!password' });
    await fixture.whenStable();
    expect(input.type).toBe('password');
    expect(input.value).toBe('Replacement1!password');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(host.fields.password().touched()).toBe(false);
    expect(host.fields.password().dirty()).toBe(false);
  });

  it.each([
    ['', 'No password entered'],
    ['aA1!', 'Too short'],
    ['abcdefghijkl', 'Add variety'],
    ['Abcdefghij12', 'Stronger'],
    ['abcdefghij1!', 'Stronger'],
  ])('announces the strength estimate for %j', async (value, estimate) => {
    const fixture = TestBed.createComponent(HyPassword);
    fixture.componentRef.setInput('value', value);
    await fixture.whenStable();
    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    expect(status.textContent).toContain(estimate);
    expect(status.textContent).toContain('This is not a security guarantee.');
  });

  it('reacts to a custom strength threshold and can hide the estimate', async () => {
    const fixture = TestBed.createComponent(HyPassword);
    fixture.componentRef.setInput('value', 'Ab1!');
    fixture.componentRef.setInput('minLength', 4);
    fixture.componentRef.setInput('autocomplete', 'current-password');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'Stronger',
    );
    expect(fixture.nativeElement.querySelector('input').autocomplete).toBe('current-password');
    fixture.componentRef.setInput('minLength', undefined);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'Too short',
    );
    fixture.componentRef.setInput('showStrength', false);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  });

  it('retains native keyboard activation instead of intercepting Enter, Space or Tab', async () => {
    const { button } = await setup();
    expect(button.tabIndex).toBe(0);
    for (const key of ['Enter', ' ', 'Tab']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      button.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    // jsdom does not synthesize a trusted keyboard event's native click default action.
  });

  it('supports classic forms value, touched, disabled and reset via HyForms', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const control = fixture.componentInstance.control;
    expect(input.value).toBe(control.value);
    enter(input, 'Changed1!password');
    leave(input);
    await fixture.whenStable();
    expect(control.value).toBe('Changed1!password');
    expect(control.touched).toBe(true);
    control.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    control.enable();
    control.reset();
    await fixture.whenStable();
    expect(input.value).toBe('Original1!password');
    expect(control.touched).toBe(false);
    expect(input.disabled).toBe(false);
  });

  it('has no axe violations in its field composition', async () => {
    const { root } = await setup();
    await expectNoAxeViolations(root);
  });
});
