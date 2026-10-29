import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyButton, HyIcon, HyPopover, HySwitch, HyTooltip } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-tooltip-popover-page',
  imports: [DocsPage, DocsExample, DocsApiTable, HyButton, HyIcon, HyPopover, HySwitch, HyTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page
      heading="Tooltip and popover"
      lead="A tooltip labels a control. A popover holds content people interact with."
    >
      <h2>Tooltip</h2>
      <docs-example [code]="tooltipCode">
        <button hyButton variant="glass" iconOnly aria-label="Close" hyTooltip="Close">
          <hy-icon name="x" />
        </button>
        <button
          hyButton
          variant="glass"
          hyTooltip="Saves a copy to your drafts"
          tooltipPlacement="bottom"
        >
          Save copy
        </button>
        <button hyButton variant="ghost" hyTooltip="Shown on the end side" tooltipPlacement="end">
          End
        </button>
      </docs-example>

      <h2>Popover</h2>
      <docs-example [code]="popoverCode">
        <button
          hyButton
          variant="glass"
          [hyPopover]="share"
          popoverLabel="Share"
          [(popoverOpen)]="open"
        >
          Share
        </button>
        <ng-template #share>
          <div class="docs-stack share">
            <strong>Share this collection</strong>
            <hy-switch [(checked)]="isPublic">Anyone with the link</hy-switch>
            <button hyButton size="sm" (click)="open.set(false)">Done</button>
          </div>
        </ng-template>
        <span class="hy-muted">Open: {{ open() }}</span>
      </docs-example>

      <h2>Which one</h2>
      <p>
        Tooltips are for a few words that name or explain a control. They never hold links or
        buttons, and they do not show on touch. If the content is interactive, or longer than a
        sentence, use a popover.
      </p>

      <h2>Accessibility</h2>
      <ul>
        <li>
          Tooltip text is added to the trigger with <code>aria-describedby</code>, so screen readers
          hear it right away.
        </li>
        <li>
          Tooltips show on hover after a short delay and on keyboard focus at once. Escape hides
          them.
        </li>
        <li>
          A popover is a non-modal dialog. Focus moves to its first control and returns to the
          trigger on close.
        </li>
        <li>Escape, a click outside, or tabbing out closes the popover.</li>
      </ul>

      <h2>API</h2>
      <p><code>[hyTooltip]</code></p>
      <docs-api-table [rows]="tooltipRows" />
      <p><code>[hyPopover]</code>, exported as <code>hyPopover</code></p>
      <docs-api-table [rows]="popoverRows" />
    </docs-page>
  `,
  styles: `
    .share {
      min-inline-size: 16rem;
    }
  `,
})
export default class TooltipPopoverPage {
  protected readonly open = signal(false);
  protected readonly isPublic = signal(false);

  protected readonly tooltipCode = `<button hyButton iconOnly aria-label="Close" hyTooltip="Close">
  <hy-icon name="x" />
</button>
<button hyButton hyTooltip="Saves a copy to your drafts" tooltipPlacement="bottom">
  Save copy
</button>`;
  protected readonly popoverCode = `<button hyButton [hyPopover]="share" popoverLabel="Share" [(popoverOpen)]="open">
  Share
</button>
<ng-template #share>
  <hy-switch [(checked)]="isPublic">Anyone with the link</hy-switch>
  <button hyButton size="sm" (click)="open.set(false)">Done</button>
</ng-template>`;
  protected readonly tooltipRows: ApiRow[] = [
    { name: 'hyTooltip', type: 'string', description: 'The text. Empty means no tooltip.' },
    {
      name: 'tooltipPlacement',
      type: 'HyPlacement',
      default: "'top'",
      description: 'top, bottom, start or end. Flips when there is no room.',
    },
    {
      name: 'tooltipDelay',
      type: 'number',
      default: '400',
      description: 'Hover delay in milliseconds.',
    },
    { name: 'tooltipDisabled', type: 'boolean', default: 'false', description: 'Turns it off.' },
  ];
  protected readonly popoverRows: ApiRow[] = [
    { name: 'hyPopover', type: 'TemplateRef', description: 'Required. The content.' },
    { name: 'popoverLabel', type: 'string', description: 'Accessible name of the panel.' },
    {
      name: 'popoverPlacement',
      type: 'HyPlacement',
      default: "'bottom'",
      description: 'Where it opens. Flips when there is no room.',
    },
    {
      name: 'popoverOpen',
      type: 'model<boolean>',
      default: 'false',
      description: 'Open state. Two-way bindable.',
    },
  ];
}
