import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import BlocksPage from './blocks';
import AdvancedFormsPage from './advanced-forms';

describe('older composed block demos', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('demonstrates two native hero CTAs without losing existing block links', async () => {
    const f = TestBed.createComponent(BlocksPage);
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('hy-hero-block .actions a').length).toBe(2);
    expect(f.nativeElement.querySelector('a[href="/blocks/notifications"]')).not.toBeNull();
    expect(f.nativeElement.querySelector('a[href="/blocks/marketplace-chat"]')).not.toBeNull();
    expect(f.nativeElement.querySelector('a[href="/blocks/transfer"]')).not.toBeNull();
  });

  it('keeps transactional form requests pending until an explicit demo host response', async () => {
    const f = TestBed.createComponent(AdvancedFormsPage);
    await f.whenStable();
    const booking = f.nativeElement.querySelector('hy-booking-block form');
    booking.dispatchEvent(new Event('submit', { cancelable: true }));
    await f.whenStable();
    expect(booking.getAttribute('aria-busy')).toBe('true');
    const controls = f.nativeElement.querySelector('[aria-label="Simulate form host response"]');
    controls.querySelectorAll('button')[0].click();
    await f.whenStable();
    expect(booking.getAttribute('aria-busy')).toBe('false');
    expect(booking.querySelector('[role=alert]').textContent).toContain('provider unavailable');
    booking.dispatchEvent(new Event('submit', { cancelable: true }));
    await f.whenStable();
    controls.querySelectorAll('button')[1].click();
    await f.whenStable();
    expect(f.nativeElement.textContent).toContain('Demo booking confirmed locally');
  });

  it('edits checkout quantity and lets the host explicitly settle pending/error/success', async () => {
    const f = TestBed.createComponent(AdvancedFormsPage);
    await f.whenStable();
    const form = f.nativeElement.querySelector('form[data-checkout]') as HTMLFormElement;
    expect(form).not.toBeNull();
    const quantity = form.querySelector('input[name=quantity]') as HTMLInputElement;
    quantity.value = '3';
    quantity.dispatchEvent(new Event('input', { bubbles: true }));
    await f.whenStable();
    expect(form.textContent).toContain('$720.00');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await f.whenStable();
    expect(form.getAttribute('aria-busy')).toBe('true');
    expect(form.querySelector<HTMLButtonElement>('button[type=submit]')?.disabled).toBe(true);
    const failure = f.nativeElement.querySelector('[data-checkout-error]') as HTMLButtonElement;
    failure.click();
    await f.whenStable();
    expect(form.querySelector('[role=alert]')?.textContent).toContain('declined');
    expect(quantity.value).toBe('3');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await f.whenStable();
    (f.nativeElement.querySelector('[data-checkout-success]') as HTMLButtonElement).click();
    await f.whenStable();
    expect(form.querySelector('[role=status]')?.textContent).toContain('Demo order confirmed');
    expect(form.textContent).toContain('No payment was processed');
  });
});
