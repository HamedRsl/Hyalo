import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyMultiSelect } from './multi-select';

describe('multi-select identity and virtual options', () => {
  it('displays and removes a programmatic value absent from current options', async () => {
    const fixture = TestBed.createComponent(HyMultiSelect<{ id: number }>);
    fixture.componentRef.setInput('value', [{ id: 42 }]);
    fixture.componentRef.setInput('displayWith', (value: { id: number }) => `Record ${value.id}`);
    fixture.componentRef.setInput('compareWith', (a: { id: number }, b: { id: number }) => a.id === b.id);
    await fixture.whenStable();
    const chip = fixture.nativeElement.querySelector('[aria-label="Remove Record 42"]') as HTMLButtonElement;
    expect(chip).not.toBeNull();
    chip.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([]);
  });
  it('toggles an equivalent selected object with virtual keyboard selection', async () => {
    const fixture = TestBed.createComponent(HyMultiSelect<{ id: number }>);
    fixture.componentRef.setInput('options', [{ key: 'one', value: { id: 1 }, label: 'Same' }]);
    fixture.componentRef.setInput('compareWith', (a: { id: number }, b: { id: number }) => a.id === b.id);
    fixture.componentRef.setInput('value', [{ id: 1 }]);
    fixture.componentRef.setInput('virtualized', true);
    await fixture.whenStable();
    fixture.componentInstance.show();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([]);
  });

  it('bounds a large option list and exposes absolute accessible positions after scrolling', async () => {
    const fixture = TestBed.createComponent(HyMultiSelect<number>);
    fixture.componentRef.setInput('options', Array.from({ length: 10000 }, (_, value) => ({ value, label: `Item ${value}` })));
    fixture.componentRef.setInput('virtualized', true);
    await fixture.whenStable();
    fixture.componentInstance.show();
    await fixture.whenStable();
    let options = document.querySelectorAll('[ngOption]');
    expect(options.length).toBeLessThanOrEqual(10);
    expect(options[0]?.getAttribute('aria-setsize')).toBe('10000');
    const viewport = document.querySelector('.options') as HTMLElement;
    viewport.scrollTop = 4400;
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    options = document.querySelectorAll('[ngOption]');
    expect(options.length).toBeLessThanOrEqual(10);
    expect(options[0]?.getAttribute('aria-posinset')).toBe('99');
  });
});
