import { TestBed } from '@angular/core/testing';
import { HyTabBar } from './tab-bar';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyTabBar', () => {
  it('keeps native link semantics and skips disabled destinations with directional keys', async () => {
    const f = TestBed.createComponent(HyTabBar);
    f.componentRef.setInput('label', 'Main navigation');
    f.componentRef.setInput('activeId', 'home');
    f.componentRef.setInput('items', [
      { id: 'home', label: 'Home', href: '#home' },
      { id: 'blocked', label: 'Blocked', href: '#blocked', disabled: true },
      { id: 'chat', label: 'Chat', href: '#chat', badge: 2 },
    ]);
    await f.whenStable();
    const links = f.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    expect(links[0]?.getAttribute('aria-current')).toBe('page');
    expect(links[1]?.hasAttribute('href')).toBe(false);
    links[0]?.focus();
    links[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(links[2]);
    f.nativeElement.style.direction = 'rtl';
    links[2]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(links[0]);
    await expectNoAxeViolations(f.nativeElement);
  });
});
