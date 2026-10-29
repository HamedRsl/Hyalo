import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, email, form, required } from '@angular/forms/signals';
import { expectNoAxeViolations } from '../src/testing/axe';
import { HY_TEXT_FIELD } from './field';

@Component({
  imports: [HY_TEXT_FIELD, FormField],
  template: `
    <hy-field label="Email" hint="Only for the receipt">
      <span hyPrefix>@</span>
      <input hyInput type="email" [formField]="f.email" />
    </hy-field>
    <hy-field label="Notes" [error]="serverError()">
      <textarea hyInput></textarea>
    </hy-field>
  `,
})
class Host {
  readonly model = signal({ email: '' });
  readonly f = form(this.model, (p) => {
    required(p.email, { message: 'Enter your email' });
    email(p.email, { message: 'That does not look like an email' });
  });
  readonly serverError = signal<string | undefined>(undefined);
}

describe('HyField', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const [emailField, notesField] = [...el.querySelectorAll<HTMLElement>('hy-field')];
    return { fixture, el, emailField: emailField!, notesField: notesField! };
  }

  it('links the label and the hint to the input', async () => {
    const { emailField } = await setup();
    const input = emailField.querySelector('input')!;
    const label = emailField.querySelector('label')!;
    expect(label.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(
      emailField.querySelector('.hy-field__hint')!.id,
    );
  });

  it('marks required fields from the form schema', async () => {
    const { emailField } = await setup();
    expect(emailField.querySelector('.hy-field__required')).not.toBeNull();
    expect(emailField.querySelector('input')!.required).toBe(true);
  });

  it('shows the form error once the field is touched', async () => {
    const { fixture, emailField } = await setup();
    const input = emailField.querySelector('input')!;
    expect(emailField.querySelector('.hy-field__error')!.textContent!.trim()).toBe('');
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(emailField.querySelector('.hy-field__error')!.textContent!.trim()).toBe(
      'Enter your email',
    );
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(
      emailField.querySelector('.hy-field__error')!.id,
    );
  });

  it('shows an explicit error without a form', async () => {
    const { fixture, notesField } = await setup();
    fixture.componentInstance.serverError.set('Too long');
    await fixture.whenStable();
    expect(notesField.dataset['invalid']).toBe('true');
    expect(notesField.querySelector('textarea')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('has no axe violations', async () => {
    const { el } = await setup();
    await expectNoAxeViolations(el);
  });
});
