import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyButton, HyIcon, HyPopover, HySwitch, HyTooltip } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-tooltip-popover-page',
  imports: [
    DocsPage,
    DocsTokens,
    DocsExample,
    DocsApiTable,
    HyButton,
    HyIcon,
    HyPopover,
    HySwitch,
    HyTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tooltip-popover.html',
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
