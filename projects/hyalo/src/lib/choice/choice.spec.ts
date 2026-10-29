import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form, required } from '@angular/forms/signals';
import { expectNoAxeViolations } from '../../testing/axe';
import { HyCheckbox } from './checkbox';
import { HyRadio, HyRadioGroup } from './radio';
import { HySwitch } from './switch';

@Component({
  imports: [HyCheckbox, HySwitch, HyRadioGroup, HyRadio, FormField],
  template: `
    <hy-checkbox [formField]="f.terms" description="You can read them first"
      >I accept the terms</hy-checkbox
    >
    <hy-checkbox [(checked)]="all" [(indeterminate)]="some">Select all</hy-checkbox>
    <hy-switch [(checked)]="notify">Email me</hy-switch>
    <hy-radio-group label="Delivery" [formField]="f.delivery">
      <hy-radio value="standard" description="3 to 5 days">Standard</hy-radio>
      <hy-radio value="express">Express</hy-radio>
    </hy-radio-group>
  `,
})
class Host {
  readonly model = signal({ terms: false, delivery: '' });
  readonly f = form(this.model, (p) =>
    required(p.delivery, { message: 'Choose a delivery option' }),
  );
  readonly all = signal(false);
  readonly some = signal(true);
  readonly notify = signal(false);
}

describe('choice controls', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    return { fixture, el, inputs: [...el.querySelectorAll<HTMLInputElement>('input')] };
  }

  it('binds a checkbox to Signal Forms', async () => {
    const { fixture, inputs } = await setup();
    inputs[0]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().terms).toBe(true);
    expect(inputs[0]!.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('clears indeterminate when toggled', async () => {
    const { fixture, inputs } = await setup();
    expect(inputs[1]!.indeterminate).toBe(true);
    inputs[1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.some()).toBe(false);
    expect(fixture.componentInstance.all()).toBe(true);
  });

  it('exposes the switch role', async () => {
    const { fixture, inputs } = await setup();
    expect(inputs[2]!.getAttribute('role')).toBe('switch');
    inputs[2]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.notify()).toBe(true);
    expect(inputs[2]!.getAttribute('aria-checked')).toBe('true');
  });

  it('runs a radio group with one shared name', async () => {
    const { fixture, el, inputs } = await setup();
    const [standard, express] = [inputs[3]!, inputs[4]!];
    expect(standard.name).toBe(express.name);
    express.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().delivery).toBe('express');
    expect(el.querySelector('hy-radio-group')!.getAttribute('aria-labelledby')).toBeTruthy();
  });

  it('shows the group error once touched', async () => {
    const { fixture, el, inputs } = await setup();
    inputs[3]!.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(el.querySelector('.hy-choice__error')!.textContent).toContain(
      'Choose a delivery option',
    );
  });

  it('has no axe violations', async () => {
    const { el } = await setup();
    await expectNoAxeViolations(el);
  });
});
