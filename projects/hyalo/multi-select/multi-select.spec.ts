import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { HyOptionPageRequest } from '@hyalo/angular/combobox';
import { HyMultiSelect } from './multi-select';

describe('multi-select identity and virtual options', () => {
  it('displays and removes a programmatic value absent from current options', async () => {
    const fixture = TestBed.createComponent(HyMultiSelect<{ id: number }>);
    fixture.componentRef.setInput('value', [{ id: 42 }]);
    fixture.componentRef.setInput('displayWith', (value: { id: number }) => `Record ${value.id}`);
    fixture.componentRef.setInput(
      'compareWith',
      (a: { id: number }, b: { id: number }) => a.id === b.id,
    );
    await fixture.whenStable();
    const chip = fixture.nativeElement.querySelector(
      '[aria-label="Remove Record 42"]',
    ) as HTMLButtonElement;
    expect(chip).not.toBeNull();
    chip.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([]);
  });
  it('toggles an equivalent selected object with virtual keyboard selection', async () => {
    const fixture = TestBed.createComponent(HyMultiSelect<{ id: number }>);
    fixture.componentRef.setInput('options', [{ key: 'one', value: { id: 1 }, label: 'Same' }]);
    fixture.componentRef.setInput(
      'compareWith',
      (a: { id: number }, b: { id: number }) => a.id === b.id,
    );
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

  it('pages a short result set from the input and retains labels across searches', async () => {
    const fixture = TestBed.createComponent(HyMultiSelect<string>);
    const requests: HyOptionPageRequest[] = [];
    fixture.componentRef.setInput('pageSize', 1);
    fixture.componentRef.setInput('loadPage', async (request: HyOptionPageRequest) => {
      requests.push(request);
      return {
        options: [
          {
            value: request.query + request.offset,
            label: 'Team ' + request.query + request.offset,
          },
        ],
        hasMore: request.offset === 0,
      };
    });
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.show();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-keyshortcuts')).toBe('PageDown');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }));
    await fixture.whenStable();
    expect(requests.map(({ query, offset }) => [query, offset])).toEqual([
      ['', 0],
      ['', 1],
    ]);
    expect(input.getAttribute('aria-keyshortcuts')).toBeNull();
    component.hide();
    await fixture.whenStable();
    component.show();
    await fixture.whenStable();
    expect(requests.map(({ offset }) => offset)).toEqual([0, 1, 1]);
    const options = document.querySelectorAll<HTMLElement>('[ngOption]');
    expect([...options].map((option) => option.textContent?.trim())).toEqual(['Team 0', 'Team 1']);
    options[1]!.click();
    await fixture.whenStable();
    input.value = 'design';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(requests.at(-1)?.query).toBe('design');
    expect(component.value()).toEqual(['1']);
    const chip = fixture.nativeElement.querySelector(
      '[aria-label="Remove Team 1"]',
    ) as HTMLButtonElement;
    const another = document.querySelector<HTMLElement>('[ngOption]')!;
    another.click();
    await fixture.whenStable();
    chip.click();
    await fixture.whenStable();
    expect(component.value()).toEqual(['design0']);
    expect(input.ownerDocument.activeElement).toBe(input);
  });

  it('bounds a large option list and exposes absolute accessible positions after scrolling', async () => {
    const fixture = TestBed.createComponent(HyMultiSelect<number>);
    fixture.componentRef.setInput(
      'options',
      Array.from({ length: 10000 }, (_, value) => ({ value, label: `Item ${value}` })),
    );
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

it('emits attachment only when the listbox exists and detachment after it is removed', async () => {
  const fixture = TestBed.createComponent(HyMultiSelect<string>);
  fixture.componentRef.setInput('options', [{ value: 'one', label: 'One' }]);
  await fixture.whenStable();
  const events: string[] = [];
  const component = fixture.componentInstance;
  component.panelAttached.subscribe(() => {
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    events.push('attached');
  });
  component.panelDetached.subscribe(() => {
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    events.push('detached');
  });
  component.show();
  await fixture.whenStable();
  component.hide();
  await fixture.whenStable();
  expect(events).toEqual(['attached', 'detached']);
});
