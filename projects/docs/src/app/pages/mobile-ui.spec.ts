import { type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import DockPage from './dock';
import TabBarPage from './tab-bar';

describe('mobile navigation demos', () => {
  for (const [component, selector] of [
    [DockPage, 'hy-dock'],
    [TabBarPage, 'hy-tab-bar'],
  ] as readonly [Type<unknown>, string][]) {
    it('changes selection locally in ' + selector + ' without following its link', async () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(component);
      await fixture.whenStable();
      const links = fixture.nativeElement.querySelectorAll(
        selector + ' a',
      ) as NodeListOf<HTMLAnchorElement>;
      const url = window.location.href;
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      links[1]!.dispatchEvent(click);
      await fixture.whenStable();
      expect(click.defaultPrevented).toBe(true);
      expect(window.location.href).toBe(url);
      expect(links[1]!.getAttribute('aria-current')).toBe('page');
      expect(links[0]!.hasAttribute('aria-current')).toBe(false);
    });
  }
});
