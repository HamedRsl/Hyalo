import { TestBed } from '@angular/core/testing';
import { HyNavigationMenu } from './navigation-menu';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyNavigationMenu', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove()));
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
    const panel = document.getElementById(button.getAttribute('aria-controls')!)!;
    expect(panel.closest('.cdk-overlay-container')).not.toBeNull();
    expect(fixture.nativeElement.contains(panel)).toBe(false);
    expect(panel.querySelector('a')!.getAttribute('href')).toBe('/docs');
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(panel.querySelector('a'));
    expect(button.getAttribute('aria-expanded')).toBe('true');
    panel.querySelector('a')!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(button);
    await expectNoAxeViolations(fixture.nativeElement);
    panel
      .querySelector('a')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
    button.click();
    await fixture.whenStable();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});
