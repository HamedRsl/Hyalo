import type { HyIconDef, HyIconNode } from '@hyalo/angular';

// Lucide icons (ISC license), copied as data so the docs need no icon package.
const sliders: HyIconNode = [
  ['path', { d: 'M10 5H3' }],
  ['path', { d: 'M12 19H3' }],
  ['path', { d: 'M14 3v4' }],
  ['path', { d: 'M16 17v4' }],
  ['path', { d: 'M21 12h-9' }],
  ['path', { d: 'M21 19h-5' }],
  ['path', { d: 'M21 5h-7' }],
  ['path', { d: 'M8 10v4' }],
  ['path', { d: 'M8 12H3' }],
];

export const DOCS_ICONS: Readonly<Record<string, HyIconDef | HyIconNode>> = {
  settings: sliders,
  'arrow-end': {
    node: [
      ['path', { d: 'M5 12h14' }],
      ['path', { d: 'm12 5 7 7-7 7' }],
    ],
    mirrorRtl: true,
  },
};
