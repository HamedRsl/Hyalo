import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
import { normalizeIdentifier } from '@hyalo/angular/core';
import { formatMask, deleteMaskSeparator, maskCaret } from './mask';
@Component({
  selector: 'hy-masked-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './masked-input.html',
  styleUrl: './masked-input.css',
})
export class HyMaskedInput extends HyValueControl implements FormValueControl<string> {
  readonly value = model('');
  /** A # represents a digit; other characters are presentation only. */
  readonly mask = input('### ### ####');
  readonly autocomplete = input('off');
  protected readonly display = computed(() => formatMask(this.value(), this.mask()));
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
    const digitsBefore = normalizeIdentifier(
      element.value.slice(0, element.selectionStart ?? element.value.length),
    ).length;
    this.value.set(normalizeIdentifier(element.value).slice(0, this.mask().split('#').length - 1));
    element.value = this.display();
    let position = 0,
      digits = 0;
    while (position < element.value.length && digits < digitsBefore) {
      if (/[0-9]/u.test(element.value[position] ?? '')) digits++;
      position++;
    }
    element.setSelectionRange(position, position);
  }
}
