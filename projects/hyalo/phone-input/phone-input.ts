import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
import {
  formatMask,
  normalizeIranianPhone,
  deleteMaskSeparator,
  maskCaret,
} from '@hyalo/angular/masked-input';
@Component({
  selector: 'hy-phone-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './phone-input.html',
  styleUrl: './phone-input.css',
})
export class HyPhoneInput extends HyValueControl implements FormValueControl<string> {
  readonly value = model('');
  protected readonly display = computed(() => formatMask(this.value(), '#### ### ####'));
  protected beforeDelete(event: Event): void {
    if (this.blocked()) return;
    const input = event.target as HTMLInputElement,
      deletion = deleteMaskSeparator(event, input);
    if (!deletion) return;
    this.value.set(deletion.value);
    input.value = this.display();
    maskCaret(input, deletion.digitCaret);
  }
  protected update(event: Event): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    const element = event.target as HTMLInputElement;
    const raw = element.value,
      caret = element.selectionStart ?? raw.length;
    const next = normalizeIranianPhone(raw).slice(0, 11);
    const digitCaret = normalizeIranianPhone(raw.slice(0, caret)).length;
    this.value.set(next);
    element.value = this.display();
    let position = 0,
      count = 0;
    while (position < element.value.length && count < digitCaret) {
      if (/[0-9]/u.test(element.value[position] ?? '')) count++;
      position++;
    }
    element.setSelectionRange(position, position);
  }
}
