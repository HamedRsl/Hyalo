import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HyLocale } from '@hyalo/angular/core';
import MobilePatternsPage from './mobile-patterns';

describe('primitive fintech transfer screen', () => {
  async function screen() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(MobilePatternsPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const amount = element.querySelector<HTMLInputElement>('#transfer-amount')!;
    const type = async (text: string, event: Event = new Event('input', { bubbles: true })) => {
      amount.value = text;
      amount.dispatchEvent(event);
      await fixture.whenStable();
    };
    const key = async (value: string) => {
      element.querySelector<HTMLButtonElement>(`[data-key="${value}"]`)!.click();
      await fixture.whenStable();
    };
    return { fixture, element, amount, type, key };
  }

  it('provides exactly twelve Button keys, preserves zeros, and handles decimal and backspace', async () => {
    const { element, amount, key } = await screen();
    expect(element.querySelectorAll('.transfer-keypad button[hyButton]')).toHaveLength(12);
    for (const value of ['0', '0', '1', '.', '2', '3', '4', '.']) await key(value);
    expect(amount.value).toBe('001.23');
    await key('backspace');
    expect(amount.value).toBe('001.2');
  });
  it('validates zero and recipient, locks pending requests, and permits an explicit retry after failure', async () => {
    const { fixture, element, amount, type, key } = await screen();
    const confirm = element.querySelector<HTMLButtonElement>('[data-confirm]');
    expect(confirm).not.toBeNull();
    const form = element.querySelector<HTMLFormElement>('.transfer-screen')!;
    const recipient = element.querySelector<HTMLInputElement>('#transfer-recipient')!;
    expect(confirm!.disabled).toBe(true);
    await type('۰۰۰٫۰۰');
    expect(confirm!.disabled).toBe(true);
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(element.querySelector('[data-request]')).toBeNull();
    await type('۰۰١٢٫٣٠');
    recipient.value = '   ';
    recipient.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(confirm!.disabled).toBe(true);
    recipient.value = '  Alex  ';
    recipient.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(confirm!.disabled).toBe(false);
    confirm!.click();
    await fixture.whenStable();
    expect(element.querySelector('[data-request]')!.textContent).toContain('0012.30 USD for Alex');
    expect(amount.disabled).toBe(true);
    expect(recipient.disabled).toBe(true);
    expect(
      [...element.querySelectorAll<HTMLButtonElement>('.transfer-keypad button')].every(
        (button) => button.disabled,
      ),
    ).toBe(true);
    const requestBefore = element.querySelector('[data-request]')!.textContent;
    await type('999');
    await key('5');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(amount.value).toBe('0012.30');
    expect(element.querySelector('[data-request]')!.textContent).toBe(requestBefore);
    element.querySelector<HTMLButtonElement>('[data-simulate="error"]')!.click();
    await fixture.whenStable();
    expect(element.querySelector('[role="alert"]')!.textContent).toContain('could not complete');
    expect(amount.disabled).toBe(false);
    confirm!.click();
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('[data-simulate="success"]')!.click();
    await fixture.whenStable();
    expect(element.querySelector('[data-status]')!.textContent).toContain('Demo complete');
    expect(confirm!.disabled).toBe(true);
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(element.querySelector('[data-status]')!.textContent).toContain('Demo complete');
    element.querySelector<HTMLButtonElement>('[data-reset]')!.click();
    await fixture.whenStable();
    expect(amount.disabled).toBe(false);
    expect(element.querySelector('[data-request]')).toBeNull();
  });

  it('defers composition and displays locale digits while submitting a canonical string', async () => {
    const { fixture, element, amount, type } = await screen();
    await type('12.30');
    amount.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    await type('۰۰٤٢٫٥٠', new InputEvent('input', { bubbles: true, isComposing: true }));
    expect(amount.value).toBe('۰۰٤٢٫٥٠');
    amount.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    await fixture.whenStable();
    expect(amount.value).toBe('0042.50');
    TestBed.inject(HyLocale).setLocale('fa-IR');
    await fixture.whenStable();
    expect(amount.value).toBe('۰۰۴۲٫۵۰');
    expect(element.querySelector('[data-key="2"]')!.textContent).toContain('۲');
    element.querySelector<HTMLButtonElement>('[data-confirm]')!.click();
    await fixture.whenStable();
    expect(element.querySelector('[data-request]')!.textContent).toContain('0042.50 USD');
  });

  it('rejects excess precision, excessive length, grouping, and non-digit edits without changing the amount', async () => {
    const { amount, type } = await screen();
    await type('123456789.12');
    for (const invalid of ['1234567890.12', '1.234', '1e3', '-10', '1,000', 'abc']) {
      await type(invalid);
      expect(amount.value).toBe('123456789.12');
    }
  });

  it('supports a locale decimal comma for typed amounts', async () => {
    const { fixture, amount, type } = await screen();
    TestBed.inject(HyLocale).setLocale('de-DE');
    await fixture.whenStable();
    await type('0012,30');
    expect(amount.value).toBe('0012,30');
  });

  it('keeps the insertion caret when normalizing a mid-string edit', async () => {
    const { fixture, amount, type } = await screen();
    await type('1234');
    amount.value = '12۳34';
    amount.setSelectionRange(3, 3);
    amount.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(amount.value).toBe('12334');
    expect(amount.selectionStart).toBe(3);
    expect(amount.selectionEnd).toBe(3);
  });

  it('normalizes pasted Persian and Eastern Arabic digits without losing leading zeros', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(MobilePatternsPage);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector(
      '#transfer-amount',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    input!.value = '۰۰١٢٫٣٠';
    input!.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }));
    await fixture.whenStable();
    expect(input!.value).toBe('0012.30');
    expect(fixture.nativeElement.querySelector('hy-transfer-block')).toBeNull();
    expect(fixture.nativeElement.querySelector('hy-numeric-keypad')).toBeNull();
  });
});
