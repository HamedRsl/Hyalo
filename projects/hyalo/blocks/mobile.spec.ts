import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { HyMotion } from '@hyalo/angular/motion';
import { HyWalletBlock, HyTransferBlock, HyOrderTrackerBlock } from './mobile';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('mobile blocks', () => {
  it('formats wallet data and routes quick actions to the host', async () => {
    const f = TestBed.createComponent(HyWalletBlock);
    f.componentRef.setInput('accounts', [
      { id: 'main', label: 'Everyday', currency: 'USD', balance: 1250 },
    ]);
    f.componentRef.setInput('actions', [
      { id: 'send', label: 'Send' },
      { id: 'disabled', label: 'Unavailable', disabled: true },
    ]);
    const selected = vi.fn();
    f.componentInstance.selected.subscribe(selected);
    await f.whenStable();
    expect(f.nativeElement.textContent).toContain('$1,250.00');
    f.nativeElement.querySelector('.quick-actions button').click();
    expect(selected.mock.calls[0]?.[0].id).toBe('send');
    await expectNoAxeViolations(f.nativeElement);
  });
  it('requires a recipient and a positive amount, and blocks duplicate submission while loading', async () => {
    const f = TestBed.createComponent(HyTransferBlock);
    const submit = vi.fn();
    f.componentInstance.submitted.subscribe(submit);
    await f.whenStable();
    const confirm = f.nativeElement.querySelector('hy-slide-confirm button') as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    f.componentInstance.recipient.set('  Alex  ');
    f.componentInstance.amount.set('0012.50');
    await f.whenStable();
    confirm.click();
    expect(submit).toHaveBeenCalledWith({ recipient: 'Alex', amount: '0012.50' });
    f.componentRef.setInput('state', 'loading');
    await f.whenStable();
    confirm.click();
    expect(submit).toHaveBeenCalledTimes(1);
    await expectNoAxeViolations(f.nativeElement);
    f.componentRef.setInput('state', 'error');
    f.componentRef.setInput('error', 'Try again');
    await f.whenStable();
    expect(f.nativeElement.querySelector('[role=alert]').textContent).toContain('Try again');
    confirm.click();
    expect(submit).toHaveBeenCalledTimes(2);
  });
  it('composes order state and recovery inside the snap-point sheet', async () => {
    TestBed.inject(HyMotion).setReduced(true);
    const f = TestBed.createComponent(HyOrderTrackerBlock);
    f.componentRef.setInput('steps', [
      { id: 'placed', label: 'Placed', state: 'complete' },
      { id: 'preparing', label: 'Preparing', state: 'active' },
    ]);
    f.componentRef.setInput('error', 'Connection lost');
    f.componentInstance.open.set(true);
    const retry = vi.fn();
    f.componentInstance.retry.subscribe(retry);
    await f.whenStable();
    const panel = document.querySelector<HTMLElement>('.cdk-dialog-container')!;
    expect(panel.textContent).toContain('Preparing');
    const button = [...panel.querySelectorAll('button')].find(
      (b) => b.textContent?.trim() === 'Retry',
    );
    button?.click();
    expect(retry).toHaveBeenCalledTimes(1);
    await expectNoAxeViolations(panel);
    TestBed.inject(Dialog).closeAll();
    TestBed.inject(HyMotion).setReduced(null);
  });
});
