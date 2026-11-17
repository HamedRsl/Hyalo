import { EXAMPLE } from './examples/mobile-patterns';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  HyWalletBlock,
  HyTransferBlock,
  HyOrderTrackerBlock,
  type HyTransferRequest,
} from '@hyalo/angular/blocks';
import { HyButton } from '@hyalo/angular/button';
import type { HyProgressStep } from '@hyalo/angular/meter';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-mobile-patterns',
  imports: [
    DocsPage,
    DocsExample,
    DocsApiTable,
    HyWalletBlock,
    HyTransferBlock,
    HyOrderTrackerBlock,
    HyButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mobile-patterns.html',
  styleUrl: './mobile-demos.css',
})
export default class MobilePatternsPage {
  protected readonly example = EXAMPLE;
  protected readonly accounts = [
    {
      id: 'main',
      label: 'Everyday account',
      balance: 1250,
      currency: 'USD',
      detail: 'Available balance',
    },
    { id: 'savings', label: 'Savings', balance: 4800, currency: 'USD', detail: 'Rainy day fund' },
  ];
  protected readonly actions = [
    { id: 'send', label: 'Send money' },
    { id: 'receive', label: 'Receive' },
  ];
  protected readonly orderOpen = signal(false);
  protected readonly transferState = signal<'idle' | 'loading' | 'error' | 'success'>('idle');
  protected readonly transferError = signal('');
  protected readonly request = signal<HyTransferRequest | null>(null);
  protected readonly steps: readonly HyProgressStep[] = [
    { id: 'placed', label: 'Placed', state: 'complete' },
    { id: 'preparing', label: 'Preparing', state: 'active' },
    { id: 'delivery', label: 'Delivery', state: 'pending' },
  ];
  protected submit(request: HyTransferRequest): void {
    this.request.set(request);
    this.transferState.set('loading');
  }
  protected fail(): void {
    this.transferError.set('The demo request could not complete. Review the amount and retry.');
    this.transferState.set('error');
  }
  protected readonly rows: ApiRow[] = [
    {
      name: 'HyWalletBlock',
      type: 'component',
      default: 'accounts required',
      description:
        'heading, accounts, actions, activeIndex model, locale, loading/error/empty and retry labels; selected and retry outputs. hyWalletContent projects extra content.',
    },
    {
      name: 'HyWalletAccount',
      type: 'readonly data',
      default: 'id, label, balance, currency',
      description:
        'Optional detail. Currency uses an Intl currency code; non-finite balance is unavailable.',
    },
    {
      name: 'HyTransferBlock',
      type: 'component',
      default: 'state idle',
      description:
        'recipient and amount models, currency, locale, state idle/loading/error/success, error and localized labels. submitted emits recipient and canonical amount. hyTransferDetails projects fees or disclosures.',
    },
    {
      name: 'HyTransferRequest',
      type: '{ recipient: string; amount: string }',
      default: 'output',
      description:
        'The host validates, authorizes and submits. Confirming a demo does not send money.',
    },
    {
      name: 'HyOrderTrackerBlock',
      type: 'component',
      default: 'steps required',
      description:
        'open model, heading, detail, steps, sheet options, loading/error, action and recovery labels; selected and retry outputs.',
    },
    {
      name: 'hyOrderRoute',
      type: 'projected slot',
      default: 'empty',
      description:
        'Provide an accessible specialist map or route summary. No map or realtime transport is bundled.',
    },
  ];
}
