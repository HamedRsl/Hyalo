import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyIcon } from './icon';
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
