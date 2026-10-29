import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyButton, HyIcon } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-button-page',
  imports: [DocsPage, DocsExample, DocsApiTable, HyButton, HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page
      heading="Button"
      lead="Buttons and link buttons. The element stays a native button or anchor."
    >
      <h2>Variants</h2>
      <docs-example [code]="variantsCode">
        <button hyButton>Solid</button>
        <button hyButton variant="glass">Glass</button>
        <button hyButton variant="soft">Soft</button>
        <button hyButton variant="ghost">Ghost</button>
      </docs-example>

      <h2>Tones and sizes</h2>
      <docs-example [code]="tonesCode">
        <button hyButton size="sm" tone="neutral">Neutral</button>
        <button hyButton tone="success">Success</button>
        <button hyButton size="lg" tone="danger" variant="soft">Delete</button>
      </docs-example>

      <h2>Icons, loading and links</h2>
      <docs-example [code]="stateCode">
        <button hyButton variant="glass" iconOnly aria-label="Close"><hy-icon name="x" /></button>
        <button hyButton [loading]="saving()" (click)="save()">Save changes</button>
        <a hyButton variant="ghost" href="#api">Read the API <hy-icon name="arrow-end" /></a>
        <a hyButton variant="ghost" href="#api" disabled>Disabled link</a>
      </docs-example>

      <h2>Accessibility</h2>
      <ul>
        <li>Icon-only buttons need an <code>aria-label</code>.</li>
        <li>
          While loading, the button keeps focus and its width, sets <code>aria-busy</code> and
          ignores clicks.
        </li>
        <li>
          Links have no native disabled state, so a disabled link gets
          <code>aria-disabled</code> and leaves the tab order.
        </li>
        <li>Every size keeps a target of at least 32 by 32 pixels.</li>
      </ul>

      <h2 id="api">API</h2>
      <p><code>button[hyButton]</code>, <code>a[hyButton]</code></p>
      <docs-api-table [rows]="rows" />
    </docs-page>
  `,
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
