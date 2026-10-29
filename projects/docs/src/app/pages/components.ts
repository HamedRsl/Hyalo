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
  template: `
    <docs-page
      heading="Components"
      lead="Every component in the kit, each with a small preview. Pick one for its demos, accessibility notes and API."
    >
      <ul class="gallery">
        @for (item of items; track item.path) {
          <li>
            <hy-card class="tile" material="solid" padding="none">
              <!-- The preview is a picture of the component; the card's link is the way in. -->
              <div class="tile__stage hy-mesh" inert aria-hidden="true">
                @switch (item.path) {
                  @case ('/components/accordion') {
                    <hy-accordion class="preview-accordion">
                      <hy-accordion-item heading="Delivery" [expanded]="true">
                        Three to five working days.
                      </hy-accordion-item>
                      <hy-accordion-item heading="Returns">Within 30 days.</hy-accordion-item>
                    </hy-accordion>
                  }
                  @case ('/components/button') {
                    <div class="row">
                      <button hyButton size="sm">Solid</button>
                      <button hyButton size="sm" variant="glass">Glass</button>
                      <button hyButton size="sm" variant="soft">Soft</button>
                    </div>
                  }
                  @case ('/components/card') {
                    <hy-card class="preview-card" padding="sm">
                      <p class="preview-card__title">Calibre 7</p>
                      <p class="preview-card__body">Hand-wound, 42 mm.</p>
                    </hy-card>
                  }
                  @case ('/components/checkbox-radio-switch') {
                    <div class="stack">
                      <hy-checkbox [checked]="true">Gift wrap</hy-checkbox>
                      <hy-switch [checked]="true">Notifications</hy-switch>
                    </div>
                  }
                  @case ('/components/dialog') {
                    <div class="scrim">
                      <div
                        class="mock-dialog hy-glass"
                        data-material="frosted"
                        data-thickness="thick"
                      >
                        <p class="hy-dialog__title">Delete draft?</p>
                        <div class="hy-dialog__actions">
                          <button hyButton size="sm" variant="ghost" tone="neutral">Cancel</button>
                          <button hyButton size="sm" tone="danger">Delete</button>
                        </div>
                      </div>
                    </div>
                  }
                  @case ('/components/drawer') {
                    <div class="scrim scrim--edge">
                      <div
                        class="mock-sheet hy-glass"
                        data-material="frosted"
                        data-thickness="thick"
                      >
                        <span class="mock-sheet__grabber"></span>
                        <span class="line"></span>
                        <span class="line line--short"></span>
                      </div>
                    </div>
                  }
                  @case ('/components/navbar') {
                    <hy-navbar class="preview-navbar" label="Preview" position="static">
                      <a hyNavbarBrand href="/">Atelier</a>
                      <a href="/">Watches</a>
                    </hy-navbar>
                  }
                  @case ('/components/select') {
                    <div class="stack stack--tight">
                      <hy-select [options]="straps" [value]="'leather'" />
                      <div class="mock-panel hy-select__panel hy-glass" data-material="frosted">
                        <div class="hy-select__option" aria-selected="true">
                          <span>Leather</span><hy-icon class="hy-select__check" name="check" />
                        </div>
                        <div class="hy-select__option"><span>Steel</span></div>
                      </div>
                    </div>
                  }
                  @case ('/components/tabs') {
                    <hy-tabs class="preview-tabs" label="Preview">
                      <hy-tab value="overview" label="Overview">Slim and hand-wound.</hy-tab>
                      <hy-tab value="specs" label="Specs">42 mm steel.</hy-tab>
                    </hy-tabs>
                  }
                  @case ('/components/text-field') {
                    <hy-field class="preview-field" label="Email">
                      <input hyInput type="email" value="ada@example.com" />
                    </hy-field>
                  }
                  @case ('/components/toast') {
                    <div
                      class="mock-toast hy-toast hy-glass"
                      data-material="frosted"
                      data-tone="success"
                    >
                      <hy-icon class="hy-toast__icon" name="success" />
                      <div class="hy-toast__text">
                        <p class="hy-toast__title">Saved</p>
                        <p class="hy-toast__message">Address updated</p>
                      </div>
                      <span class="hy-toast__close"><hy-icon name="x" /></span>
                    </div>
                  }
                  @case ('/components/tooltip-popover') {
                    <div class="anchor">
                      <span class="mock-tooltip hy-tooltip">Copy link</span>
                      <button hyButton size="sm" variant="glass" iconOnly>
                        <hy-icon name="settings" />
                      </button>
                    </div>
                  }
                }
              </div>
              <div class="tile__text">
                <h2 hyCardHeader class="tile__title">
                  <a hyCardLink [routerLink]="item.path">{{ item.label }}</a>
                </h2>
                <p class="tile__summary">{{ item.summary }}</p>
              </div>
            </hy-card>
          </li>
        }
      </ul>
    </docs-page>
  `,
  styles: `
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
      gap: var(--hy-space-4);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .gallery > li {
      display: flex;
      /* Wide previews must not stretch a card past its column. */
      min-inline-size: 0;
    }
    .tile {
      flex: 1;
      min-inline-size: 0;
      gap: 0;
      transition:
        translate var(--hy-dur-settle) var(--hy-ease-out),
        box-shadow var(--hy-dur-settle) var(--hy-ease-out);
    }
    @media (hover: hover) {
      .tile:hover {
        translate: 0 -2px;
        box-shadow: var(--hy-glass-edge), var(--hy-glass-shadow-thick);
      }
    }
    .tile:active {
      scale: 0.99;
    }
    .tile__stage {
      display: grid;
      place-items: center;
      block-size: 10rem;
      padding: var(--hy-space-4);
      overflow: hidden;
      border-block-end: 1px solid var(--hy-line);
    }
    /* A picture, not controls: clicks fall through to the card's link. */
    .tile__stage,
    .tile__stage * {
      pointer-events: none !important;
    }
    .tile__text {
      display: grid;
      gap: var(--hy-space-1);
      padding: var(--hy-space-4) var(--hy-space-5) var(--hy-space-5);
    }
    .tile__title {
      margin: 0;
      font-size: var(--hy-step-1);
      letter-spacing: -0.01em;
    }
    .tile__title a {
      color: var(--hy-ink);
      text-decoration: none;
    }
    .tile__summary {
      margin: 0;
      color: var(--hy-ink-2);
      font-size: var(--hy-step--1);
      letter-spacing: var(--hy-tracking-small);
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--hy-space-2);
    }
    .stack {
      display: grid;
      gap: var(--hy-space-3);
      inline-size: 100%;
      max-inline-size: 13rem;
    }
    .stack--tight {
      gap: var(--hy-space-1);
    }
    .line {
      display: block;
      block-size: 0.5rem;
      border-radius: var(--hy-radius-pill);
      background: color-mix(in srgb, var(--hy-ink) 14%, transparent);
    }
    .line--short {
      inline-size: 60%;
    }

    /* Full-size components, drawn smaller so they fit the stage. */
    .preview-accordion,
    .preview-tabs,
    .preview-field {
      inline-size: 100%;
      max-inline-size: 17rem;
      zoom: 0.78;
    }
    .preview-navbar {
      inline-size: 100%;
      --_inset: 0px;
    }
    .preview-card {
      inline-size: 100%;
      max-inline-size: 11rem;
    }
    .preview-card__title {
      margin: 0;
      font-weight: 620;
    }
    .preview-card__body {
      margin: 0;
      font-size: var(--hy-step--1);
    }

    .scrim {
      position: relative;
      display: grid;
      place-items: center;
      inline-size: calc(100% + 2 * var(--hy-space-4));
      block-size: calc(100% + 2 * var(--hy-space-4));
      margin: calc(-1 * var(--hy-space-4));
      background: var(--hy-scrim);
    }
    .scrim--edge {
      place-items: end stretch;
    }
    .mock-dialog {
      display: grid;
      gap: var(--hy-space-3);
      padding: var(--hy-space-4);
      border-radius: var(--hy-radius-m);
    }
    .mock-dialog .hy-dialog__title {
      font-size: var(--hy-step-0);
    }
    .mock-dialog .hy-dialog__actions {
      margin: 0;
    }
    .mock-sheet {
      display: grid;
      gap: var(--hy-space-2);
      padding: var(--hy-space-5) var(--hy-space-5) var(--hy-space-6);
      border-radius: var(--hy-radius-l) var(--hy-radius-l) 0 0;
      border-block-end: 0;
    }
    .mock-sheet__grabber {
      justify-self: center;
      inline-size: 2.25rem;
      block-size: 0.3125rem;
      margin-block-end: var(--hy-space-2);
      border-radius: var(--hy-radius-pill);
      background: color-mix(in srgb, var(--hy-ink) 28%, transparent);
    }
    .mock-panel {
      flex: none;
    }
    .mock-toast {
      inline-size: 100%;
      max-inline-size: 17rem;
      animation: none;
    }
    .anchor {
      display: grid;
      justify-items: center;
      gap: var(--hy-space-2);
    }
  `,
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
