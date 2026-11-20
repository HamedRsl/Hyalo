import { normalizeIdentifier } from '@hyalo/angular/core';
export function formatMask(value: string, mask: string): string {
  const digits = normalizeIdentifier(value);
  let index = 0,
    result = '';
  for (const character of mask) {
    if (index >= digits.length) break;
    result += character === '#' ? digits[index++] : character;
  }
  return result;
}
/** Token parser shared by formatting, completion and caret mapping. Regex state is never mutated. */
export function parseMask(
  value: string,
  mask: string,
  tokens: Readonly<Record<string, RegExp>>,
): { raw: string; masked: string; complete: boolean; positions: number[] } {
  const rules: Readonly<Record<string, RegExp>> = { '#': /[0-9]/u, ...tokens };
  const source = Array.from(value, (character) =>
    /[۰-۹٠-٩]/u.test(character) ? normalizeIdentifier(character) : character,
  );
  let cursor = 0,
    raw = '',
    masked = '';
  const positions: number[] = [];
  let capacity = 0;
  for (const slot of mask) if (rules[slot]) capacity++;
  for (const slot of mask) {
    const rule = rules[slot];
    if (!rule) {
      if (cursor < source.length) {
        masked += slot;
        if (source[cursor] === slot) cursor++;
      }
      continue;
    }
    const matcher = new RegExp(`^(?:${rule.source})$`, rule.flags.replace(/[gy]/gu, ''));
    while (cursor < source.length && !matcher.test(source[cursor] ?? '')) cursor++;
    if (cursor >= source.length) break;
    const character = source[cursor++] ?? '';
    raw += character;
    masked += character;
    positions.push(masked.length);
  }
  return { raw, masked, complete: capacity > 0 && raw.length === capacity, positions };
}

export function normalizeIranianPhone(value: string): string {
  let digits = normalizeIdentifier(value);
  if (digits.startsWith('0098')) digits = '0' + digits.slice(4);
  else if (digits.startsWith('98')) digits = '0' + digits.slice(2);
  return digits;
}

/** Removing a separator must delete the adjacent digit instead of endlessly restoring the mask. */
export function deleteMaskSeparator(
  event: Event,
  input: HTMLInputElement,
): { readonly value: string; readonly digitCaret: number } | undefined {
  const edit = event as InputEvent,
    caret = input.selectionStart;
  if (edit.isComposing || caret === null || caret !== input.selectionEnd) return undefined;
  const backwards = edit.inputType === 'deleteContentBackward';
  if (!backwards && edit.inputType !== 'deleteContentForward') return undefined;
  const character = input.value[backwards ? caret - 1 : caret];
  if (!character || /[0-9]/u.test(character)) return undefined;
  const digits = normalizeIdentifier(input.value),
    before = normalizeIdentifier(input.value.slice(0, caret)).length;
  const index = backwards ? before - 1 : before;
  if (index < 0 || index >= digits.length) return undefined;
  event.preventDefault();
  return { value: digits.slice(0, index) + digits.slice(index + 1), digitCaret: index };
}
export function maskCaret(input: HTMLInputElement, digitCaret: number): void {
  let position = 0,
    digits = 0;
  while (position < input.value.length && digits < digitCaret) {
    if (/[0-9]/u.test(input.value[position] ?? '')) digits++;
    position++;
  }
  input.setSelectionRange(position, position);
}
