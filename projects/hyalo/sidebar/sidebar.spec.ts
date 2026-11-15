import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_SIDEBAR } from './sidebar';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HY_SIDEBAR],
  template:
    '<hy-sidebar [(collapsed)]="collapsed"><a hySidebarItem href="/" label="Overview" aria-label="Overview" icon="home" active></a></hy-sidebar>',
})
class Host {
  readonly collapsed = signal(false);
}
describe('HySidebar', () => {
  it('collapses to icons while retaining native link names and current-page semantics', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const toggle = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    toggle.focus();
    toggle.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.collapsed()).toBe(true);
    const link = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('aria-label')).toBe('Overview');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.getAttribute('href')).toBe('/');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Expand navigation');
    expect(document.activeElement).toBe(toggle);
    toggle.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.collapsed()).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Collapse navigation');
    expect(document.activeElement).toBe(toggle);
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
