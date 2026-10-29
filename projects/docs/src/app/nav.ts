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
      { path: '/motion', label: 'Motion and fidelity' },
    ],
  },
  {
    title: 'Components',
    items: [
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
