import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPONENT_TOKEN_PAGES, COMPONENT_TOKENS, type ComponentTokenGroup } from '../tokens';

/** Example values for first tokens that are not a radius. */
const EXAMPLES: Partial<Record<string, string>> = {
  '--hy-accordion-divider': 'var(--hy-line-strong)',
  '--hy-choice-checked': 'var(--hy-success)',
  '--hy-navbar-height': '4rem',
};

/**
 * The Tokens section of a component page: what can be customised, the
 * fallback each token uses, and how to scope an override.
 */
@Component({
  selector: 'docs-tokens',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tokens-table.html',
  styleUrl: './tokens-table.css',
})
export class DocsTokens {
  readonly groups = input.required<readonly ComponentTokenGroup[]>();

  protected readonly tokens = COMPONENT_TOKENS;
  protected readonly pages = COMPONENT_TOKEN_PAGES;

  /** A scoped override that uses the first token, to show the pattern. */
  protected readonly example = computed(() => {
    const group = this.groups()[0];
    const first = group && this.tokens[group][0];
    if (!first) return '';
    const value = EXAMPLES[first.name] ?? 'var(--hy-radius-s)';
    return `/* Every instance */
:root {
  ${first.name}: ${value};
}

/* Only inside one section */
.checkout {
  ${first.name}: ${value};
}`;
  });
}
