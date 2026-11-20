import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { HyAuthBlock, HyBookingBlock, HySettingsBlock } from '@hyalo/angular/blocks';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/advanced-forms';
@Component({
  selector: 'docs-advanced-forms',
  imports: [DocsPage, DocsExample, HyAuthBlock, HyBookingBlock, HySettingsBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './advanced-forms.html',
})
export default class AdvancedFormsPage {
  protected readonly examples = [EXAMPLE] as const;
  protected readonly notice = signal('');
  protected readonly activeRequest = signal('');
  protected readonly formPending = signal(false);
  protected readonly formError = signal('');
  protected request(kind: string): void {
    this.activeRequest.set(kind);
    this.formPending.set(true);
    this.formError.set('');
    this.notice.set('Awaiting host response for ' + kind + '. No data is sent.');
  }
  protected settle(success: boolean): void {
    this.formPending.set(false);
    this.formError.set(success ? '' : 'Demo provider unavailable. Correct details or retry.');
    this.notice.set(
      success
        ? 'Demo ' + this.activeRequest() + ' confirmed locally. No backend action occurred.'
        : 'Request failed; edits are preserved.',
    );
  }
  protected readonly checkoutQuantity = signal(1);
  protected readonly checkoutState = signal<'idle' | 'pending' | 'error' | 'success'>('idle');
  protected readonly checkoutTotal = computed(() =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(this.checkoutQuantity() * 240),
  );
  protected editQuantity(event: Event): void {
    this.checkoutQuantity.set((event.target as HTMLInputElement).valueAsNumber);
    this.checkoutState.set('idle');
  }
  protected requestCheckout(event: Event): void {
    event.preventDefault();
    const quantity = this.checkoutQuantity();
    if (
      this.checkoutState() === 'pending' ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 12
    )
      return;
    this.checkoutState.set('pending');
  }
  protected readonly booking = signal({
    date: '2026-11-16' as string | null,
    time: '10:30',
    guests: 1 as number | null,
    phone: '09123456789',
  });
  protected readonly slots = [
    { value: '09:00' },
    { value: '10:30' },
    { value: '12:00', disabled: true },
    { value: '14:00' },
  ];
  protected readonly teams = [
    { value: 'design', label: 'Design' },
    { value: 'engineering', label: 'Engineering' },
  ];
  protected readonly settings = signal({
    name: 'Atelier',
    teams: ['design'] as readonly string[],
    reminders: true,
    files: [] as readonly File[],
  });
}
