import { TestBed } from '@angular/core/testing';
import { HyNavigationMenu } from './navigation-menu';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyNavigationMenu', () => {
  it('discloses native links and returns focus on Escape', async () => {
    const fixture = TestBed.createComponent(HyNavigationMenu);
    document.body.appendChild(fixture.nativeElement);
    fixture.componentRef.setInput('items', [
      {
        id: 'learn',
        label: 'Learn',
        sections: [{ label: 'Start', links: [{ label: 'Docs', href: '/docs' }] }],
      },
    ]);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/docs');
    await expectNoAxeViolations(fixture.nativeElement);
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
    button.click();
    await fixture.whenStable();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});
