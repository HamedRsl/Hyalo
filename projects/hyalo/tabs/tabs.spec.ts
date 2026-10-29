import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expectNoAxeViolations } from '../src/testing/axe';
import { HY_TABS } from './tabs';
import { HySegmented } from '@hyalo/angular/segmented';

@Component({
  imports: [HY_TABS, HySegmented],
  template: `
    <hy-tabs label="Details" [(selected)]="tab">
      <hy-tab value="overview" label="Overview">Overview panel</hy-tab>
      <hy-tab value="specs" label="Specs">Specs panel</hy-tab>
      <hy-tab value="care" label="Care" disabled>Care panel</hy-tab>
    </hy-tabs>
    <hy-segmented label="Billing" [options]="periods" [(value)]="period" />
  `,
})
class Host {
  readonly tab = signal<string | undefined>(undefined);
  readonly period = signal<string | undefined>('month');
  readonly periods = [
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' },
  ];
}

describe('HyTabs', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    return { fixture, el, tabs: [...el.querySelectorAll<HTMLElement>('[role="tab"]')] };
  }

  it('selects the first enabled tab by default', async () => {
    const { el, tabs } = await setup();
    expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
    const panels = el.querySelectorAll('[role="tabpanel"]');
    expect(panels[0]!.hasAttribute('inert')).toBe(false);
    expect(panels[1]!.hasAttribute('inert')).toBe(true);
  });

  it('links tabs and panels', async () => {
    const { el, tabs } = await setup();
    const panel = el.querySelectorAll('[role="tabpanel"]')[0]!;
    expect(tabs[0]!.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tabs[0]!.id);
  });

  it('moves with arrow keys and updates the binding', async () => {
    const { fixture, el, tabs } = await setup();
    tabs[0]!.focus();
    el.querySelector('[role="tablist"]')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    await fixture.whenStable();
    expect(fixture.componentInstance.tab()).toBe('specs');
    expect(tabs[1]!.getAttribute('aria-selected')).toBe('true');
  });

  it('opens a tab on click', async () => {
    const { fixture, tabs } = await setup();
    tabs[1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.tab()).toBe('specs');
  });

  it('has no axe violations', async () => {
    const { el } = await setup();
    await expectNoAxeViolations(el);
  });
});

describe('HySegmented', () => {
  it('is a labelled radio group bound to the value', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const group: HTMLElement = fixture.nativeElement.querySelector('hy-segmented');
    expect(group.getAttribute('role')).toBe('radiogroup');
    const radios = group.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    expect(radios[0]!.checked).toBe(true);
    radios[1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.period()).toBe('year');
    expect(radios[0]!.name).toBe(radios[1]!.name);
  });
});
