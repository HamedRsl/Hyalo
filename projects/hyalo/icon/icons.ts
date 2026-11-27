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
  readonly viewBox?: string;
  /** Mirror the icon in RTL. Set it for icons that point somewhere, like arrows. */
  readonly mirrorRtl?: boolean;
}

/*
 * The few icons the kit uses itself. Paths are from Lucide (ISC license,
 * Copyright (c) Lucide Icons and Contributors), https://lucide.dev.
 */
export const HY_BUILTIN_ICONS: Readonly<Record<string, HyIconDef>> = {
  smile: { node: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M8 14a4 4 0 0 0 8 0M9 10h.01M15 10h.01' }]] },
  paperclip: { node: [['path', { d: 'M8 14l7-7a2 2 0 0 1 3 3l-8 8a4 4 0 0 1-6-6l9-9' }]] },
  mic: { node: [['path', { d: 'M9 6a3 3 0 1 1 6 0v6a3 3 0 1 1-6 0zM5 11v1a7 7 0 0 0 14 0v-1m-7 8v3' }]] },
  send: { node: [['path', { d: 'm3 4 18 8-18 8 4-8-4-8Zm4 8h14' }]], mirrorRtl: true },
  reply: { node: [['path', { d: 'm9 6-6 6 6 6m-6-6h11a5 5 0 0 1 5 5v2' }]], mirrorRtl: true },
  stop: { node: [['rect', { x: 6, y: 6, width: 12, height: 12, rx: 2 }]] },
  copy: { node: [['path', { d: 'M8 8h12v12H8zM4 16V4h12' }]] },
  calendar: { node: [['path', { d: 'M3 6h18v15H3zM3 10h18M8 3v5m8-5v5' }]] },
  'chevron-up': { node: [['path', { d: 'm6 15 6-6 6 6' }]] },
  'chevron-start': { node: [['path', { d: 'm15 18-6-6 6-6' }]], mirrorRtl: true },
  'page-start': { node: [['path', { d: 'M5 5v14m12-13-6 6 6 6' }]], mirrorRtl: true },
  'page-end': { node: [['path', { d: 'M19 5v14M7 6l6 6-6 6' }]], mirrorRtl: true },
  reset: { node: [['path', { d: 'M3 12a9 9 0 1 1 3 6.7M3 6v6h6' }]] },
  download: { node: [['path', { d: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5' }]] },
  columns: { node: [['path', { d: 'M3 4h18v16H3zM9 4v16m6-16v16' }]] },
  grip: { node: [['path', { d: 'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01' }]] },
  move: { node: [['path', { d: 'M12 2v20M2 12h20M9 5l3-3 3 3m-6 14 3 3 3-3M5 9l-3 3 3 3m14-6 3 3-3 3' }]] },
  resize: { node: [['path', { d: 'M20 10v10H10m10-10L10 20m1-16H4v7' }]], mirrorRtl: true },
  eye: { node: [['path', { d: 'M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z' }], ['circle', { cx: 12, cy: 12, r: 2.5 }]] },
  'eye-off': { node: [['path', { d: 'M3 3l18 18M7 7c1.5-.7 3.1-1 5-1 6.4 0 10 6 10 6s-.8 1.3-2.4 2.7M4 9.5C2.7 11 2 12 2 12s3.6 6 10 6c1.6 0 3.2-.4 4.5-1' }]] },
  save: { node: [['path', { d: 'M4 4h13l3 3v13H4zM8 4v6h8V4m-8 16v-6h8v6' }]] },
  compress: { node: [['path', { d: 'M5 3v6h6m-6 0 6-6m8 18v-6h-6m6 0-6 6' }]] },
  bold: { node: [['path', { d: 'M6 12h8a4 4 0 0 1 0 8H6V4h7a4 4 0 1 1 0 8' }]] },
  italic: { node: [['path', { d: 'M10 4h9M5 20h9m1-16L9 20' }]] },
  underline: { node: [['path', { d: 'M6 4v7a6 6 0 0 0 12 0V4M4 21h16' }]] },
  strike: { node: [['path', { d: 'M17 7c-1-2-3-3-5-3-3 0-5 2-5 4m-3 4h16m-3 2c1 1 1 2 1 3 0 2-2 3-6 3-3 0-5-1-6-3' }]] },
  heading: { node: [['path', { d: 'M4 5v14m16-14v14M4 12h16' }]] },
  code: { node: [['path', { d: 'm8 6-6 6 6 6m8-12 6 6-6 6' }]] },
  'text-clear': { node: [['path', { d: 'M4 5h16M12 5v14m-4 0h8m1-3 4 4m0-4-4 4' }]] },
  paragraph: { node: [['path', { d: 'M19 4h-8a5 5 0 0 0 0 10h2m0-10v16m4-16v16' }]] },
  'list-bullets': { node: [['path', { d: 'M4 6h.01M4 12h.01M4 18h.01M9 6h11M9 12h11M9 18h11' }]] },
  'list-numbers': { node: [['path', { d: 'M4 5l1-1v4m-2 5c0-2 4-2 4 0 0 1-3 3-4 4h4M10 6h10m-10 6h10m-10 6h10' }]] },
  quote: { node: [['path', { d: 'M4 11h6v6H4v-6c0-3 2-5 5-5m5 5h6v6h-6v-6c0-3 2-5 5-5' }]] },
  undo: { node: [['path', { d: 'M8 5l-5 5 5 5m-5-5h13a4 4 0 0 1 0 8' }]], mirrorRtl: true },
  redo: { node: [['path', { d: 'm16 5 5 5-5 5m5-5H8a4 4 0 0 0 0 8' }]], mirrorRtl: true },
  link: { node: [['path', { d: 'm10 13 4-4m-6 6-1 1a3 3 0 0 1-4-4l4-4a3 3 0 0 1 4 0m2 8a3 3 0 0 0 4 0l4-4a3 3 0 0 0-4-4l-1 1' }]] },
  image: { node: [['path', { d: 'M3 4h18v16H3zM3 17l6-6 5 5 3-3 4 4' }], ['circle', { cx: 16, cy: 8, r: 1 }]] },
  plus: { node: [['path', { d: 'M12 5v14M5 12h14' }]] },
  'arrow-end': { node: [['path', { d: 'M4 12h16m-6-6 6 6-6 6' }]], mirrorRtl: true },
  home: { node: [['path', { d: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z' }]] },
  grid: {
    node: [
      ['rect', { x: 3, y: 3, width: 7, height: 7, rx: 1 }],
      ['rect', { x: 14, y: 3, width: 7, height: 7, rx: 1 }],
      ['rect', { x: 3, y: 14, width: 7, height: 7, rx: 1 }],
      ['rect', { x: 14, y: 14, width: 7, height: 7, rx: 1 }],
    ],
  },
  user: {
    node: [
      ['circle', { cx: 12, cy: 8, r: 4 }],
      ['path', { d: 'M4 21v-2a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v2' }],
    ],
  },
  search: {
    node: [
      ['circle', { cx: 11, cy: 11, r: 8 }],
      ['path', { d: 'm21 21-4.35-4.35' }],
    ],
  },
  settings: {
    node: [
      ['path', { d: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z' }],
      ['path', { d: 'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z' }],
    ],
  },
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
