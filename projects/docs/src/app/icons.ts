import type { HyIconDef, HyIconNode } from '@hyalo/angular/icon';

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
  calendar: [
    ['rect', { x: 3, y: 5, width: 18, height: 16, rx: 2 }],
    ['path', { d: 'M16 3v4M8 3v4M3 11h18' }],
  ],
  'message-circle': [
    [
      'path',
      {
        d: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z',
      },
    ],
  ],

  'arrow-end': {
    node: [
      ['path', { d: 'M5 12h14' }],
      ['path', { d: 'm12 5 7 7-7 7' }],
    ],
    mirrorRtl: true,
  },
};
