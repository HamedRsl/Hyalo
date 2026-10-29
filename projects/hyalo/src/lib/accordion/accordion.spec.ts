import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expectNoAxeViolations } from '../../testing/axe';
import { HY_ACCORDION } from './accordion';

@Component({
  imports: [HY_ACCORDION],
  template: `
    <hy-accordion [multiple]="multiple()">
      <hy-accordion-item heading="Delivery" [headingLevel]="2" [(expanded)]="first"
        >Three to five days.</hy-accordion-item
      >
      <hy-accordion-item heading="Returns">Within 30 days.</hy-accordion-item>
      <hy-accordion-item heading="Warranty">Five years.</hy-accordion-item>
    </hy-accordion>
  `,
})
class Host {
  readonly multiple = signal(false);
  readonly first = signal(false);
}

describe('HyAccordion', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const triggers = [...el.querySelectorAll<HTMLButtonElement>('.hy-accordion__trigger')];
    const panels = [...el.querySelectorAll<HTMLElement>('[role="region"]')];
    return { fixture, el, triggers, panels };
  }

  it('links headers and panels and keeps closed content inert', async () => {
    const { el, triggers, panels } = await setup();
    expect(triggers[0]!.getAttribute('aria-expanded')).toBe('false');
    expect(triggers[0]!.getAttribute('aria-controls')).toBe(panels[0]!.id);
    expect(panels[0]!.hasAttribute('inert')).toBe(true);
    expect(panels[0]!.textContent).toContain('Three to five days.');
    expect(el.querySelector('[role="heading"]')!.getAttribute('aria-level')).toBe('2');
  });

  it('opens one section at a time and syncs the binding', async () => {
    const { fixture, triggers, panels } = await setup();
    triggers[0]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.first()).toBe(true);
    expect(panels[0]!.hasAttribute('inert')).toBe(false);
    triggers[1]!.click();
    await fixture.whenStable();
    expect(triggers[0]!.getAttribute('aria-expanded')).toBe('false');
    expect(triggers[1]!.getAttribute('aria-expanded')).toBe('true');
  });

  it('allows several open sections with multiple', async () => {
    const { fixture, triggers } = await setup();
    fixture.componentInstance.multiple.set(true);
    await fixture.whenStable();
    triggers[0]!.click();
    triggers[1]!.click();
    await fixture.whenStable();
    expect(triggers.filter((t) => t.getAttribute('aria-expanded') === 'true').length).toBe(2);
  });

  it('moves between headers with arrow keys', async () => {
    const { fixture, el, triggers } = await setup();
    triggers[0]!.focus();
    triggers[0]!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    el.querySelector('hy-accordion')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await fixture.whenStable();
    expect(document.activeElement).toBe(triggers[1]);
  });

  it('has no axe violations', async () => {
    const { el } = await setup();
    await expectNoAxeViolations(el);
  });
});
