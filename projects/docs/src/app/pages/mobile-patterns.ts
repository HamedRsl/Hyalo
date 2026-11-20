import { EXAMPLE } from './examples/mobile-patterns';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HyWalletBlock, HyOrderTrackerBlock } from '@hyalo/angular/blocks';
import { HyLocale, normalizeDigits } from '@hyalo/angular/core';
import { HyButton } from '@hyalo/angular/button';
import type { HyProgressStep } from '@hyalo/angular/meter';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-mobile-patterns',
  imports: [DocsPage, DocsExample, DocsApiTable, HyWalletBlock, HyOrderTrackerBlock, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mobile-patterns.html',
  styleUrl: './transfer-screen.css',
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
  protected readonly request = signal<{ recipient: string; amount: string } | null>(null);
  protected readonly amount = signal('');
  protected readonly recipient = signal('Alex Morgan');
  protected readonly locked = computed(
    () => this.transferState() === 'loading' || this.transferState() === 'success',
  );
  protected readonly canConfirm = computed(
    () =>
      !this.locked() &&
      this.recipient().trim().length > 0 &&
      /^\d{1,9}(?:\.\d{1,2})?$/u.test(this.amount()) &&
      /[1-9]/u.test(this.amount()),
  );
  protected readonly locale = inject(HyLocale).locale;
  protected readonly keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];
  protected keyLabel(key: string): string {
    if (key === 'backspace') return '⌫';
    if (key === '.')
      return (
        new Intl.NumberFormat(this.locale())
          .formatToParts(1.1)
          .find((part) => part.type === 'decimal')?.value ?? '.'
      );
    return new Intl.NumberFormat(this.locale(), { useGrouping: false }).format(Number(key));
  }
  protected readonly amountDisplay = computed(() => {
    const formatter = new Intl.NumberFormat(this.locale(), { useGrouping: false });
    const separator =
      new Intl.NumberFormat(this.locale())
        .formatToParts(1.1)
        .find((part) => part.type === 'decimal')?.value ?? '.';
    return this.amount().replace(/[0-9.]/gu, (character) =>
      character === '.' ? separator : formatter.format(Number(character)),
    );
  });
  protected editAmount(event: Event): void {
    if ('isComposing' in event && event.isComposing) return;
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart,
      end = input.selectionEnd;
    if (!this.locked()) this.setAmount(input.value);
    input.value = this.amountDisplay();
    if (start !== null && end !== null) input.setSelectionRange(start, end);
  }
  protected editRecipient(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.locked()) this.recipient.set(input.value);
    else input.value = this.recipient();
  }
  private setAmount(text: string): void {
    const separator = this.keyLabel('.');
    const value = normalizeDigits(text)
      .replaceAll(separator, '.')
      .replace(/\u066b/gu, '.');
    // Reject rather than round or truncate a monetary value. Keep the canonical string intact.
    if (/^\d{0,9}(?:\.\d{0,2})?$/u.test(value)) this.amount.set(value);
  }
  protected pressKey(key: string): void {
    if (this.locked()) return;
    this.setAmount(key === 'backspace' ? this.amount().slice(0, -1) : this.amount() + key);
  }
  protected readonly steps: readonly HyProgressStep[] = [
    { id: 'placed', label: 'Placed', state: 'complete' },
    { id: 'preparing', label: 'Preparing', state: 'active' },
    { id: 'delivery', label: 'Delivery', state: 'pending' },
  ];
  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.canConfirm()) return;
    this.request.set({ recipient: this.recipient().trim(), amount: this.amount() });
    this.transferError.set('');
    this.transferState.set('loading');
  }
  protected fail(): void {
    if (this.transferState() !== 'loading') return;
    this.transferError.set('The demo request could not complete. Review the amount and retry.');
    this.transferState.set('error');
  }
  protected succeed(): void {
    if (this.transferState() === 'loading') this.transferState.set('success');
  }
  protected resetTransfer(): void {
    if (this.transferState() === 'loading') return;
    this.transferState.set('idle');
    this.transferError.set('');
    this.request.set(null);
    this.amount.set('');
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
      name: 'Transfer screen composition',
      type: 'editable example',
      default: 'idle',
      description:
        'Native labeled inputs and twelve HyButton keys; normalizeDigits from @hyalo/angular/core produces canonical ASCII strings. Host-owned idle/loading/error/success state. No keypad or transfer wrapper is required.',
    },
    {
      name: 'Demo request',
      type: '{ recipient: string; amount: string }',
      default: 'host snapshot',
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
