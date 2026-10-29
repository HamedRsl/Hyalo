import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyButton, HyIcon } from '@hyalo/angular';
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
  protected readonly saving = signal(false);

  protected save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1600);
  }

  protected readonly variantsCode = `<button hyButton>Solid</button>
<button hyButton variant="glass">Glass</button>
<button hyButton variant="soft">Soft</button>
<button hyButton variant="ghost">Ghost</button>`;
  protected readonly tonesCode = `<button hyButton size="sm" tone="neutral">Neutral</button>
<button hyButton tone="success">Success</button>
<button hyButton size="lg" tone="danger" variant="soft">Delete</button>`;
  protected readonly stateCode = `<button hyButton variant="glass" iconOnly aria-label="Close"><hy-icon name="x" /></button>
<button hyButton [loading]="saving()" (click)="save()">Save changes</button>
<a hyButton variant="ghost" routerLink="/docs">Read the API</a>`;
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
