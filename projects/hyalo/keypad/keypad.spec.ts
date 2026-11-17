import { TestBed } from '@angular/core/testing';
import { HyNumericKeypad } from './keypad';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyNumericKeypad', () => {
  it('normalizes localized paste, preserves leading zeros, and rejects malformed edits', async () => {
    const f = TestBed.createComponent(HyNumericKeypad);
    f.componentRef.setInput('label', 'Amount');
    f.componentRef.setInput('decimal', true);
    f.componentRef.setInput('locale', 'fa-IR');
    await f.whenStable();
    const input = f.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '۰۰۱۲٫۵۰';
    input.dispatchEvent(new Event('input'));
    await f.whenStable();
    expect(f.componentInstance.value()).toBe('0012.50');
    input.value = '12.3.4';
    input.dispatchEvent(new Event('input'));
    expect(f.componentInstance.value()).toBe('0012.50');
    expect(input.value).toBe('۰۰۱۲.۵۰');
    await expectNoAxeViolations(f.nativeElement);
  });
  it('defers composition, respects readonly, and reports touch only when leaving the composite', async () => {
    const f = TestBed.createComponent(HyNumericKeypad);
    const touched = vi.fn();
    f.componentInstance.touch.subscribe(touched);
    await f.whenStable();
    const input = f.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '۱۲';
    input.dispatchEvent(new InputEvent('input', { isComposing: true }));
    expect(f.componentInstance.value()).toBe('');
    input.dispatchEvent(new Event('compositionend'));
    expect(f.componentInstance.value()).toBe('12');
    f.componentRef.setInput('readonly', true);
    await f.whenStable();
    f.nativeElement.querySelector('button').click();
    expect(f.componentInstance.value()).toBe('12');
    input.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: f.nativeElement.querySelector('button'),
      }),
    );
    expect(touched).not.toHaveBeenCalled();
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(touched).toHaveBeenCalledTimes(1);
  });
});
