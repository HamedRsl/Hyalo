import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form } from '@angular/forms/signals';
import { expectNoAxeViolations } from '../src/testing/axe';
import { HySegmented, type HySegmentedOption } from './segmented';

@Component({
  imports: [HySegmented, FormField],
  template: `
    <hy-segmented
      label="Billing"
      [options]="periods"
      [(value)]="period"
      [disabled]="disabled()"
      (touch)="touched.set(true)"
    />
    <hy-segmented label="View" [options]="views" [formField]="f.view" />
    <hy-segmented label="Layout" name="layout" [options]="views" />
  `,
})
class Host {
  readonly period = signal<string | undefined>('month');
  readonly disabled = signal(false);
  readonly touched = signal(false);
  readonly periods: HySegmentedOption<string>[] = [
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' },
    { value: 'life', label: 'Lifetime', disabled: true },
  ];
  readonly views: HySegmentedOption<string>[] = [
    { value: 'grid', label: 'Grid' },
    { value: 'list', label: 'List' },
  ];
  readonly model = signal({ view: 'grid' });
  readonly f = form(this.model);
}

describe('HySegmented', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const [billing, view, layout] = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('hy-segmented'),
    ];
    const radios = (group: HTMLElement) => [
      ...group.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    ];
    return { fixture, billing: billing!, view: view!, layout: layout!, radios };
  }

  it('is a labelled radio group bound to the value', async () => {
    const { fixture, billing, radios } = await setup();
    expect(billing.getAttribute('role')).toBe('radiogroup');
    expect(billing.getAttribute('aria-label')).toBe('Billing');
    const [month, year] = radios(billing);
    expect(month!.checked).toBe(true);
    expect(month!.closest('label')!.hasAttribute('data-checked')).toBe(true);
    year!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.period()).toBe('year');
    expect(year!.closest('label')!.hasAttribute('data-checked')).toBe(true);
  });

  it('shares a generated name, or uses the one given', async () => {
    const { billing, layout, radios } = await setup();
    const [month, year] = radios(billing);
    expect(month!.name).toBeTruthy();
    expect(month!.name).toBe(year!.name);
    expect(radios(layout).every((r) => r.name === 'layout')).toBe(true);
  });

  it('disables single options and the whole group', async () => {
    const { fixture, billing, radios } = await setup();
    expect(radios(billing).map((r) => r.disabled)).toEqual([false, false, true]);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    expect(radios(billing).every((r) => r.disabled)).toBe(true);
    expect(billing.getAttribute('aria-disabled')).toBe('true');
  });

  it('emits touch when an option loses focus', async () => {
    const { fixture, billing, radios } = await setup();
    radios(billing)[0]!.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('works with Signal Forms', async () => {
    const { fixture, view, radios } = await setup();
    const [grid, list] = radios(view);
    expect(grid!.checked).toBe(true);
    list!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().view).toBe('list');
  });

  it('has no axe violations', async () => {
    const { fixture } = await setup();
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
