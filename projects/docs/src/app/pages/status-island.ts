import { DocsTokens } from '../shared/tokens-table';
import { EXAMPLE } from './examples/status-island';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyStatusIsland } from '@hyalo/angular/status-island';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-status-island-page',
  imports: [DocsTokens, DocsPage, DocsExample, DocsImport, DocsApiTable, HyStatusIsland, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-island.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HyStatusQueue.get()',
      type: '(id: string) => HyIslandStatus | undefined',
      default: 'method',
      description: 'Finds a queued status by stable ID.',
    },
    {
      name: 'HyStatusQueue.has()',
      type: '(id: string) => boolean',
      default: 'method',
      description: 'Reports whether the queue contains an ID.',
    },
    {
      name: 'HyStatusQueue.update()',
      type: "(id: string, patch: Partial<Omit<HyIslandStatus, 'id'>>) => boolean",
      default: 'method',
      description: 'Patches an existing status without changing its ID or stable order.',
    },
    {
      name: 'HyStatusIsland.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents new user and programmatic actions.',
    },
    {
      name: 'HyStatusIsland.detailTemplate',
      type: 'TemplateRef<{\n    $implicit: HyIslandStatus;\n  }> | undefined',
      default: 'undefined',
      description: 'Custom details for the highest-priority active status.',
    },
    {
      name: 'HyStatusIsland.dismiss()',
      type: '() => void',
      default: 'method',
      description:
        'Requests guarded dismissal; the promise reports acceptance rather than animation completion.',
    },
    {
      name: 'HyStatusIsland.activate()',
      type: '() => void',
      default: 'method',
      description: 'Emits an enabled action without owning application work.',
    },
    {
      name: 'HyStatusIsland.items',
      type: 'readonly HyIslandStatus[]',
      default: 'undefined',
      description: 'Immutable items with stable IDs; templates render each item.',
    },
    {
      name: 'HyStatusIsland.expanded',
      type: 'boolean',
      default: 'false',
      description: 'Controlled details-popover state.',
    },
    {
      name: 'HyStatusIsland.label',
      type: 'string',
      default: "'Activity'",
      description: 'Accessible name for the control or region.',
    },
    {
      name: 'HyStatusIsland.emptyLabel',
      type: 'string',
      default: "'No active tasks'",
      description: 'Localized text for empty.',
    },
    {
      name: 'HyStatusIsland.closeLabel',
      type: 'string',
      default: "'Close details'",
      description: 'Localized text for close.',
    },
    {
      name: 'HyStatusIsland.dismissLabel',
      type: 'string',
      default: "'Dismiss'",
      description: 'Localized text for dismiss.',
    },
    {
      name: 'HyStatusIsland.live',
      type: "'off' | 'polite' | 'assertive'",
      default: "'polite'",
      description: 'Controls live announcements; avoid announcing initial history.',
    },
    {
      name: 'HyStatusIsland.dismissed',
      type: 'string',
      default: 'output',
      description: 'Requests dismissal; controlled data remains owned by the host.',
    },
    {
      name: 'HyStatusIsland.action',
      type: '{ readonly status: HyIslandStatus; readonly action: HyAction }',
      default: 'output',
      description: 'Requests the associated host action.',
    },
    {
      name: 'HyIslandStatus',
      type: 'readonly object',
      default: 'data',
      description: 'id, label, detail, priority, tone, progress, action and dismissible.',
    },
    {
      name: 'HyStatusQueue',
      type: 'service',
      default: 'providedIn root',
      description:
        'Readonly items signal and set(status), remove(id), clear() methods. Scope a provider for independent queues.',
    },
  ];
  protected readonly statuses = signal([
    {
      id: 'upload',
      label: 'Uploading document',
      detail: 'Keep this page open until the upload completes.',
      priority: 1,
      progress: 45,
    },
  ]);
  protected dismiss(id: string): void {
    this.statuses.update((items) => items.filter((item) => item.id !== id));
  }
  protected urgent(): void {
    this.statuses.update((items) => [
      ...items.filter((item) => item.id !== 'order'),
      {
        id: 'order',
        label: 'Order arriving',
        detail: 'Your order is nearby.',
        priority: 10,
        progress: 90,
      },
    ]);
  }
}
