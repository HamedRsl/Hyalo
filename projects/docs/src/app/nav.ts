/** One link in the docs sidebar. */
export interface NavItem {
  readonly path: string;
  readonly label: string;
}

/** A sidebar group. */
export interface NavGroup {
  readonly title: string;
  readonly items: readonly NavItem[];
}

export const NAV: readonly NavGroup[] = [
  {
    title: 'Start',
    items: [
      { path: '/', label: 'Introduction' },
      { path: '/foundations', label: 'Foundations' },
      { path: '/theming', label: 'Theming' },
      { path: '/motion', label: 'Motion and fidelity' },
    ],
  },
  {
    title: 'Components',
    items: [
      { path: '/components', label: 'All components' },
      { path: '/components/carousel', label: 'Carousel' },
      { path: '/components/lightbox', label: 'Lightbox and gallery' },
      { path: '/components/image-compare', label: 'Image compare' },
      { path: '/components/marquee', label: 'Marquee and logo wall' },
      { path: '/components/split-text', label: 'Split-text reveal' },
      { path: '/components/refraction', label: 'Refraction surface' },
      { path: '/components/hotspot', label: '3D hotspot' },
      { path: '/components/mesh', label: 'Mesh background' },
      { path: '/components/timeline', label: 'Timeline' },
      { path: '/components/stepper', label: 'Stepper' },
      { path: '/components/badge', label: 'Badge, tag and chip' },
      { path: '/components/avatar', label: 'Avatar and avatar group' },
      { path: '/components/skeleton', label: 'Skeleton' },
      { path: '/components/button-group', label: 'Button group' },
      { path: '/components/link', label: 'Link' },
      { path: '/components/divider', label: 'Divider' },
      { path: '/components/aspect-ratio', label: 'Aspect ratio' },
      { path: '/components/chapter-nav', label: 'Chapter navigation' },
      { path: '/components/scroll-to-top', label: 'Scroll to top' },
      { path: '/components/accordion', label: 'Accordion' },
      { path: '/components/button', label: 'Button' },
      { path: '/components/card', label: 'Card' },
      { path: '/components/checkbox-radio-switch', label: 'Checkbox, radio, switch' },
      { path: '/components/dialog', label: 'Dialog' },
      { path: '/components/drawer', label: 'Drawer' },
      { path: '/components/navbar', label: 'Navbar' },
      { path: '/components/select', label: 'Select' },
      { path: '/components/tabs', label: 'Tabs and segmented' },
      { path: '/components/text-field', label: 'Text field' },
      { path: '/components/toast', label: 'Toast' },
      { path: '/components/tooltip-popover', label: 'Tooltip and popover' },
    ],
  },
];
