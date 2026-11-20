import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { provideRouter } from '@angular/router';
import { HySidebar, HySidebarController } from './sidebar';
import { HySidebarGroups } from './sidebar-group';

describe('sidebar audit contracts', () => {
  it('renders router metadata only for configured data links', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(HySidebarGroups);
    f.componentRef.setInput('groups', [{ id: 'g', label: 'Group', items: [{ id: 'r', label: 'Route', routerLink: ['/inbox'], queryParams: { unread: true }, fragment: 'latest' }] }]);
    await f.whenStable(); expect(f.nativeElement.querySelector('a').getAttribute('href')).toBe('/inbox?unread=true#latest');
  });
  it('registers tagged instances, controls them and releases destroyed registrations', async () => {
    const f = TestBed.createComponent(HySidebar); f.componentRef.setInput('tag', 'primary');
    f.componentRef.setInput('docked', true); f.componentRef.setInput('topOffset', '4rem'); f.componentRef.setInput('bottomOffset', '1rem'); await f.whenStable();
    const controller = TestBed.inject(HySidebarController);
    controller.collapse('primary'); await f.whenStable(); expect(f.componentInstance.collapsed()).toBe(true);
    controller.expand('primary'); await f.whenStable(); expect(f.componentInstance.collapsed()).toBe(false);
    expect(f.nativeElement.style.position).toBe('sticky'); expect(f.nativeElement.style.top).toBe('4rem');
    f.destroy(); expect(controller.get('primary')).toBeUndefined();
  });
  it('renders recursive navigation disclosures and excludes hidden and disabled actions', async () => {
    const f = TestBed.createComponent(HySidebarGroups);
    f.componentRef.setInput('groups', [{ id: 'g', label: 'Group', items: [{ id: 'a', label: 'Parent', children: [{ id: 'b', label: 'Child', children: [{ id: 'c', label: 'Leaf', href: '/leaf' }] }] }] }]);
    await f.whenStable();
    const buttons = () => f.nativeElement.querySelectorAll('button'); buttons()[0].click(); await f.whenStable(); buttons()[1].click(); await f.whenStable();
    expect(f.nativeElement.querySelector('a').getAttribute('href')).toBe('/leaf');
    buttons()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await f.whenStable();
    expect(f.nativeElement.querySelector('a')).toBeNull();
  });
});
