import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { HyDigits } from '@hyalo/angular/core';
import { HySceneLightDirective, HyFlip, HyStagger } from '@hyalo/angular/motion';
import { HyNumberTicker } from '@hyalo/angular/number-ticker';
import { HyBorderBeam } from '@hyalo/angular/border-beam';
import { HyCopy } from '@hyalo/angular/copy';
import { HyProgressiveBlur } from '@hyalo/angular/progressive-blur';
import { HyCodeBlock } from '@hyalo/angular/code-block';
import { HyCard } from '@hyalo/angular/card';
import { HyButton } from '@hyalo/angular/button';
import {
  HyFilterBar,
  encodeFilters,
  type HyFilterClause,
  type HyFilterField,
} from '@hyalo/angular/filter';
import { DocsPage } from '../shared/page';
type Clause = HyFilterClause<{ query: { readonly operator: 'contains'; readonly value: string } }>;
@Component({
  selector: 'docs-extensions',
  imports: [
    DocsPage,
    HyDigits,
    HySceneLightDirective,
    HyFlip,
    HyStagger,
    HyNumberTicker,
    HyBorderBeam,
    HyCopy,
    HyProgressiveBlur,
    HyCodeBlock,
    HyCard,
    HyButton,
    HyFilterBar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<docs-page
    eyebrow="Architecture and public APIs"
    [heading]="heading()"
    lead="Progressive enhancement with static fallbacks, localized data and optional rendering engines."
  >
    @switch (feature()) {
      @case ('number-ticker') {
        <h2>Localized numbers</h2>
        <hy-number-ticker [value]="value()" animate /><button
          hyButton
          (click)="value.set(value() + 125)"
        >
          Add 125
        </button>
        <p>
          Static accessible text always exposes the final value. Animation pauses offscreen and
          respects reduced motion.
        </p>
        <hy-code-block [code]="tickerCode" language="html" />
      }
      @case ('border-beam') {
        <hy-card class="beam" material="tinted"
          ><hy-border-beam animated />
          <h2>A restrained highlight</h2>
          <p>
            The decorative beam is opt-in. The border remains usable with animation disabled.
          </p></hy-card
        ><hy-code-block [code]="beamCode" language="html" />
      }
      @case ('copy') {
        <hy-copy text="npm install @hyalo/angular" label="Copy installation command"
          ><code>npm install @hyalo/angular</code></hy-copy
        >
        <p>The status announcement distinguishes a successful copy from a clipboard failure.</p>
        <hy-code-block [code]="copyCode" language="html" />
      }
      @case ('filter') {
        <hy-filter-bar [fields]="fields" [(clauses)]="clauses" />
        <p>
          Host-owned state, AND semantics, stable IDs and field/operator/value correlation. Empty
          editors remove their clause.
        </p>
        <hy-code-block [code]="encoded()" language="json" /><hy-code-block
          [code]="filterCode"
          language="typescript"
        />
      }
      @case ('progressive-blur') {
        <div class="scroll-demo">
          <hy-progressive-blur />
          @for (line of lines; track line) {
            <p>{{ line }}</p>
          }
          <hy-progressive-blur edge="bottom" />
        </div>
        <p>Only the high tier adds blur. Scrolling stays native at every tier.</p>
        <hy-code-block [code]="blurCode" language="html" />
      }
      @default {
        <h2>Shared scene light and layout</h2>
        <div class="cards" hyStagger>
          <hy-card hySceneLight material="tinted">One shared pointer source</hy-card
          ><hy-card hySceneLight material="tinted">Host-local style writes</hy-card>
        </div>
        <div hyFlip #flip="hyFlip" class="layout" [class.expanded]="expanded()">
          <button hyButton (click)="flip.run(toggle)">Change layout</button>
          <p>Focus belongs to the caller. The host animation cancels safely on interruption.</p>
        </div>
        <label
          >Canonical digit input
          <input hyDigits inputmode="numeric" placeholder="Persian or Arabic digits"
        /></label>
        <p>
          Digit normalization preserves leading zeros and composition; parsing numeric values is a
          separate concern.
        </p>
        <hy-code-block [code]="motionCode" language="typescript" />
      }
    }
  </docs-page>`,
  styles: `
    hy-number-ticker {
      display: inline-block;
      font-size: 2.5rem;
      margin-inline-end: 1rem;
    }
    .beam {
      position: relative;
      padding: 2rem;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: 1rem;
    }
    .cards hy-card {
      padding: 2rem;
    }
    .layout {
      inline-size: 70%;
      padding: 1.5rem;
      margin-block: 1rem;
      border: 1px solid var(--hy-line);
      border-radius: var(--hy-radius-m);
    }
    .expanded {
      inline-size: 100%;
    }
    .scroll-demo {
      position: relative;
      overflow: auto;
      max-block-size: 18rem;
      padding: 2rem;
    }
    hy-code-block {
      display: block;
      margin-block: 1.5rem;
    }
    input {
      display: block;
      min-block-size: 44px;
      background: var(--hy-surface-1);
      color: var(--hy-ink);
      border: 1px solid var(--hy-line);
      border-radius: var(--hy-radius-s);
      padding: 0.5rem;
    }
  `,
})
export default class ExtensionsPage {
  readonly feature = input('motion-layout');
  protected readonly heading = computed(
    () =>
      (
        ({
          'number-ticker': 'Number ticker',
          'border-beam': 'Border beam',
          copy: 'Copy and snippet',
          filter: 'Faceted filter bar',
          'progressive-blur': 'Progressive blur',
        }) as Record<string, string>
      )[this.feature()] ?? 'Shared motion and input contracts',
  );
  protected readonly value = signal(1200);
  protected readonly expanded = signal(false);
  protected readonly toggle = (): void => this.expanded.update((value) => !value);
  protected readonly clauses = signal<readonly Clause[]>([]);
  protected readonly fields: readonly HyFilterField<Clause>[] = [
    {
      field: 'query',
      label: 'Search',
      create: (id, value) => ({ id, field: 'query', operator: 'contains', value }),
    },
  ];
  protected readonly encoded = computed(() => encodeFilters(this.clauses()));
  protected readonly lines = Array.from(
    { length: 12 },
    (_, i) => `Native scrolling content, row ${i + 1}`,
  );
  protected readonly tickerCode = '<hy-number-ticker [value]="revenue()" locale="fa" animate />';
  protected readonly beamCode =
    '<hy-card style="position:relative"><hy-border-beam animated />Featured plan</hy-card>';
  protected readonly copyCode = '<hy-copy [text]="address()" label="Copy address" />';
  protected readonly blurCode = '<hy-progressive-blur edge="top" />';
  protected readonly filterCode =
    "import { HyFilterBar, type HyFilterClause, encodeFilters, decodeFilters } from '@hyalo/angular/filter';";
  protected readonly motionCode =
    "import { HyFlip, HyStagger, HySceneLightDirective } from '@hyalo/angular/motion';\nimport { HyDigits } from '@hyalo/angular/core';";
}
