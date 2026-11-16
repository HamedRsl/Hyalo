import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyCombobox } from './combobox';
import { HyMultiSelect } from '@hyalo/angular/multi-select';

describe('async selection', () => {
  it('does not leave a required multi-selection invalid after selection', async () => {
    const fixture = TestBed.createComponent(HyMultiSelect<string>);
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('options', [{ value: 'design', label: 'Design' }]);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.checkValidity()).toBe(false);
    fixture.componentRef.setInput('value', ['design']);
    await fixture.whenStable();
    expect(input.checkValidity()).toBe(true);
  });
  it('retains selected labels after a remote query is cleared', async () => {
    const fixture = TestBed.createComponent(HyCombobox<string>);
    fixture.componentRef.setInput('loadOptions', async () => [
      { value: 'tehran', label: 'Tehran' },
    ]);
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0]!.click();
    await fixture.whenStable();
    const option = document.querySelector<HTMLElement>('[ngOption]')!;
    option.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('tehran');
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe('Tehran');
  });
  it('cancels obsolete requests and never shows stale results', async () => {
    const signals: AbortSignal[] = [];
    const resolves: ((options: readonly { value: string; label: string }[]) => void)[] = [];
    const fixture = TestBed.createComponent(HyCombobox<string>);
    fixture.componentRef.setInput('loadOptions', (_query: string, signal: AbortSignal) => {
      signals.push(signal);
      return new Promise((resolve) => resolves.push(resolve));
    });
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'new';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(signals[0]?.aborted).toBe(true);
    resolves.at(-1)!([{ value: 'new', label: 'New result' }]);
    resolves[0]!([{ value: 'old', label: 'Stale result' }]);
    await fixture.whenStable();
    expect(document.querySelector('.options')?.textContent).toContain('New result');
    expect(document.querySelector('.options')?.textContent).not.toContain('Stale result');
  });
  it('renders removable chips for remote multi-selection', async () => {
    const fixture = TestBed.createComponent(HyMultiSelect<string>);
    fixture.componentRef.setInput('loadOptions', async () => [
      { value: 'design', label: 'Design' },
    ]);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    document.querySelector<HTMLElement>('[ngOption]')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual(['design']);
    const chip: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[aria-label="Remove Design"]',
    );
    expect(chip).not.toBeNull();
    chip.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([]);
  });
});
