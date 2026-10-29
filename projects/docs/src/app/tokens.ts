/** One customisable CSS custom property. */
export interface TokenRow {
  readonly name: string;
  readonly default: string;
  readonly description: string;
}

/**
 * Component tokens, grouped by component. None of them is set by Hyalo: each
 * component reads `var(--hy-button-radius, <default>)`, so a token only takes
 * effect where you set it, on `:root` or on any element above the component.
 * Keep this list in step with the component stylesheets.
 */
export const COMPONENT_TOKENS = {
  button: [
    { name: '--hy-button-radius', default: 'var(--hy-radius-pill)', description: 'Corner radius.' },
    { name: '--hy-button-font-weight', default: '560', description: 'Label weight.' },
  ],
  card: [
    { name: '--hy-card-radius', default: 'var(--hy-radius-l)', description: 'Corner radius.' },
    {
      name: '--hy-card-padding',
      default: 'var(--hy-space-6)',
      description: 'Inner spacing at the default padding size.',
    },
    {
      name: '--hy-card-media-ratio',
      default: '16 / 10',
      description: 'Aspect ratio of the media slot.',
    },
  ],
  field: [
    { name: '--hy-field-radius', default: 'var(--hy-radius-m)', description: 'Corner radius.' },
    {
      name: '--hy-field-bg',
      default: 'color-mix(in srgb, var(--hy-surface-1) 72%, transparent)',
      description: 'Box fill at rest. Focus always switches to a solid surface.',
    },
    {
      name: '--hy-field-border',
      default: 'var(--hy-line-strong)',
      description: 'Border colour at rest.',
    },
  ],
  select: [
    {
      name: '--hy-select-panel-radius',
      default: 'var(--hy-radius-m)',
      description: 'Corner radius of the option panel.',
    },
    {
      name: '--hy-select-option-radius',
      default: 'var(--hy-radius-s)',
      description: 'Corner radius of each option.',
    },
  ],
  tabs: [
    {
      name: '--hy-tabs-radius',
      default: 'var(--hy-radius-pill)',
      description: 'Radius of the track, the indicator and each tab.',
    },
    {
      name: '--hy-tabs-track',
      default: 'color-mix(in srgb, var(--hy-ink) 6%, transparent)',
      description: 'Fill behind the tabs.',
    },
    {
      name: '--hy-tabs-indicator',
      default: 'var(--hy-surface-1)',
      description: 'Fill of the sliding indicator.',
    },
  ],
  segmented: [
    {
      name: '--hy-segmented-radius',
      default: 'var(--hy-radius-pill)',
      description: 'Radius of the track, the indicator and each item.',
    },
    {
      name: '--hy-segmented-track',
      default: 'color-mix(in srgb, var(--hy-ink) 6%, transparent)',
      description: 'Fill behind the items.',
    },
    {
      name: '--hy-segmented-indicator',
      default: 'var(--hy-surface-1)',
      description: 'Fill of the sliding indicator.',
    },
  ],
  accordion: [
    {
      name: '--hy-accordion-divider',
      default: 'var(--hy-line)',
      description: 'Line between items.',
    },
    {
      name: '--hy-accordion-trigger-height',
      default: '3.5rem',
      description: 'Minimum height of each header.',
    },
  ],
  choice: [
    {
      name: '--hy-choice-checked',
      default: 'var(--hy-accent)',
      description: 'Fill of a checked checkbox, radio or switch.',
    },
    { name: '--hy-checkbox-radius', default: '6px', description: 'Corner radius of the box.' },
    {
      name: '--hy-switch-track',
      default: 'color-mix(in srgb, var(--hy-ink) 22%, transparent)',
      description: 'Track fill while the switch is off.',
    },
  ],
  navbar: [
    {
      name: '--hy-navbar-height',
      default: '3.5rem',
      description: 'Bar height. It shrinks by 0.5rem once the page scrolls.',
    },
    {
      name: '--hy-navbar-radius',
      default: 'var(--hy-radius-pill)',
      description: 'Corner radius of the floating bar.',
    },
    {
      name: '--hy-navbar-link-radius',
      default: 'var(--hy-radius-pill)',
      description: 'Corner radius of each link.',
    },
  ],
  dialog: [
    { name: '--hy-dialog-radius', default: 'var(--hy-radius-l)', description: 'Corner radius.' },
    { name: '--hy-dialog-padding', default: 'var(--hy-space-7)', description: 'Inner spacing.' },
  ],
  drawer: [
    {
      name: '--hy-drawer-radius',
      default: 'var(--hy-radius-l)',
      description: 'Radius of the corners away from the screen edge.',
    },
    { name: '--hy-drawer-padding', default: 'var(--hy-space-7)', description: 'Inner spacing.' },
  ],
  toast: [
    { name: '--hy-toast-radius', default: 'var(--hy-radius-m)', description: 'Corner radius.' },
    {
      name: '--hy-toast-width',
      default: '24rem',
      description: 'Width, capped to the viewport on small screens.',
    },
  ],
  tooltip: [
    { name: '--hy-tooltip-radius', default: 'var(--hy-radius-s)', description: 'Corner radius.' },
    {
      name: '--hy-tooltip-bg',
      default: 'color-mix(in srgb, var(--hy-ink) 92%, transparent)',
      description: 'Fill.',
    },
    { name: '--hy-tooltip-ink', default: 'var(--hy-bg)', description: 'Text colour.' },
  ],
  popover: [
    { name: '--hy-popover-radius', default: 'var(--hy-radius-m)', description: 'Corner radius.' },
    { name: '--hy-popover-padding', default: 'var(--hy-space-4)', description: 'Inner spacing.' },
  ],
} satisfies Record<string, readonly TokenRow[]>;

export type ComponentTokenGroup = keyof typeof COMPONENT_TOKENS;

/** Where each group is documented. Groups that share a page share a path. */
export const COMPONENT_TOKEN_PAGES: Record<ComponentTokenGroup, { title: string; path: string }> = {
  accordion: { title: 'Accordion', path: '/components/accordion' },
  button: { title: 'Button', path: '/components/button' },
  card: { title: 'Card', path: '/components/card' },
  choice: { title: 'Checkbox, radio and switch', path: '/components/checkbox-radio-switch' },
  dialog: { title: 'Dialog', path: '/components/dialog' },
  drawer: { title: 'Drawer', path: '/components/drawer' },
  field: { title: 'Field', path: '/components/text-field' },
  navbar: { title: 'Navbar', path: '/components/navbar' },
  popover: { title: 'Popover', path: '/components/tooltip-popover' },
  segmented: { title: 'Segmented', path: '/components/tabs' },
  select: { title: 'Select panel', path: '/components/select' },
  tabs: { title: 'Tabs', path: '/components/tabs' },
  toast: { title: 'Toast', path: '/components/toast' },
  tooltip: { title: 'Tooltip', path: '/components/tooltip-popover' },
};

/** A group of system tokens on the theming page. */
export interface SystemTokenGroup {
  readonly title: string;
  readonly description: string;
  /** Colour tokens get a live swatch. */
  readonly swatch?: boolean;
  readonly tokens: readonly string[];
}

/** The system tokens from tokens.css, in the order the theming page lists them. */
export const SYSTEM_TOKENS: readonly SystemTokenGroup[] = [
  {
    title: 'Surfaces and ink',
    description: 'Page background, four surface steps and three text strengths.',
    swatch: true,
    tokens: [
      '--hy-bg',
      '--hy-surface-1',
      '--hy-surface-2',
      '--hy-surface-3',
      '--hy-surface-4',
      '--hy-ink',
      '--hy-ink-2',
      '--hy-ink-3',
      '--hy-ink-2-glass',
      '--hy-ink-3-glass',
      '--hy-line',
      '--hy-line-strong',
      '--hy-scrim',
    ],
  },
  {
    title: 'Accent and status',
    description: 'Each colour role has an ink to put on top of it and a wash for tinted fills.',
    swatch: true,
    tokens: [
      '--hy-accent',
      '--hy-accent-hover',
      '--hy-accent-ink',
      '--hy-accent-wash',
      '--hy-success',
      '--hy-success-wash',
      '--hy-warning',
      '--hy-warning-wash',
      '--hy-danger',
      '--hy-danger-ink',
      '--hy-danger-wash',
    ],
  },
  {
    title: 'Glass',
    description: 'Fill, blur, edges and shadows of the glass material.',
    tokens: [
      '--hy-glass-tint',
      '--hy-glass-fill-top',
      '--hy-glass-fill-bottom',
      '--hy-glass-blur',
      '--hy-glass-saturate',
      '--hy-glass-border',
      '--hy-glass-edge',
      '--hy-glass-shadow',
      '--hy-glass-shadow-thin',
      '--hy-glass-shadow-thick',
      '--hy-glass-reflection',
      '--hy-glass-glow',
    ],
  },
  {
    title: 'Type',
    description: 'Font stacks, the fluid type scale and line heights.',
    tokens: [
      '--hy-font-display',
      '--hy-font-body',
      '--hy-font-mono',
      '--hy-font-fa',
      '--hy-step--1',
      '--hy-step-0',
      '--hy-step-1',
      '--hy-step-2',
      '--hy-step-3',
      '--hy-step-4',
      '--hy-step-5',
      '--hy-step-6',
      '--hy-leading-tight',
      '--hy-leading',
      '--hy-tracking-small',
    ],
  },
  {
    title: 'Shape, space and controls',
    description: 'Radii, the 4px spacing scale, layout widths and control heights.',
    tokens: [
      '--hy-radius-s',
      '--hy-radius-m',
      '--hy-radius-l',
      '--hy-radius-pill',
      '--hy-space-1',
      '--hy-space-2',
      '--hy-space-3',
      '--hy-space-4',
      '--hy-space-5',
      '--hy-space-6',
      '--hy-space-7',
      '--hy-space-8',
      '--hy-space-9',
      '--hy-space-10',
      '--hy-space-11',
      '--hy-space-12',
      '--hy-container',
      '--hy-gutter',
      '--hy-control-sm',
      '--hy-control-md',
      '--hy-control-lg',
      '--hy-focus-ring',
    ],
  },
  {
    title: 'Motion and layers',
    description: 'Durations and curves match the MOTION constants in TypeScript.',
    tokens: [
      '--hy-dur-quick',
      '--hy-dur-settle',
      '--hy-dur-scene',
      '--hy-dur-enter',
      '--hy-dur-exit',
      '--hy-ease-out',
      '--hy-ease-inout',
      '--hy-ease-spring',
      '--hy-z-sticky',
      '--hy-z-overlay',
      '--hy-z-toast',
      '--hy-z-tooltip',
    ],
  },
];
