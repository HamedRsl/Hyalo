import { TestBed } from '@angular/core/testing';
import { HyNavigationMenu } from './navigation-menu';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyNavigationMenu', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove()));
  it('discloses children at any depth and returns focus one branch at a time', async () => {
    const fixture = TestBed.createComponent(HyNavigationMenu);
    document.body.appendChild(fixture.nativeElement);
    fixture.componentRef.setInput('items', [
      {
        id: 'learn',
        label: 'Learn',
        children: [
          {
            id: 'guides',
            label: 'Guides',
            children: [
              {
                id: 'angular',
                label: 'Angular',
                children: [{ id: 'setup', label: 'Setup', href: '/setup' }],
              },
            ],
          },
        ],
      },
    ]);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(root).not.toBeNull();
    root.click();
    await fixture.whenStable();
    const panel = document.getElementById(root.getAttribute('aria-controls')!)!;
    const guides = panel.querySelector('button')!;
    root.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(guides);
    guides.click();
    await fixture.whenStable();
    const angular = document
      .getElementById(guides.getAttribute('aria-controls')!)!
      .querySelector('button')!;
    angular.click();
    await fixture.whenStable();
    const setup = document
      .getElementById(angular.getAttribute('aria-controls')!)!
      .querySelector('a')!;
    expect(setup.getAttribute('href')).toBe('/setup');
    setup.focus();
    setup.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    expect(document.activeElement).toBe(angular);
    expect(angular.getAttribute('aria-expanded')).toBe('false');
    expect(guides.getAttribute('aria-expanded')).toBe('true');
    expect(root.getAttribute('aria-expanded')).toBe('true');
    angular.click();
    await fixture.whenStable();
    await expectNoAxeViolations(panel);
    guides.click();
    await fixture.whenStable();
    guides.click();
    await fixture.whenStable();
    expect(panel.querySelectorAll('button')[1]?.getAttribute('aria-expanded')).toBe('false');
    root.click();
    await fixture.whenStable();
    root.click();
    await fixture.whenStable();
    expect(
      document
        .getElementById(root.getAttribute('aria-controls')!)!
        .querySelector('button')!
        .getAttribute('aria-expanded'),
    ).toBe('false');
  });

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

  it('renders item decorations and preserves native link targets', async () => {
    const fixture = TestBed.createComponent(HyNavigationMenu);
    fixture.componentRef.setInput('items', [
      {
        id: 'docs',
        label: 'Docs',
        href: '/docs',
        icon: 'chevron-down',
        badge: 'New',
        description: 'Read the docs',
        target: '_blank',
        rel: 'external',
        title: 'Documentation',
      },
      {
        id: 'tree',
        label: 'Tree',
        children: [
          {
            id: 'deep',
            label: 'Deep link',
            href: '/deep',
            icon: 'chevron-down',
            badge: '2',
            target: '_blank',
          },
        ],
        sections: [
          {
            label: 'Legacy',
            links: [{ label: 'Legacy link', href: '/legacy', target: '_blank', badge: 'Legacy' }],
          },
        ],
      },
    ]);
    await fixture.whenStable();
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.target).toBe('_blank');
    expect(link.rel.split(' ')).toEqual(
      expect.arrayContaining(['external', 'noopener', 'noreferrer']),
    );
    expect(link.title).toBe('Documentation');
    expect(link.querySelector('hy-icon svg')).not.toBeNull();
    expect(link.querySelector('.badge')?.textContent).toBe('New');
    expect(link.textContent).toContain('Read the docs');
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    const links = [...document.querySelectorAll<HTMLAnchorElement>('.panel a')];
    expect(links).toHaveLength(2);
    for (const nested of links) {
      expect(nested.target).toBe('_blank');
      expect(nested.rel).toContain('noopener');
      expect(nested.querySelector('.badge')).not.toBeNull();
    }
  });

  it('honors visibility, disabled state and actions in roots, branches and legacy sections', async () => {
    const fixture = TestBed.createComponent(HyNavigationMenu);
    document.body.appendChild(fixture.nativeElement);
    const command = vi.fn();
    const action = { id: 'action', label: 'Run', command };
    fixture.componentRef.setInput('items', [
      { id: 'hidden', label: 'Hidden root', visible: false },
      { id: 'disabled-root', label: 'Disabled root', disabled: true, children: [action] },
      action,
      {
        id: 'tree',
        label: 'Tree',
        children: [
          { id: 'hidden-child', label: 'Hidden child', visible: false },
          { id: 'disabled-child', label: 'Disabled child', disabled: true, children: [action] },
          {
            id: 'disabled-link',
            label: 'Disabled link',
            disabled: true,
            href: '/disabled',
            command,
          },
          action,
        ],
        sections: [
          {
            label: 'Legacy',
            links: [
              { label: 'Hidden legacy', href: '/hidden', visible: false },
              { label: 'Disabled legacy', href: '/disabled', disabled: true, command },
            ],
          },
        ],
      },
    ]);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).not.toContain('Hidden root');
    const buttons = [...root.querySelectorAll('button')];
    expect(buttons[0]?.disabled).toBe(true);
    buttons.find((button) => button.textContent?.trim() === 'Run')!.click();
    expect(command).toHaveBeenCalledWith(
      expect.objectContaining({ item: action, originalEvent: expect.any(MouseEvent) }),
    );
    command.mockClear();
    buttons.find((button) => button.textContent?.trim() === 'Tree')!.click();
    await fixture.whenStable();
    const panel = document.querySelector<HTMLElement>('.panel')!;
    expect(panel.textContent).not.toContain('Hidden child');
    expect(panel.textContent).not.toContain('Hidden legacy');
    expect(panel.querySelector('button')!.disabled).toBe(true);
    const trigger = buttons.find((button) => button.textContent?.trim() === 'Tree')!;
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(panel.querySelectorAll('button')[1]);
    const disabledLinks = panel.querySelectorAll('a[aria-disabled="true"]');
    expect(disabledLinks).toHaveLength(2);
    for (const link of disabledLinks) {
      expect(link.hasAttribute('href')).toBe(false);
      expect(link.getAttribute('tabindex')).toBe('-1');
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
    }
    expect(command).not.toHaveBeenCalled();
    expect(fixture.componentInstance.open()).toBe('tree');
    panel.querySelectorAll('button')[1]!.click();
    await fixture.whenStable();
    expect(command).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.open()).toBeNull();
  });
});
