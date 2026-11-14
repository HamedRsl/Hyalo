import { Component } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { MockPlatformLocation } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { HyChapterNav } from './chapter-nav';
import { expectNoAxeViolations } from '../src/testing/axe';

@Component({
  imports: [HyChapterNav],
  template: ` <hy-chapter-nav
      [chapters]="[
        { id: 'chapter-material', label: 'Material' },
        { id: 'chapter-care', label: 'Care' },
        { id: 'missing', label: 'Missing' },
      ]"
    />
    <section id="chapter-material"><h2>Material</h2></section>
    <section id="chapter-care"><h2>Care</h2></section>`,
})
class Host {}
describe('HyChapterNav', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PlatformLocation,
          useFactory: () =>
            new MockPlatformLocation({
              startUrl: 'https://example.com/components/chapter-nav?lang=fa',
            }),
        },
      ],
    }),
  );
  it('keeps fragment links on the current route and preserves its query string', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const links = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    expect(links[1]!.getAttribute('href')).toBe('/components/chapter-nav?lang=fa#chapter-care');
    expect(new URL(links[1]!.href).pathname).toBe('/components/chapter-nav');
    await expectNoAxeViolations(fixture.nativeElement);
  });
  it('selects a valid target immediately without hijacking modified clicks', async () => {
    TestBed.inject(PlatformLocation).pushState(
      null,
      '',
      '/components/chapter-nav?lang=fa#chapter-material',
    );
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const links = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    for (const link of links) link.addEventListener('click', (event) => event.preventDefault());
    links[1]!.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }),
    );
    await fixture.whenStable();
    expect(links[0]!.getAttribute('aria-current')).toBe('location');
    links[1]!.click();
    await fixture.whenStable();
    expect(links[1]!.getAttribute('aria-current')).toBe('location');
    links[2]!.click();
    await fixture.whenStable();
    expect(links[1]!.getAttribute('aria-current')).toBe('location');
  });
  it('updates selection for fragment history navigation', async () => {
    const location = TestBed.inject(PlatformLocation);
    location.pushState(null, '', '/components/chapter-nav?lang=fa#chapter-care');
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const links = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    expect(links[1]!.getAttribute('aria-current')).toBe('location');
    location.pushState(null, '', '/components/chapter-nav?lang=fa#chapter-material');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await fixture.whenStable();
    expect(links[0]!.getAttribute('aria-current')).toBe('location');
  });
});
