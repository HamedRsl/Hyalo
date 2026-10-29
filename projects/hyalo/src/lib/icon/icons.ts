/**
 * Icon data in the same shape Lucide uses (`IconNode`), so any Lucide icon
 * can be registered as is:
 *
 * ```ts
 * import { ArrowRight } from 'lucide';
 * provideHyaloIcons({ 'arrow-right': ArrowRight })
 * ```
 *
 * Icons are data, not SVG strings, so nothing is ever parsed as HTML.
 */
export type HyIconNode = readonly (readonly [string, Readonly<Record<string, string | number>>])[];

/** An icon plus how it behaves in right-to-left layouts. */
export interface HyIconDef {
  readonly node: HyIconNode;
  /** Mirror the icon in RTL. Set it for icons that point somewhere, like arrows. */
  readonly mirrorRtl?: boolean;
}

/*
 * The few icons the kit uses itself. Paths are from Lucide (ISC license,
 * Copyright (c) Lucide Icons and Contributors), https://lucide.dev.
 */
export const HY_BUILTIN_ICONS: Readonly<Record<string, HyIconDef>> = {
  x: {
    node: [
      ['path', { d: 'M18 6 6 18' }],
      ['path', { d: 'm6 6 12 12' }],
    ],
  },
  check: { node: [['path', { d: 'M20 6 9 17l-5-5' }]] },
  minus: { node: [['path', { d: 'M5 12h14' }]] },
  'chevron-down': { node: [['path', { d: 'm6 9 6 6 6-6' }]] },
  'chevron-end': { node: [['path', { d: 'm9 18 6-6-6-6' }]], mirrorRtl: true },
  menu: {
    node: [
      ['path', { d: 'M4 5h16' }],
      ['path', { d: 'M4 12h16' }],
      ['path', { d: 'M4 19h16' }],
    ],
  },
  info: {
    node: [
      ['circle', { cx: 12, cy: 12, r: 10 }],
      ['path', { d: 'M12 16v-4' }],
      ['path', { d: 'M12 8h.01' }],
    ],
  },
  success: {
    node: [
      ['circle', { cx: 12, cy: 12, r: 10 }],
      ['path', { d: 'm16 9-5.5 5.5L8 12' }],
    ],
  },
  warning: {
    node: [
      ['path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' }],
      ['path', { d: 'M12 9v4' }],
      ['path', { d: 'M12 17h.01' }],
    ],
  },
  danger: {
    node: [
      ['circle', { cx: 12, cy: 12, r: 10 }],
      ['path', { d: 'M12 8v4' }],
      ['path', { d: 'M12 16h.01' }],
    ],
  },
  spinner: { node: [['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }]] },
};
