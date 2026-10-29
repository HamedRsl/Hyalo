import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  afterRenderEffect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HyPalette } from '@hyalo/angular';
import { DocsSettings } from '../settings';
import { DocsPage } from '../shared/page';
import { DocsTokenEditor } from '../shared/token-editor';
import {
  COMPONENT_TOKEN_PAGES,
  COMPONENT_TOKENS,
  SYSTEM_TOKENS,
  type ComponentTokenGroup,
} from '../tokens';

@Component({
  selector: 'docs-theming',
  imports: [DocsPage, DocsTokenEditor, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theming.html',
  styleUrl: './theming.css',
})
export default class ThemingPage {
  private readonly document = inject(DOCUMENT);
  private readonly settings = inject(DocsSettings);
  private readonly palette = inject(HyPalette);

  protected readonly systemTokens = SYSTEM_TOKENS;
  protected readonly componentTokens = COMPONENT_TOKENS;
  protected readonly pages = COMPONENT_TOKEN_PAGES;
  protected readonly componentGroups = Object.keys(COMPONENT_TOKENS) as ComponentTokenGroup[];
  /** Computed values of the system tokens. Empty on the server. */
  protected readonly values = signal<Record<string, string>>({});

  protected readonly overrideCode = `/* The whole app */
:root {
  --hy-primary: light-dark(#0b7a75, #4fd1c5);
  --hy-radius-l: 1.25rem;
}

/* One section: denser controls and square buttons */
.admin {
  --hy-control-md: 2.25rem;
  --hy-button-radius: var(--hy-radius-s);
}`;

  constructor() {
    // Re-read the values whenever the theme or palette changes.
    afterRenderEffect(() => {
      this.settings.theme();
      this.palette.current();
      const style = getComputedStyle(this.document.documentElement);
      const values: Record<string, string> = {};
      for (const group of SYSTEM_TOKENS) {
        for (const name of group.tokens) values[name] = style.getPropertyValue(name).trim();
      }
      this.values.set(values);
    });
  }
}
