import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expectNoAxeViolations } from '../src/testing/axe';
import { HY_TABS } from './tabs';

@Component({
  imports: [HY_TABS],
  template: `
    <hy-tabs label="Details" [(selected)]="tab">
      <hy-tab value="overview" label="Overview">Overview panel</hy-tab>
      <hy-tab value="specs" label="Specs">Specs panel</hy-tab>
      <hy-tab value="care" label="Care" disabled>Care panel</hy-tab>
    </hy-tabs>
  `,
})
class Host {
  readonly tab = signal<string | undefined>(undefined);
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
