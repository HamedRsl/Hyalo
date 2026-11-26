import { TestBed } from '@angular/core/testing';
import { HyMaskedInput } from './masked-input';
it('accepts custom/alphabetic tokens while preserving a masked model policy', async () => {
  const fixture = TestBed.createComponent(HyMaskedInput);
  fixture.componentRef.setInput('mask', 'AA-##');
  fixture.componentRef.setInput('tokens', { A: /[a-z]/i });
  fixture.componentRef.setInput('valueFormat', 'masked');
  await fixture.whenStable();
  const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  input.value = 'ab12';
  input.dispatchEvent(new Event('input'));
  expect(fixture.componentInstance.value()).toBe('ab-12');
  expect(input.value).toBe('ab-12');
  expect(input.inputMode).toBe('text');
});
it('keeps masked models formatted when deleting a separator', async () => {
  const fixture = TestBed.createComponent(HyMaskedInput);
  fixture.componentRef.setInput('mask', '##-##');
  fixture.componentRef.setInput('valueFormat', 'masked');
  fixture.componentRef.setInput('value', '12-34');
  await fixture.whenStable();
  const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  input.setSelectionRange(3, 3);
  input.dispatchEvent(
    new InputEvent('beforeinput', { inputType: 'deleteContentBackward', cancelable: true }),
  );
  expect(fixture.componentInstance.value()).toBe('13-4');
  expect(input.value).toBe('13-4');
});
it.each(['raw', 'masked'] as const)(
  'deletes custom-token values past a separator with a %s model',
  async (valueFormat) => {
    const fixture = TestBed.createComponent(HyMaskedInput);
    fixture.componentRef.setInput('mask', 'AA-##');
    fixture.componentRef.setInput('tokens', { A: /[a-z]/i });
    fixture.componentRef.setInput('valueFormat', valueFormat);
    fixture.componentRef.setInput('value', valueFormat === 'masked' ? 'ab-12' : 'ab12');
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.setSelectionRange(2, 2);
    const deletion = new InputEvent('beforeinput', {
      inputType: 'deleteContentForward',
      cancelable: true,
    });
    input.dispatchEvent(deletion);
    expect(deletion.defaultPrevented).toBe(true);
    expect(input.value).toBe('ab-2');
    expect(fixture.componentInstance.value()).toBe(valueFormat === 'masked' ? 'ab-2' : 'ab2');
    expect(input.selectionStart).toBe(2);
    input.dispatchEvent(
      new InputEvent('beforeinput', {
        inputType: 'deleteContentForward',
        cancelable: true,
      }),
    );
    expect(input.value).toBe('ab');
    expect(fixture.componentInstance.value()).toBe('ab');
    expect(input.selectionStart).toBe(2);
  },
);
it('buffers incomplete edits until blur with an opt-in clear policy', async () => {
  const fixture = TestBed.createComponent(HyMaskedInput);
  fixture.componentRef.setInput('mask', '##-##');
  fixture.componentRef.setInput('incompletePolicy', 'clear');
  await fixture.whenStable();
  const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  input.value = '12';
  input.dispatchEvent(new Event('input'));
  expect(input.value).toBe('12');
  input.dispatchEvent(new FocusEvent('blur'));
  expect(input.value).toBe('');
  expect(fixture.componentInstance.value()).toBe('');
});

it('handles supplementary characters without taking over native or composing deletion', async () => {
  const leaf = String.fromCodePoint(0x1f33f);
  const flower = String.fromCodePoint(0x1f33b);
  const fixture = TestBed.createComponent(HyMaskedInput);
  fixture.componentRef.setInput('mask', 'X-X');
  fixture.componentRef.setInput('tokens', { X: /\p{Extended_Pictographic}/u });
  fixture.componentRef.setInput('value', leaf + flower);
  await fixture.whenStable();
  const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
  const completed = vi.fn();
  fixture.componentInstance.completed.subscribe(completed);
  input.setSelectionRange(3, 3);
  for (const options of [{ cancelable: false }, { cancelable: true, isComposing: true }]) {
    input.dispatchEvent(new InputEvent('beforeinput', { inputType: 'deleteContentBackward', ...options }));
    expect(input.value).toBe(leaf + '-' + flower);
  }
  const deletion = new InputEvent('beforeinput', { inputType: 'deleteContentBackward', cancelable: true });
  input.dispatchEvent(deletion);
  expect(deletion.defaultPrevented).toBe(true);
  expect(input.value).toBe(flower);
  expect(fixture.componentInstance.value()).toBe(flower);
  input.value += leaf;
  input.dispatchEvent(new InputEvent('input', { isComposing: true }));
  expect(completed).not.toHaveBeenCalled();
  input.dispatchEvent(new CompositionEvent('compositionend'));
  expect(completed).toHaveBeenCalledWith(flower + leaf);
  expect(input.selectionStart).toBe(5);
});

it.each(['blur', 'complete'] as const)('supports deferred %s commit and external replacements', async (mode) => {
  const fixture = TestBed.createComponent(HyMaskedInput);
  fixture.componentRef.setInput('mask', '##-##');
  fixture.componentRef.setInput('commitOn', mode);
  fixture.componentRef.setInput('valueFormat', 'masked');
  await fixture.whenStable();
  const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
  const type = (value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  type('12');
  expect(input.value).toBe('12');
  expect(fixture.componentInstance.value()).toBe('');
  input.dispatchEvent(new FocusEvent('blur'));
  expect(fixture.componentInstance.value()).toBe(mode === 'blur' ? '12' : '');
  type('1234');
  if (mode === 'blur') input.dispatchEvent(new FocusEvent('blur'));
  expect(fixture.componentInstance.value()).toBe('12-34');
  type('9');
  fixture.componentRef.setInput('value', '56-78');
  await fixture.whenStable();
  expect(input.value).toBe('56-78');
  input.dispatchEvent(new FocusEvent('blur'));
  expect(fixture.componentInstance.value()).toBe('56-78');
});
