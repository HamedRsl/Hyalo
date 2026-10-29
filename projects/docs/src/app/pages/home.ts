import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HY_CARD, HyButton, HyIcon, HyReveal, HyTilt } from '@hyalo/angular';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-home',
  imports: [DocsPage, RouterLink, HyButton, HyIcon, HY_CARD, HyTilt, HyReveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page
      eyebrow="Hyalo 0.1"
      heading="Liquid glass for Angular"
      lead="A small set of calm, glassy components built on Angular Aria and the CDK. Signals all the way down, zoneless, server-render safe, and usable with a keyboard or a screen reader in both reading directions."
    >
      <div class="actions">
        <a hyButton size="lg" routerLink="/components"
          >Browse components <hy-icon name="arrow-end"
        /></a>
        <a hyButton size="lg" variant="glass" href="https://github.com/HamedRsl/Hyalo"
          >Source on GitHub</a
        >
      </div>

      <div class="docs-grid features">
        @for (f of features; track f.title; let i = $index) {
          <hy-card hyTilt hyReveal [revealDelay]="i * 60">
            <h3 hyCardHeader>{{ f.title }}</h3>
            <p>{{ f.body }}</p>
          </hy-card>
        }
      </div>

      <h2>Install</h2>
      <pre><code>npm install &#64;hyalo/angular &#64;angular/cdk &#64;angular/aria</code></pre>
      <p>Add the stylesheet to <code>angular.json</code>, before your own styles:</p>
      <pre><code>"styles": ["node_modules/&#64;hyalo/angular/styles/hyalo.css", "src/styles.css"]</code></pre>
      <p>Then import what you use. Every component is standalone:</p>
      <pre><code>{{ usage }}</code></pre>

      <h2>Optional setup</h2>
      <p>
        <code>provideHyalo()</code> sets defaults for the whole app or one part of it. Pass a GSAP
        loader if you want cursor effects to glide with GSAP. Without it they fall back to CSS
        transitions, and GSAP never enters your bundle.
      </p>
      <pre><code>{{ config }}</code></pre>

      <h2>What "done" means here</h2>
      <p>Each component on these pages ships with:</p>
      <ul>
        <li>full keyboard support and visible focus,</li>
        <li>right-to-left layout through logical CSS properties,</li>
        <li>light and dark themes, and a high contrast fallback,</li>
        <li>
          reduced motion and three fidelity tiers, with content never hidden behind JavaScript,
        </li>
        <li>an axe check in its unit tests.</li>
      </ul>
      <p>
        Use the settings button in the top bar to switch theme, direction, motion and fidelity on
        any page.
      </p>
    </docs-page>
  `,
  styles: `
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--hy-space-3);
    }
    .features {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
      margin-block-start: var(--hy-space-10);
    }
  `,
})
export default class HomePage {
  protected readonly features = [
    {
      title: 'Glass as a material',
      body: 'One material input on every surface: clear, frosted, tinted or solid. It turns solid by itself when blur would hurt.',
    },
    {
      title: 'Accessible behaviour',
      body: 'Tabs, select and accordion run on Angular Aria. Dialogs, drawers and popovers use the CDK focus tools.',
    },
    {
      title: 'Motion with manners',
      body: 'Shared timing tokens, GSAP only if you want it, and nothing that ignores reduced motion.',
    },
    {
      title: 'Ready for RTL',
      body: 'Logical properties everywhere, start and end placements, and icons that know when to mirror.',
    },
  ];

  protected readonly usage = `import { HyButton, HY_CARD } from '@hyalo/angular';

@Component({
  imports: [HyButton, HY_CARD],
  template: \`
    <hy-card>
      <h3 hyCardHeader>Calibre 7</h3>
      <p>Hand-wound, 42 mm.</p>
      <div hyCardFooter><button hyButton>Reserve</button></div>
    </hy-card>
  \`,
})
export class Product {}`;

  protected readonly config = `// app.config.ts
providers: [
  provideHyalo({
    material: 'frosted',
    gsap: () => import('gsap').then((m) => m.gsap),
  }),
]`;
}
