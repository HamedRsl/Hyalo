import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyIcon } from './icon';
import type { HyIconNode } from './icons';
import { provideHyaloIcons } from './registry';

@Component({
  imports: [HyIcon],
  template: `
    <hy-icon name="check" />
    <hy-icon name="star" label="Favourite" />
    <hy-icon name="chevron-end" />
  `,
})
class Host {}

@Component({
  imports: [HyIcon],
  providers: [provideHyaloIcons({ local: [['path', { d: 'M2 2' }]] })],
  template: `<hy-icon name="local" /><hy-icon name="check" />`,
})
class LocalHost {}

@Component({
  imports: [HyIcon],
  template: `<hy-icon [icon]="icon()" />`,
})
class SwapHost {
  readonly icon = signal<HyIconNode>([['circle', { cx: 1, cy: 1, r: 1, opacity: 0.5 }]]);
}

describe('HyIcon', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHyaloIcons({ star: [['path', { d: 'M1 1', onclick: 'alert(1)' }]] })],
    }),
  );

  it('renders built-in and registered icons', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [check, star] = fixture.nativeElement.querySelectorAll('hy-icon');
    expect(check.querySelector('path').getAttribute('d')).toBe('M20 6 9 17l-5-5');
    expect(star.querySelector('path').getAttribute('d')).toBe('M1 1');
  });

  it('drops attributes outside the geometry whitelist', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const path = fixture.nativeElement.querySelectorAll('hy-icon')[1].querySelector('path');
    expect(path.hasAttribute('onclick')).toBe(false);
  });

  it('finds icons provided by a component', async () => {
    const fixture = TestBed.createComponent(LocalHost);
    await fixture.whenStable();
    const [local, check] = fixture.nativeElement.querySelectorAll('hy-icon');
    expect(local.querySelector('path').getAttribute('d')).toBe('M2 2');
    expect(check.querySelector('path').getAttribute('d')).toBe('M20 6 9 17l-5-5');
  });

  it('removes attributes the next icon does not use', async () => {
    const fixture = TestBed.createComponent(SwapHost);
    await fixture.whenStable();
    const el = () => fixture.nativeElement.querySelector('circle');
    expect(el().getAttribute('opacity')).toBe('0.5');
    fixture.componentInstance.icon.set([['circle', { cx: 1, cy: 1, r: 1 }]]);
    await fixture.whenStable();
    expect(el().hasAttribute('opacity')).toBe(false);
  });

  it('is decorative unless labelled', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [check, star, chevron] = fixture.nativeElement.querySelectorAll('hy-icon');
    expect(check.getAttribute('aria-hidden')).toBe('true');
    expect(star.getAttribute('role')).toBe('img');
    expect(star.getAttribute('aria-label')).toBe('Favourite');
    expect(chevron.dataset.mirrorRtl).toBe('true');
  });
});
