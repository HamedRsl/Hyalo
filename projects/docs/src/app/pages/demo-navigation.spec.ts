import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import BreadcrumbPage from './breadcrumb';
import SidebarPage from './sidebar';
import DashboardPage from './dashboard';

function follow(link: HTMLAnchorElement): MouseEvent {
  const click = new MouseEvent('click', { bubbles: true, cancelable: true });
  link.dispatchEvent(click);
  return click;
}

describe('Demo navigation', () => {
  it('updates breadcrumb location locally and resets the full path', async () => {
    const fixture = TestBed.createComponent(BreadcrumbPage);
    await fixture.whenStable();
    const demo: HTMLElement = fixture.nativeElement.querySelector('.phase3-demo');
    const url = window.location.href;
    const click = follow(demo.querySelectorAll<HTMLAnchorElement>('hy-breadcrumb a')[1]!);
    await fixture.whenStable();
    expect(click.defaultPrevented).toBe(true);
    expect(window.location.href).toBe(url);
    expect(demo.querySelector('[aria-current="page"]')?.textContent).toContain('Components');
    expect(demo.querySelector('[role="status"]')?.textContent).toContain('Components');
    demo.querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable();
    expect(demo.querySelector('[aria-current="page"]')?.textContent).toContain('Breadcrumb');
  });

  it('changes sidebar selection without hash navigation in either rail mode', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SidebarPage);
    await fixture.whenStable();
    const demo: HTMLElement = fixture.nativeElement.querySelector('.phase3-demo');
    const url = window.location.href;
    const links = demo.querySelectorAll<HTMLAnchorElement>('a[hySidebarItem]');
    const click = follow(links[1]!);
    await fixture.whenStable();
    expect(click.defaultPrevented).toBe(true);
    expect(links[1]!.getAttribute('aria-current')).toBe('page');
    expect(links[0]!.hasAttribute('aria-current')).toBe(false);
    demo.querySelector<HTMLButtonElement>('hy-sidebar button')!.click();
    await fixture.whenStable();
    expect(follow(links[2]!).defaultPrevented).toBe(true);
    await fixture.whenStable();
    expect(links[2]!.getAttribute('aria-current')).toBe('page');
    expect(demo.querySelector('[role="status"]')?.textContent).toContain('Settings');
    expect(window.location.href).toBe(url);
  });

  it('keeps dashboard navigation in the demo and returns through its breadcrumb', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(DashboardPage);
    await fixture.whenStable();
    const demo: HTMLElement = fixture.nativeElement.querySelector('.workspace');
    const url = window.location.href;
    const projects = demo.querySelectorAll<HTMLAnchorElement>('a[hySidebarItem]')[1]!;
    expect(follow(projects).defaultPrevented).toBe(true);
    await fixture.whenStable();
    expect(projects.getAttribute('aria-current')).toBe('page');
    expect(demo.querySelector('hy-breadcrumb [aria-current="page"]')?.textContent).toContain(
      'Projects',
    );
    expect(demo.querySelector('h2')?.textContent).toContain('Projects');
    expect(follow(demo.querySelector<HTMLAnchorElement>('hy-breadcrumb a')!).defaultPrevented).toBe(
      true,
    );
    await fixture.whenStable();
    expect(demo.querySelector('hy-breadcrumb [aria-current="page"]')?.textContent).toContain(
      'Overview',
    );
    expect(window.location.href).toBe(url);
  });
});
