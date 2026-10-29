import { TestBed } from '@angular/core/testing';
import { provideHyalo } from '@hyalo/angular';
import { HyPalette } from './palette';

const root = document.documentElement;
const linkFor = (name: string) =>
  document.head.querySelector<HTMLLinkElement>(`link[data-hy-palette="${name}"]`);

describe('HyPalette', () => {
  afterEach(() => {
    root.removeAttribute('data-hy-palette');
    document.head.querySelectorAll('link[data-hy-palette]').forEach((link) => link.remove());
  });

  it('applies a palette only after its stylesheet has loaded', async () => {
    const palette = TestBed.inject(HyPalette);
    const done = palette.use('ocean');

    expect(palette.selected()).toBe('ocean');
    expect(palette.current()).toBeNull();
    expect(root.hasAttribute('data-hy-palette')).toBe(false);
    expect(linkFor('ocean')?.getAttribute('href')).toBe('palette-ocean.css');

    linkFor('ocean')!.dispatchEvent(new Event('load'));
    await done;
    expect(root.getAttribute('data-hy-palette')).toBe('ocean');
    expect(palette.current()).toBe('ocean');
  });

  it('lets the last request win when loads overlap', async () => {
    const palette = TestBed.inject(HyPalette);
    const first = palette.use('ocean');
    const second = palette.use('rose');

    linkFor('ocean')!.dispatchEvent(new Event('load'));
    await first;
    expect(root.hasAttribute('data-hy-palette')).toBe(false);

    linkFor('rose')!.dispatchEvent(new Event('load'));
    await second;
    expect(root.getAttribute('data-hy-palette')).toBe('rose');
  });

  it('keeps the current palette when a stylesheet fails', async () => {
    const palette = TestBed.inject(HyPalette);
    const done = palette.use('ember');
    linkFor('ember')!.dispatchEvent(new Event('error'));

    await expect(done).rejects.toThrow(/ember/);
    expect(palette.selected()).toBeNull();
    expect(linkFor('ember')).toBeNull();
    expect(root.hasAttribute('data-hy-palette')).toBe(false);
  });

  it('goes back to the built-in palette for null', async () => {
    root.setAttribute('data-hy-palette', 'aurora');
    const palette = TestBed.inject(HyPalette);
    expect(palette.current()).toBe('aurora');

    await palette.use(null);
    expect(root.hasAttribute('data-hy-palette')).toBe(false);
    expect(palette.current()).toBeNull();
  });

  it('preloads once and reuses the stylesheet', async () => {
    const palette = TestBed.inject(HyPalette);
    palette.preload('graphite');
    palette.preload('graphite');
    expect(document.head.querySelectorAll('link[data-hy-palette="graphite"]').length).toBe(1);
    expect(root.hasAttribute('data-hy-palette')).toBe(false);

    linkFor('graphite')!.dispatchEvent(new Event('load'));
    await palette.use('graphite');
    expect(root.getAttribute('data-hy-palette')).toBe('graphite');
  });

  it('uses the configured stylesheet URL', () => {
    TestBed.configureTestingModule({
      providers: [provideHyalo({ paletteHref: (name) => `/themes/${name}.css` })],
    });
    void TestBed.inject(HyPalette).use('orchid');
    expect(linkFor('orchid')?.getAttribute('href')).toBe('/themes/orchid.css');
  });

  it('rejects names that are not safe in a selector or URL', async () => {
    const palette = TestBed.inject(HyPalette);
    await expect(palette.use('"] body {')).rejects.toThrow(/not a valid palette name/);
    expect(() => palette.preload('../x')).toThrow();
  });
});
