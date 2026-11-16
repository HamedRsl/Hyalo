import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { HyDigits, normalizeSearch } from '@hyalo/angular/core';
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
  templateUrl: './extensions.html',
  styleUrl: './extensions.css',
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
  protected readonly projects = [
    'Website refresh',
    'Design system',
    'Mobile launch',
    'Brand guidelines',
  ];
  protected readonly filteredProjects = computed(() => {
    const query = normalizeSearch(
      String(this.clauses().find((clause) => clause.field === 'query')?.value ?? ''),
    );
    const words = query.split(/\s+/).filter(Boolean);
    return this.projects.filter((name) =>
      words.every((word) => normalizeSearch(name).includes(word)),
    );
  });
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
