import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HY_ACCORDION } from '@hyalo/angular/accordion';
import { HyButton } from '@hyalo/angular/button';
import { HY_CARD } from '@hyalo/angular/card';
import { HyCheckbox, HySwitch } from '@hyalo/angular/choice';
import { HY_TEXT_FIELD } from '@hyalo/angular/field';
import { HyIcon } from '@hyalo/angular/icon';
import { HY_NAVBAR } from '@hyalo/angular/navbar';
import { HySelect } from '@hyalo/angular/select';
import { HY_TABS } from '@hyalo/angular/tabs';
import { NAV } from '../nav';
import { DocsPage } from '../shared/page';
import { HyBadge, HyChip } from '@hyalo/angular/badge';
import { HY_AVATAR } from '@hyalo/angular/avatar';
import { HySkeleton } from '@hyalo/angular/skeleton';
import { HyMesh } from '@hyalo/angular/mesh';
import { HyHotspot } from '@hyalo/angular/hotspot';
import { HY_TIMELINE } from '@hyalo/angular/timeline';
import { HyDivider } from '@hyalo/angular/divider';
import { HyAspectRatio } from '@hyalo/angular/aspect-ratio';
import { HyButtonGroup } from '@hyalo/angular/button-group';
import { HyLink } from '@hyalo/angular/link';

/** What each card says under its preview, keyed by route. */
const SUMMARIES: Record<string, string> = {
  '/components/carousel':
    'Swipe with native touch inertia, drag with a mouse, or use the keyboard.',
  '/components/lightbox':
    'A thumbnail grid and a modal image viewer with captions and keyboard navigation.',
  '/components/image-compare': 'A before-and-after frame with an accessible native range control.',
  '/components/marquee': 'An uninterrupted logo strip with explicit pause controls.',
  '/components/split-text': 'A headline reveal that measures actual wrapped lines after hydration.',
  '/components/refraction': 'An image-backed glass surface with a shared WebGL rendering context.',
  '/components/hotspot': 'A real button anchored to a projected point in a scene.',
  '/components/mesh': 'An ambient backdrop that keeps content stationary.',
  '/components/timeline': 'A chronological story with dates, headings and a hairline thread.',
  '/components/stepper': 'A guided flow with completion gates and native navigation buttons.',
  '/components/badge': 'A small status label, with optional removal for filter chips.',
  '/components/avatar': 'People and teams, with initials when an image is unavailable.',
  '/components/skeleton': 'A placeholder that follows the kit motion and fidelity settings.',
  '/components/button-group': 'A named group of related native actions.',
  '/components/link': 'A native link with an animated underline.',
  '/components/divider': 'A quiet hairline between related content.',
  '/components/aspect-ratio': 'A responsive frame for images and other media.',
  '/components/chapter-nav': 'Native section links with a current-section thread.',
  '/components/scroll-to-top':
    'A return control that restores keyboard focus near the start of the page.',
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
    HyBadge,
    HyChip,
    HY_AVATAR,
    HySkeleton,
    HyMesh,
    HyHotspot,
    HY_TIMELINE,
    HyDivider,
    HyAspectRatio,
    HyButtonGroup,
    HyLink,
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
