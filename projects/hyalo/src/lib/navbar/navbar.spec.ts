import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expectNoAxeViolations } from '../../testing/axe';
import { HY_NAVBAR, HyNavbar } from './navbar';

@Component({
  imports: [HY_NAVBAR],
  template: `
    <hy-navbar label="Main" [(menuOpen)]="open">
      <a hyNavbarBrand href="/">Atelier</a>
      <a href="/watches">Watches</a>
      <a href="/journal">Journal</a>
      <div hyNavbarActions><button type="button">Sign in</button></div>
    </hy-navbar>
  `,
})
class Host {
  open = false;
}

describe('HyNavbar', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const toggle = el.querySelector<HTMLButtonElement>('.hy-navbar__toggle')!;
    return { fixture, el, toggle };
  }

  it('wraps links in a labelled nav landmark', async () => {
    const { el } = await setup();
    const nav = el.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Main');
    expect(nav.querySelectorAll('a').length).toBe(2);
  });

  it('opens the collapsed menu and syncs the two-way binding', async () => {
    const { fixture, el, toggle } = await setup();
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-controls')).toBe(el.querySelector('nav')!.id);
    expect(fixture.componentInstance.open).toBe(true);
  });

  it('closes on Escape and returns focus to the toggle', async () => {
    const { fixture, el, toggle } = await setup();
    // jsdom has no container queries, so the toggle would stay display: none.
    toggle.style.display = 'grid';
    toggle.click();
    await fixture.whenStable();
    el.querySelector('nav a')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });

  it('closes after a link is chosen', async () => {
    const { fixture, el, toggle } = await setup();
    toggle.click();
    await fixture.whenStable();
    const link = el.querySelector<HTMLAnchorElement>('nav a')!;
    link.addEventListener('click', (e) => e.preventDefault());
    link.click();
    await fixture.whenStable();
    expect(
      fixture.debugElement
        .query((d) => d.componentInstance instanceof HyNavbar)
        .componentInstance.menuOpen(),
    ).toBe(false);
  });

  it('has no axe violations', async () => {
    const { el } = await setup();
    await expectNoAxeViolations(el);
  });
});
