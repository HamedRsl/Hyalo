import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HySidebar, HY_SIDEBAR } from './sidebar';
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
  afterEach(() => vi.unstubAllGlobals());

  it('opts into compact and collapsed media states without overwriting the collapse model', async () => {
    const queries = new Map<string, { matches: boolean; change: () => void }>();
    vi.stubGlobal('matchMedia', (media: string) => {
      const query = { matches: false, change: (): void => undefined };
      queries.set(media, query);
      return {
        get matches() {
          return query.matches;
        },
        addEventListener: (_: string, listener: () => void) => {
          query.change = listener;
        },
        removeEventListener: vi.fn(),
      };
    });
    const fixture = TestBed.createComponent(HySidebar);
    fixture.componentRef.setInput('responsive', {
      compact: '(max-width: 64rem)',
      collapsed: '(max-width: 40rem)',
    });
    await fixture.whenStable();
    const sidebar = fixture.nativeElement as HTMLElement;
    expect(sidebar.getAttribute('data-state')).toBe('expanded');
    const compact = queries.get('(max-width: 64rem)')!;
    compact.matches = true;
    compact.change();
    await fixture.whenStable();
    expect(sidebar.getAttribute('data-state')).toBe('compact');
    expect(sidebar.getAttribute('data-collapsed')).toBe('false');
    const collapsed = queries.get('(max-width: 40rem)')!;
    collapsed.matches = true;
    collapsed.change();
    await fixture.whenStable();
    expect(sidebar.getAttribute('data-state')).toBe('collapsed');
    expect(sidebar.style.getPropertyValue('--hy-sidebar-label-display')).toBe('none');
    expect(sidebar.querySelector('button')!.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.collapsed()).toBe(false);
    collapsed.matches = false;
    collapsed.change();
    compact.matches = false;
    compact.change();
    await fixture.whenStable();
    expect(sidebar.getAttribute('data-state')).toBe('expanded');
  });
  it('allows the toggle to expand an automatically collapsed sidebar', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const fixture = TestBed.createComponent(HySidebar);
    fixture.componentRef.setInput('responsive', { collapsed: '(max-width: 40rem)' });
    await fixture.whenStable();
    const sidebar = fixture.nativeElement as HTMLElement;
    const toggle = sidebar.querySelector('button')!;
    toggle.focus();
    toggle.click();
    await fixture.whenStable();
    expect(sidebar.getAttribute('data-state')).toBe('expanded');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Collapse navigation');
    expect(document.activeElement).toBe(toggle);
    toggle.click();
    await fixture.whenStable();
    expect(sidebar.getAttribute('data-state')).toBe('collapsed');
    expect(fixture.componentInstance.collapsed()).toBe(true);
  });

  it('keeps responsive behavior opt-in and tolerates unavailable media APIs', async () => {
    const matchMedia = vi.fn();
    vi.stubGlobal('matchMedia', matchMedia);
    const fixture = TestBed.createComponent(HySidebar);
    await fixture.whenStable();
    expect(matchMedia).not.toHaveBeenCalled();
    expect(fixture.nativeElement.getAttribute('data-state')).toBe('expanded');
    vi.stubGlobal('matchMedia', undefined);
    fixture.componentRef.setInput('responsive', { compact: '(max-width: 64rem)' });
    await fixture.whenStable();
    expect(fixture.nativeElement.getAttribute('data-state')).toBe('expanded');
  });

  it('replaces and releases media listeners when configuration changes or the sidebar is destroyed', async () => {
    const lists: {
      addEventListener: ReturnType<typeof vi.fn>;
      removeEventListener: ReturnType<typeof vi.fn>;
    }[] = [];
    vi.stubGlobal('matchMedia', () => {
      const list = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() };
      lists.push(list);
      return list;
    });
    const fixture = TestBed.createComponent(HySidebar);
    fixture.componentRef.setInput('responsive', { compact: '(max-width: 64rem)' });
    await fixture.whenStable();
    expect(fixture.nativeElement.getAttribute('data-state')).toBe('compact');
    fixture.componentRef.setInput('collapsed', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.getAttribute('data-state')).toBe('collapsed');
    fixture.componentRef.setInput('responsive', { collapsed: '(max-width: 40rem)' });
    await fixture.whenStable();
    expect(lists[0]!.removeEventListener).toHaveBeenCalledWith(
      'change',
      lists[0]!.addEventListener.mock.calls[0]![1],
    );
    fixture.componentRef.setInput('collapsed', false);
    fixture.componentRef.setInput('responsive', null);
    await fixture.whenStable();
    expect(fixture.nativeElement.getAttribute('data-state')).toBe('expanded');
    expect(lists[1]!.removeEventListener).toHaveBeenCalledWith(
      'change',
      lists[1]!.addEventListener.mock.calls[0]![1],
    );
    fixture.componentRef.setInput('responsive', { compact: '(max-width: 64rem)' });
    await fixture.whenStable();
    fixture.destroy();
    expect(lists[2]!.removeEventListener).toHaveBeenCalledWith(
      'change',
      lists[2]!.addEventListener.mock.calls[0]![1],
    );
  });

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
