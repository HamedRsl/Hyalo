import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  HY_ACCORDION,
  HY_CARD,
  HY_NAVBAR,
  HY_TABS,
  HY_TEXT_FIELD,
  HyButton,
  HyCheckbox,
  HyIcon,
  HySelect,
  HySwitch,
} from '@hyalo/angular';
import { NAV } from '../nav';
import { DocsPage } from '../shared/page';

/** What each card says under its preview, keyed by route. */
const SUMMARIES: Record<string, string> = {
  '/components/accordion': 'Sections that open in place, one or several at a time.',
  '/components/button': 'Solid, glass, soft and ghost buttons and link buttons.',
  '/components/card': 'Glass surfaces with media, header, footer and a whole-card link.',
  '/components/checkbox-radio-switch': 'Native inputs with glass styling and form support.',
  '/components/dialog': 'Modal questions and forms with focus trap and restore.',
  '/components/drawer': 'Side drawers and bottom sheets you can drag closed.',
  '/components/navbar': 'A glass app bar that compacts on scroll and collapses on phones.',
  '/components/select': 'A single-choice select with a glass dropdown, or the native one.',
  '/components/tabs': 'Tabs and a segmented control with a sliding indicator.',
  '/components/text-field': 'Labelled inputs with hints, errors, prefixes and suffixes.',
  '/components/toast': 'Short messages that announce themselves and swipe away.',
  '/components/tooltip-popover': 'Hints on hover or focus, and panels anchored to a trigger.',
};

@Component({
  selector: 'docs-components-page',
  imports: [
    DocsPage,
    RouterLink,
    HY_ACCORDION,
    HY_CARD,
    HY_NAVBAR,
    HY_TABS,
    HY_TEXT_FIELD,
    HyButton,
    HyCheckbox,
    HyIcon,
    HySelect,
    HySwitch,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './components.html',
  styleUrl: './components.css',
})
export default class ComponentsPage {
  protected readonly items = (NAV.find((g) => g.title === 'Components')?.items ?? [])
    .filter((item) => item.path in SUMMARIES)
    .map((item) => ({ ...item, summary: SUMMARIES[item.path] }));

  protected readonly straps = [
    { value: 'leather', label: 'Leather' },
    { value: 'steel', label: 'Steel' },
  ];
}
