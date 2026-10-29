import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form, required } from '@angular/forms/signals';
import { expectNoAxeViolations } from '../../testing/axe';
import { HY_TEXT_FIELD } from '../field/field';
import { HyFidelity } from '../fidelity/fidelity';
import { HySelect } from './select';

@Component({
  imports: [HY_TEXT_FIELD, HySelect, FormField],
  template: `
    <hy-field label="Strap">
      <hy-select [options]="straps" [formField]="f.strap" placeholder="Choose a strap" />
    </hy-field>
  `,
})
class Host {
  readonly model = signal({ strap: '' });
  readonly f = form(this.model, (p) => required(p.strap, { message: 'Pick a strap' }));
  readonly straps = [
    { value: 'leather', label: 'Leather' },
    { value: 'steel', label: 'Steel' },
    { value: 'rubber', label: 'Rubber', disabled: true },
  ];
}

describe('HySelect', () => {
  afterEach(() =>
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => (el.innerHTML = '')),
  );

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const trigger = el.querySelector<HTMLButtonElement>('[role="combobox"]')!;
    return { fixture, el, trigger };
  }

  const key = (target: Element, k: string) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

  it('renders a labelled combobox trigger', async () => {
    const { el, trigger } = await setup();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Choose a strap');
    const labelId = el.querySelector('label')!.id;
    expect(trigger.getAttribute('aria-labelledby')).toContain(labelId);
  });

  it('opens with the keyboard and picks an option', async () => {
    const { fixture, trigger } = await setup();
    trigger.focus();
    key(trigger, 'ArrowDown');
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const options = document.querySelectorAll<HTMLElement>('[role="option"]');
    expect(options.length).toBe(3);
    options[1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().strap).toBe('steel');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Steel');
  });

  it('shows the form error after blur', async () => {
    const { fixture, el, trigger } = await setup();
    trigger.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(el.querySelector('.hy-field__error')!.textContent!.trim()).toBe('Pick a strap');
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
  });

  it('falls back to a native select on the low tier', async () => {
    const { fixture, el } = await setup();
    TestBed.inject(HyFidelity).setTier('low');
    await fixture.whenStable();
    const select = el.querySelector('select')!;
    expect(select).not.toBeNull();
    expect(el.querySelector('label')!.htmlFor).toBe(select.id);
    select.value = '0';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().strap).toBe('leather');
  });

  it('has no axe violations', async () => {
    const { el } = await setup();
    await expectNoAxeViolations(el);
  });
});
