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
  accent: '#3a4cd0',
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
  protected readonly accent = signal(DEFAULTS.accent);
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

  /** The accent for each mode: the picked colour, and a lighter one for dark. */
  private readonly accents = computed(() => {
    const light = this.accent();
    return { light, dark: mix(light, '#ffffff', 0.35) };
  });

  protected readonly ratios = computed(() => {
    const { light, dark } = this.accents();
    const l = contrast(light, LIGHT_BG);
    const d = contrast(dark, DARK_BG);
    return { light: l.toFixed(1), dark: d.toFixed(1), ok: l >= 4.5 && d >= 4.5 };
  });

  /** Only the tokens that differ from the defaults. */
  private readonly overrides = computed(() => {
    const out: [string, string][] = [];
    if (this.accent().toLowerCase() !== DEFAULTS.accent) {
      const { light: l, dark: d } = this.accents();
      const [lr, lg, lb] = rgb(l);
      const [dr, dg, db] = rgb(d);
      out.push(
        ['--hy-accent', `light-dark(${l}, ${d})`],
        ['--hy-accent-hover', `light-dark(${mix(l, '#000000', 0.14)}, ${mix(d, '#ffffff', 0.2)})`],
        ['--hy-accent-ink', `light-dark(${inkFor(l)}, ${inkFor(d)})`],
        [
          '--hy-accent-wash',
          `light-dark(rgb(${lr} ${lg} ${lb} / 0.12), rgb(${dr} ${dg} ${db} / 0.16))`,
        ],
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
   * accent on :root and so would keep the old colour inside the preview.
   */
  protected readonly previewStyle = computed(() => {
    const lines = this.overrides().map(([k, v]) => `${k}: ${v};`);
    if (this.accent().toLowerCase() !== DEFAULTS.accent) {
      lines.push('--hy-focus-ring: 0 0 0 2px var(--hy-bg), 0 0 0 4px var(--hy-accent);');
    }
    return lines.join(' ');
  });

  private copyTimer?: ReturnType<typeof setTimeout>;

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected reset(): void {
    this.accent.set(DEFAULTS.accent);
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
