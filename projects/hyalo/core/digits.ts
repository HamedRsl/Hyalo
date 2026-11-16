import { booleanAttribute, Directive, ElementRef, inject, input } from '@angular/core';

export function normalizeDigits(value: string): string {
  return value.replace(/[\u0660-\u0669\u06f0-\u06f9]/gu, (digit) =>
    String(digit.charCodeAt(0) - (digit.charCodeAt(0) >= 0x06f0 ? 0x06f0 : 0x0660)),
  );
}

/** Keeps identifier strings intact, including leading zeros; it does not parse numbers. */
@Directive({
  selector: 'input[hyDigits],textarea[hyDigits]',
  host: {
    '(input)': 'normalize($event)',
    '(compositionend)': 'normalize($event)',
  },
})
export class HyDigits {
  readonly hyDigits = input(true, { transform: booleanAttribute });
  private readonly el =
    inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef).nativeElement;
  protected normalize(event: Event): void {
    if (!this.hyDigits() || ('isComposing' in event && event.isComposing)) return;
    const before = this.el.value;
    const after = normalizeDigits(before);
    if (before === after) return;
    const start = this.el.selectionStart,
      end = this.el.selectionEnd;
    this.el.value = after;
    if (start !== null && end !== null) this.el.setSelectionRange(start, end);
    // Re-dispatch after normalization so every value accessor sees the canonical text.
    this.el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
