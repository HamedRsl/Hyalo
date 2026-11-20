import { Component, signal } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { MockPlatformLocation } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HyMotion, HyFidelity } from '@hyalo/angular';
import { HyChapterNav } from './chapter-nav';
import { expectNoAxeViolations } from '../src/testing/axe';

@Component({
  imports: [HyChapterNav],
  template: ` <hy-chapter-nav
      [chapters]="chapters"
      [scrollRoot]="usePane() ? pane : null"
      [offset]="16"
    />
    <div #pane>
      <section id="chapter-material"><h2>Material</h2></section>
      <section id="chapter-care"><h2>Care</h2></section>
    </div>`,
})
class Host {
  readonly usePane = signal(true);
  readonly chapters = [
    { id: 'chapter-material', label: 'Material' },
    { id: 'chapter-care', label: 'Care' },
    { id: 'missing', label: 'Missing' },
  ];
}

describe('HyChapterNav', () => {
  beforeEach(() => {
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
    });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => {
    TestBed.inject(HyMotion).setReduced(null);
    vi.restoreAllMocks();
  });

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const nav = fixture.debugElement.query(By.directive(HyChapterNav))
      .componentInstance as HyChapterNav;
    const pane = fixture.nativeElement.querySelector('hy-chapter-nav + div') as HTMLElement;
    Object.defineProperties(pane, {
      clientHeight: { value: 300 },
      scrollHeight: { value: 1000 },
      clientTop: { value: 2 },
    });
    vi.spyOn(pane, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect);
    const scroll = vi.fn();
    pane.scrollTo = scroll;
    const sections = Array.from(pane.querySelectorAll('section'));
    sections.forEach((section, i) =>
      vi
        .spyOn(section, 'getBoundingClientRect')
        .mockImplementation(() => ({ top: 120 + i * 400 - pane.scrollTop }) as DOMRect),
    );
    pane.dispatchEvent(new Event('scroll'));
    await vi.waitFor(() => expect(nav.active()).toBe('chapter-material'));
    return {
      fixture,
      nav,
      pane,
      scroll,
      sections,
      location: TestBed.inject(PlatformLocation),
      links: fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
    };
  }

  it('emits exact click/active payloads and a single completion across duplicate scrollend events', async () => {
    const { fixture, nav, pane, links } = await setup();
    const clicked = vi.fn(),
      active = vi.fn(),
      scrolled = vi.fn();
    nav.chapterClick.subscribe(clicked);
    nav.activeChange.subscribe(active);
    nav.scrolled.subscribe(scrolled);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    links[1]!.dispatchEvent(event);
    await fixture.whenStable();
    expect(clicked).toHaveBeenCalledWith({ id: 'chapter-care', event });
    expect(active).toHaveBeenCalledWith('chapter-care');
    expect(scrolled).not.toHaveBeenCalled();
    pane.scrollTop = 402;
    pane.dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => setTimeout(resolve, 30));
    pane.dispatchEvent(new Event('scrollend'));
    pane.dispatchEvent(new Event('scrollend'));
    expect(scrolled).toHaveBeenCalledExactlyOnceWith({ id: 'chapter-care', position: 402 });
  });
  it('preserves route and query in native fallback links', async () => {
    const { fixture, links } = await setup();
    expect(links[1]!.getAttribute('href')).toBe('/components/chapter-nav?lang=fa#chapter-care');
    await expectNoAxeViolations(fixture.nativeElement);
  });
  it('owns normal click scrolling and URL updates without triggering native routing', async () => {
    const { fixture, nav, links, scroll, location } = await setup();
    location.replaceState({ navigationId: 7 }, '', '/components/chapter-nav?lang=fa');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    links[1]!.dispatchEvent(click);
    await fixture.whenStable();
    expect(click.defaultPrevented).toBe(true);
    expect(nav.active()).toBe('chapter-care');
    expect(scroll).toHaveBeenCalledWith({ top: 402, behavior: 'smooth' });
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(location.hash).toBe('#chapter-care');
    expect(location.getState()).toEqual({ navigationId: 7 });
  });
  it('keeps explicit selection during intermediate scroll events and at the final position', async () => {
    const { fixture, nav, pane } = await setup();
    nav.goTo('chapter-care');
    pane.scrollTop = 100;
    pane.dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => setTimeout(resolve, 30));
    await fixture.whenStable();
    expect(nav.active()).toBe('chapter-care');
    pane.scrollTop = 402;
    pane.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(nav.active()).toBe('chapter-care');
    pane.dispatchEvent(new Event('scrollend'));
    pane.scrollTop = 0;
    pane.dispatchEvent(new Event('scroll'));
    await vi.waitFor(() => expect(nav.active()).toBe('chapter-material'));
  });
  it('resumes section tracking when a user interrupts navigation', async () => {
    const { nav, pane } = await setup();
    nav.goTo('chapter-care');
    pane.scrollTop = 0;
    pane.dispatchEvent(new WheelEvent('wheel'));
    pane.dispatchEvent(new Event('scroll'));
    await vi.waitFor(() => expect(nav.active()).toBe('chapter-material'));
  });
  it('scrolls history selections instantly without stealing focus or adding entries', async () => {
    const { fixture, nav, scroll, location } = await setup();
    location.pushState(null, '', '/components/chapter-nav?lang=fa#chapter-care');
    const push = vi.spyOn(location, 'pushState');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await fixture.whenStable();
    expect(nav.active()).toBe('chapter-care');
    expect(scroll).toHaveBeenLastCalledWith({ top: 402, behavior: 'instant' });
    expect(push).not.toHaveBeenCalled();
  });
  it('focuses its section and restores the original non-focusable markup on blur', async () => {
    const { nav, sections } = await setup();
    nav.goTo('chapter-care');
    expect(document.activeElement).toBe(sections[1]);
    expect(sections[1]!.getAttribute('tabindex')).toBe('-1');
    sections[1]!.blur();
    expect(sections[1]!.hasAttribute('tabindex')).toBe(false);
  });
  it('leaves modified clicks and missing targets alone', async () => {
    const { nav, links, scroll, location } = await setup();
    links[1]!.addEventListener('click', (event) => event.preventDefault());
    links[1]!.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }),
    );
    expect(scroll).not.toHaveBeenCalled();
    expect(location.hash).toBe('');
    expect(nav.goTo('missing')).toBe(false);
    expect(nav.active()).toBe('chapter-material');
    expect(scroll).not.toHaveBeenCalled();
  });
  it('scrolls the page when no reading pane is supplied', async () => {
    const { fixture, nav, scroll } = await setup();
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(2000);
    fixture.componentInstance.usePane.set(false);
    await fixture.whenStable();
    nav.goTo('chapter-care');
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 504, behavior: 'smooth' });
    expect(scroll).not.toHaveBeenCalled();
  });
  it('keeps functional smooth scrolling available on low fidelity', async () => {
    const { nav, scroll } = await setup();
    TestBed.inject(HyFidelity).setTier('low');
    nav.goTo('chapter-care');
    expect(scroll).toHaveBeenLastCalledWith({ top: 402, behavior: 'smooth' });
  });
  it('supports optional sticky links with a configurable top inset', async () => {
    const fixture = TestBed.createComponent(HyChapterNav);
    fixture.componentRef.setInput('chapters', []);
    fixture.componentRef.setInput('sticky', true);
    fixture.componentRef.setInput('stickyTop', '4rem');
    await fixture.whenStable();
    expect(fixture.nativeElement.dataset['sticky']).toBe('true');
    expect(fixture.nativeElement.style.getPropertyValue('--hy-chapter-sticky-top')).toBe('4rem');
    fixture.componentRef.setInput('sticky', false);
    await fixture.whenStable();
    expect(fixture.nativeElement.dataset['sticky']).toBe('false');
  });
  it('renders a horizontal scrollable navigation row without the vertical progress thread', async () => {
    const f = TestBed.createComponent(HyChapterNav);
    f.componentRef.setInput('chapters', [{ id: 'one', label: 'One' }]);
    f.componentRef.setInput('orientation', 'horizontal');
    await f.whenStable();
    expect(getComputedStyle(f.nativeElement.querySelector('nav')).display).toBe('flex');
    expect(getComputedStyle(f.nativeElement.querySelector('ol')).display).toBe('flex');
    expect(getComputedStyle(f.nativeElement.querySelector('.thread')).display).toBe('none');
  });
  it('uses instant scrolling for reduced motion', async () => {
    const { nav, scroll } = await setup();
    TestBed.inject(HyMotion).setReduced(true);
    nav.goTo('chapter-care');
    expect(scroll).toHaveBeenLastCalledWith({ top: 402, behavior: 'instant' });
  });
});
