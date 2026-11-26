import { EXAMPLES } from './examples/tooltip-popover';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HySwitch } from '@hyalo/angular/choice';
import { HyIcon } from '@hyalo/angular/icon';
import { HyPopover, HyTooltip } from '@hyalo/angular/popover';
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
  protected readonly examples = EXAMPLES;

  protected readonly open = signal(false);
  protected readonly isPublic = signal(false);
  protected readonly detailsState = signal('Details closed');
  protected readonly detailsPolicy = { outsidePointer: false, focusOut: false };

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
    {
      name: 'popoverMaterial',
      type: 'HyMaterial',
      default: 'frosted',
      description: 'Use solid for a readable panel above high-contrast images.',
    },
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
