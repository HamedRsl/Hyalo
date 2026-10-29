import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  HY_CARD,
  HY_TEXT_FIELD,
  HyButton,
  HyCheckbox,
  HySegmented,
  HySwitch,
} from '@hyalo/angular';

type Density = 'compact' | 'regular' | 'comfortable';
type ButtonShape = 'pill' | 'rounded' | 'square';

const DEFAULTS = {
  primary: '#3a4cd0',
  secondary: '#6d3fc4',
  radius: 1,
  blur: 25,
  density: 'regular' as Density,
  shape: 'pill' as ButtonShape,
};
const LIGHT_BG = '#eef1f4';
const DARK_BG = '#0a0c11';

/** Control heights per density, as [sm, md, lg]. */
const DENSITY: Record<Exclude<Density, 'regular'>, [string, string, string]> = {
  compact: ['1.75rem', '2.25rem', '2.75rem'],
  comfortable: ['2.25rem', '2.75rem', '3.25rem'],
};

type Rgb = [number, number, number];

function rgb(hex: string): Rgb {
  const channel = (i: number): number => parseInt(hex.slice(i, i + 2), 16);
  return [channel(1), channel(3), channel(5)];
}

function toHex(channels: Rgb): string {
  return '#' + channels.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

/** Mixes two colours in sRGB. Close enough for picking hover and dark tones. */
function mix(a: string, b: string, amount: number): string {
  const [x, y] = [rgb(a), rgb(b)];
  const step = (i: 0 | 1 | 2): number => x[i] + (y[i] - x[i]) * amount;
  return toHex([step(0), step(1), step(2)]);
}

function luminance(hex: string): number {
  const linear = (v: number): number => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = rgb(hex);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** The picked colour for light mode, and a lighter one for dark. */
function tones(light: string): { light: string; dark: string } {
  return { light, dark: mix(light, '#ffffff', 0.35) };
}

/** Text contrast of each tone against its page background. */
function ratios({ light, dark }: { light: string; dark: string }): {
  light: string;
  dark: string;
  ok: boolean;
} {
  const l = contrast(light, LIGHT_BG);
  const d = contrast(dark, DARK_BG);
  return { light: l.toFixed(1), dark: d.toFixed(1), ok: l >= 4.5 && d >= 4.5 };
}

/** White or near-black, whichever reads better on the given fill. */
function inkFor(fill: string): string {
  return contrast(fill, '#ffffff') >= contrast(fill, DARK_BG) ? '#ffffff' : DARK_BG;
}

/**
 * A live token editor. The controls change tokens on the preview only, and
 * the CSS underneath lists exactly the tokens that differ from the defaults.
 */
@Component({
  selector: 'docs-token-editor',
  imports: [HY_CARD, HY_TEXT_FIELD, HyButton, HyCheckbox, HySegmented, HySwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './token-editor.html',
  styleUrl: './token-editor.css',
})
export class DocsTokenEditor {
  protected readonly primary = signal(DEFAULTS.primary);
  /** Secondary is optional, like in the tokens: off means it follows primary. */
  protected readonly useSecondary = signal(false);
  protected readonly secondary = signal(DEFAULTS.secondary);
  protected readonly radius = signal(DEFAULTS.radius);
  protected readonly blur = signal(DEFAULTS.blur);
  protected readonly density = signal<Density>(DEFAULTS.density);
  protected readonly shape = signal<ButtonShape>(DEFAULTS.shape);
  protected readonly copied = signal(false);

  protected readonly densities = [
    { value: 'compact' as Density, label: 'Compact' },
    { value: 'regular' as Density, label: 'Regular' },
    { value: 'comfortable' as Density, label: 'Roomy' },
  ];
  protected readonly shapes = [
    { value: 'pill' as ButtonShape, label: 'Pill' },
    { value: 'rounded' as ButtonShape, label: 'Rounded' },
    { value: 'square' as ButtonShape, label: 'Square' },
  ];

  private readonly primaryTones = computed(() => tones(this.primary()));
  private readonly secondaryTones = computed(() => tones(this.secondary()));
  protected readonly primaryRatios = computed(() => ratios(this.primaryTones()));
  protected readonly secondaryRatios = computed(() => ratios(this.secondaryTones()));

  /** Only the tokens that differ from the defaults. */
  private readonly overrides = computed(() => {
    const out: [string, string][] = [];
    if (this.primaryChanged()) {
      const { light: l, dark: d } = this.primaryTones();
      const [lr, lg, lb] = rgb(l);
      const [dr, dg, db] = rgb(d);
      out.push(
        ['--hy-primary', `light-dark(${l}, ${d})`],
        ['--hy-primary-hover', `light-dark(${mix(l, '#000000', 0.14)}, ${mix(d, '#ffffff', 0.2)})`],
        ['--hy-primary-ink', `light-dark(${inkFor(l)}, ${inkFor(d)})`],
        [
          '--hy-primary-wash',
          `light-dark(rgb(${lr} ${lg} ${lb} / 0.12), rgb(${dr} ${dg} ${db} / 0.16))`,
        ],
      );
    }
    if (this.useSecondary()) {
      const { light: l, dark: d } = this.secondaryTones();
      out.push(
        ['--hy-secondary', `light-dark(${l}, ${d})`],
        ['--hy-secondary-ink', `light-dark(${inkFor(l)}, ${inkFor(d)})`],
      );
    }
    const r = this.radius();
    if (r !== DEFAULTS.radius) {
      out.push(
        ['--hy-radius-s', `${Math.round(8 * r)}px`],
        ['--hy-radius-m', `${Math.round(14 * r)}px`],
        ['--hy-radius-l', `${Math.round(22 * r)}px`],
      );
    }
    if (this.blur() !== DEFAULTS.blur) out.push(['--hy-glass-blur', `${this.blur()}px`]);
    const density = this.density();
    if (density !== 'regular') {
      const [sm, md, lg] = DENSITY[density];
      out.push(['--hy-control-sm', sm], ['--hy-control-md', md], ['--hy-control-lg', lg]);
    }
    const shape = this.shape();
    if (shape !== 'pill') {
      out.push([
        '--hy-button-radius',
        shape === 'rounded' ? 'var(--hy-radius-m)' : 'var(--hy-radius-s)',
      ]);
    }
    return out;
  });

  protected readonly css = computed(() => {
    const lines = this.overrides();
    if (!lines.length) return '/* Change a control to see the CSS. */';
    return `:root {\n${lines.map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`;
  });

  /**
   * The preview also needs the focus ring, which tokens.css builds from the
   * primary colour on :root and so would keep the old one inside the preview.
   */
  protected readonly previewStyle = computed(() => {
    const lines = this.overrides().map(([k, v]) => `${k}: ${v};`);
    if (this.primaryChanged()) {
      lines.push('--hy-focus-ring: 0 0 0 2px var(--hy-bg), 0 0 0 4px var(--hy-primary);');
    }
    return lines.join(' ');
  });

  private copyTimer?: ReturnType<typeof setTimeout>;

  private primaryChanged(): boolean {
    return this.primary().toLowerCase() !== DEFAULTS.primary;
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected reset(): void {
    this.primary.set(DEFAULTS.primary);
    this.useSecondary.set(false);
    this.secondary.set(DEFAULTS.secondary);
    this.radius.set(DEFAULTS.radius);
    this.blur.set(DEFAULTS.blur);
    this.density.set(DEFAULTS.density);
    this.shape.set(DEFAULTS.shape);
  }

  protected copy(): void {
    navigator.clipboard
      ?.writeText(this.css())
      .then(() => {
        this.copied.set(true);
        clearTimeout(this.copyTimer);
        this.copyTimer = setTimeout(() => this.copied.set(false), 2000);
      })
      .catch(() => undefined);
  }
}
