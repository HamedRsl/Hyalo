import { EXAMPLES } from './examples/button';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HyIcon } from '@hyalo/angular/icon';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-button-page',
  imports: [DocsPage, DocsTokens, DocsExample, DocsApiTable, HyButton, HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.html',
})
export default class ButtonPage {
  protected readonly examples = EXAMPLES;

  protected readonly saving = signal(false);

  protected save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1600);
  }

  protected readonly rows: ApiRow[] = [
    {
      name: 'variant',
      type: "'solid' | 'glass' | 'soft' | 'ghost'",
      default: "'solid'",
      description: 'Visual style.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: 'config',
      description: 'Height and padding.',
    },
    { name: 'tone', type: 'HyTone', default: 'config', description: 'Colour role.' },
    {
      name: 'iconOnly',
      type: 'boolean',
      default: 'false',
      description: 'Square button for a single icon.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Spinner, aria-busy, clicks blocked.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Native disabled on buttons, aria-disabled on links.',
    },
  ];
}
