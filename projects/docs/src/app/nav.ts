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
      { path: '/blocks', label: 'Building blocks' },
      { path: '/motion-layout', label: 'Shared motion and inputs' },
      { path: '/dashboard', label: 'Dashboard demo' },
    ],
  },
  {
    title: 'Components',
    items: [
      { path: '/components', label: 'All components' },
      { path: '/components/number-ticker', label: 'Number ticker' },
      { path: '/components/border-beam', label: 'Border beam' },
      { path: '/components/copy', label: 'Copy and snippet' },
      { path: '/components/filter', label: 'Faceted filter bar' },
      { path: '/components/progressive-blur', label: 'Progressive blur' },
      { path: '/components/sidebar', label: 'Sidebar' },
      { path: '/components/breadcrumb', label: 'Breadcrumb' },
      { path: '/components/menu', label: 'Dropdown menu' },
      { path: '/components/command', label: 'Command palette' },
      { path: '/components/navigation-menu', label: 'Navigation and mega menu' },
      { path: '/components/pagination', label: 'Pagination' },
      { path: '/components/table', label: 'Table' },
      { path: '/components/stat', label: 'Stat and KPI' },
      { path: '/components/chart', label: 'Charts' },
      { path: '/components/sparkline', label: 'Sparkline' },
      { path: '/components/progress', label: 'Progress and spinner' },
      { path: '/components/alert', label: 'Alert and inline message' },
      { path: '/components/empty-state', label: 'Empty state' },
      { path: '/components/list', label: 'List and list item' },
      { path: '/components/bento', label: 'Bento grid' },
      { path: '/components/scroll-area', label: 'Scroll area' },
      { path: '/components/hover-card', label: 'Hover card' },
      { path: '/components/description-list', label: 'Description list' },
      { path: '/components/kbd', label: 'Keyboard key' },
      { path: '/components/code-block', label: 'Code block' },
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
