import { TestBed } from '@angular/core/testing';
import { HyNumericKeypad } from './keypad';

describe('numeric keypad options', () => {
  it('keeps a canonical model with a localized separator and bounded decimal precision', async () => {
    const f = TestBed.createComponent(HyNumericKeypad);
    f.componentRef.setInput('decimal', true);
    f.componentRef.setInput('decimalSeparator', '٫');
    f.componentRef.setInput('locale', 'fa');
    f.componentRef.setInput('maxFractionDigits', 2);
    f.componentRef.setInput('layout', 'calculator');
    const submitted = vi.fn();
    f.componentInstance.submitted.subscribe(submitted);
    await f.whenStable();
    expect(f.nativeElement.querySelector('.keys button').textContent.trim()).toBe('۷');
    const input = f.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '۰۰۱۲٫۵۰';
    input.dispatchEvent(new Event('input'));
    await f.whenStable();
    expect(f.componentInstance.value()).toBe('0012.50');
    expect(input.value).toBe('۰۰۱۲٫۵۰');
    f.componentInstance.append('1');
    expect(f.componentInstance.value()).toBe('0012.50');
    f.componentInstance.submit();
    expect(submitted).toHaveBeenCalledWith('0012.50');
    f.componentInstance.clear();
    f.componentInstance.append('1.');
    f.componentInstance.submit();
    expect(submitted).toHaveBeenCalledTimes(1);
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }),
    );
    expect(submitted).toHaveBeenCalledTimes(1);
  });
});
