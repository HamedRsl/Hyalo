import {
  ChangeDetectionStrategy,
  Component,
  computed,
  afterRenderEffect,
  viewChild,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { HyLocale, type HyAction } from '@hyalo/angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HY_CARD_STACK } from '@hyalo/angular/card-stack';
import { HyNumericKeypad } from '@hyalo/angular/keypad';
import { HySlideConfirm } from '@hyalo/angular/slide-confirm';
import { HyBottomSheetHost, type HyBottomSheetConfig } from '@hyalo/angular/bottom-sheet';
import { HySegmentedProgress, type HyProgressStep } from '@hyalo/angular/meter';

export interface HyWalletAccount {
  readonly id: string;
  readonly label: string;
  readonly balance: number;
  readonly currency: string;
  readonly detail?: string;
}
@Component({
  selector: 'hy-wallet-block',
  imports: [HY_CARD_STACK, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wallet-block.html',
  styleUrl: './mobile.css',
})
export class HyWalletBlock {
  private readonly globalLocale = inject(HyLocale);
  readonly heading = input('Wallet');
  readonly accountsLabel = input('Accounts');
  readonly accounts = input.required<readonly HyWalletAccount[]>();
  readonly actions = input<readonly HyAction[]>([]);
  readonly activeIndex = model(0);
  readonly locale = input<string>();
  readonly loading = input(false);
  readonly error = input('');
  readonly loadingLabel = input('Loading accounts');
  readonly emptyLabel = input('No accounts yet');
  readonly retryLabel = input('Retry');
  readonly selected = output<HyAction>();
  readonly retry = output<void>();
  protected readonly key = (account: HyWalletAccount): string => account.id;
  protected readonly cards = computed(() => {
    const formatters = new Map<string, Intl.NumberFormat>();
    return this.accounts().map((account) => {
      let format = formatters.get(account.currency);
      if (!format) {
        format = new Intl.NumberFormat(this.locale() ?? this.globalLocale.locale(), {
          style: 'currency',
          currency: account.currency,
        });
        formatters.set(account.currency, format);
      }
      return {
        ...account,
        formatted: Number.isFinite(account.balance)
          ? format.format(account.balance)
          : 'Unavailable',
      };
    });
  });
  protected choose(action: HyAction): void {
    if (!this.loading() && !action.disabled) this.selected.emit(action);
  }
}
export interface HyTransferRequest {
  readonly recipient: string;
  readonly amount: string;
}
@Component({
  selector: 'hy-transfer-block',
  imports: [HyNumericKeypad, HySlideConfirm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transfer-block.html',
  styleUrl: './mobile.css',
})
export class HyTransferBlock {
  readonly heading = input('Send money');
  readonly recipient = model('');
  readonly amount = model('');
  readonly currency = input('USD');
  readonly locale = input<string>();
  readonly state = input<'idle' | 'loading' | 'error' | 'success'>('idle');
  readonly error = input('');
  readonly recipientLabel = input('Recipient');
  readonly amountLabel = input('Amount');
  readonly confirmLabel = input('Confirm transfer');
  readonly successLabel = input('Transfer complete');
  readonly loadingLabel = input('Sending transfer');
  readonly submitted = output<HyTransferRequest>();
  protected readonly confirmed = model(false);
  private readonly confirmation = viewChild(HySlideConfirm);
  protected readonly valid = computed(
    () =>
      this.recipient().trim().length > 0 &&
      /^\d+(?:\.\d{0,2})?$/u.test(this.amount()) &&
      Number(this.amount()) > 0 &&
      Number.isFinite(Number(this.amount())),
  );
  constructor() {
    afterRenderEffect(() => {
      this.amount();
      this.recipient();
      if (this.state() === 'success') this.confirmation()?.value.set(true);
      else this.confirmation()?.reset();
    });
  }
  protected submit(): void {
    if (!this.valid() || this.state() === 'loading' || this.state() === 'success') return;
    this.submitted.emit({ recipient: this.recipient().trim(), amount: this.amount() });
  }
}
@Component({
  selector: 'hy-order-tracker-block',
  imports: [HyBottomSheetHost, HySegmentedProgress, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-tracker-block.html',
  styleUrl: './mobile.css',
})
export class HyOrderTrackerBlock {
  readonly open = model(false);
  readonly heading = input('Track order');
  readonly detail = input('');
  readonly steps = input.required<readonly HyProgressStep[]>();
  readonly options = input<HyBottomSheetConfig>({ breakpoints: [0.5, 1], initialBreakpoint: 0.5 });
  readonly loading = input(false);
  readonly error = input('');
  readonly loadingLabel = input('Updating order');
  readonly retryLabel = input('Retry');
  readonly action = input<HyAction>();
  readonly selected = output<HyAction>();
  readonly retry = output<void>();
}
