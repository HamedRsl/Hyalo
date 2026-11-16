import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_SIDEBAR, type HySidebarNavGroup } from './sidebar';
import { expectNoAxeViolations } from '../src/testing/axe';

@Component({
  imports: [HY_SIDEBAR],
  template:
    '<hy-sidebar [(collapsed)]="collapsed"><hy-sidebar-groups [groups]="groups()" [activeId]="active()" (selected)="active.set($event.id)" /></hy-sidebar>',
})
class Host {
  readonly collapsed = signal(false);
  readonly active = signal('inbox');
  readonly groups = signal<readonly HySidebarNavGroup[]>([
    { id: 'empty', label: 'Hidden', items: [] },
    {
      id: 'work',
      label: 'Workspace',
      items: [
        {
          id: 'inbox',
          label: 'Inbox',
          href: '#inbox',
          description: 'Team messages',
          count: 0,
          countLabel: 'No unread messages',
        },
      ],
    },
  ]);
}
describe('HySidebarGroups', () => {
  it('omits empty groups and preserves names, counts, and native links when collapsed', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('[role=group]')).toHaveLength(1);
    const link = f.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.href).toContain('#inbox');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.getAttribute('aria-label')).toBe('Inbox Team messages No unread messages');
    expect(link.querySelector('.count')?.textContent?.trim()).toBe('0');
    link.focus();
    f.componentInstance.collapsed.set(true);
    await f.whenStable();
    expect(document.activeElement).toBe(link);
    expect(link.getAttribute('aria-label')).toContain('Inbox');
    await expectNoAxeViolations(f.nativeElement);
    f.componentInstance.groups.set([]);
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('[role=group]')).toHaveLength(0);
  });
});
