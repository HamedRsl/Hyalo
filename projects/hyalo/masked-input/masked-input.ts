import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
import { normalizeIdentifier } from '@hyalo/angular/core';
import { formatMask, parseMask, deleteMaskSeparator, maskCaret } from './mask';
@Component({
  selector: 'hy-masked-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './masked-input.html',
  styleUrl: './masked-input.css',
})
export class HyMaskedInput extends HyValueControl implements FormValueControl<string> {
  readonly value = model('');
  readonly completed = output<string>();
  /** A # represents a digit; other characters are presentation only. */
  readonly mask = input('### ### ####');
  readonly autocomplete = input('off');
  readonly tokens = input<Readonly<Record<string, RegExp>>>({});
  readonly valueFormat = input<'raw' | 'masked'>('raw');
  readonly incompletePolicy = input<'retain' | 'clear'>('retain');
  protected readonly inputMode = computed(() =>
    Object.keys(this.tokens()).length ? 'text' : 'numeric',
  );
  protected blur(event: Event): void {
    if (this.blocked() || this.incompletePolicy() !== 'clear') return;
    if (!parseMask(this.value(), this.mask(), this.tokens()).complete) {
      this.value.set('');
      (event.target as HTMLInputElement).value = '';
    }
  }
  protected readonly display = computed(() =>
    Object.keys(this.tokens()).length || this.valueFormat() === 'masked'
      ? parseMask(this.value(), this.mask(), this.tokens()).masked
      : formatMask(this.value(), this.mask()),
  );
  protected beforeDelete(event: Event): void {
    if (this.blocked()) return;
    const input = event.target as HTMLInputElement;
    if (Object.keys(this.tokens()).length) {
      const edit = event as InputEvent;
      const caret = input.selectionStart;
      if (edit.isComposing || caret === null || caret !== input.selectionEnd) return;
      const backwards = edit.inputType === 'deleteContentBackward';
      if (!backwards && edit.inputType !== 'deleteContentForward') return;
      const parsed = parseMask(input.value, this.mask(), this.tokens());
      const adjacent = backwards ? caret - 1 : caret;
      if (adjacent < 0 || adjacent >= input.value.length || parsed.positions.includes(adjacent + 1))
        return;
      const before = parsed.positions.filter((position) => position <= caret).length;
      const index = backwards ? before - 1 : before;
      if (index < 0 || index >= parsed.raw.length) return;
      event.preventDefault();
      const next = parseMask(
        parsed.raw.slice(0, index) + parsed.raw.slice(index + 1),
        this.mask(),
        this.tokens(),
      );
      this.value.set(this.valueFormat() === 'masked' ? next.masked : next.raw);
      input.value = next.masked;
      const position = next.positions[index - 1] ?? 0;
      input.setSelectionRange(position, position);
      return;
    }
    const deletion = deleteMaskSeparator(event, input);
    if (!deletion) return;
    this.value.set(
      this.valueFormat() === 'masked' ? formatMask(deletion.value, this.mask()) : deletion.value,
    );
    input.value = this.display();
    maskCaret(input, deletion.digitCaret);
  }
  protected update(event: Event): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    const element = event.target as HTMLInputElement;
    if (Object.keys(this.tokens()).length || this.valueFormat() === 'masked') {
      const before = parseMask(this.value(), this.mask(), this.tokens());
      const parsed = parseMask(element.value, this.mask(), this.tokens());
      const caret = parseMask(
        element.value.slice(0, element.selectionStart ?? element.value.length),
        this.mask(),
        this.tokens(),
      ).raw.length;
      this.value.set(this.valueFormat() === 'masked' ? parsed.masked : parsed.raw);
      if (!before.complete && parsed.complete) this.completed.emit(parsed.raw);
      element.value = parsed.masked;
      const position = parsed.positions[caret - 1] ?? 0;
      element.setSelectionRange(position, position);
      return;
    }
    const digitsBefore = normalizeIdentifier(
      element.value.slice(0, element.selectionStart ?? element.value.length),
    ).length;
    const capacity = this.mask().split('#').length - 1;
    const wasComplete = capacity > 0 && this.value().length === capacity;
    this.value.set(normalizeIdentifier(element.value).slice(0, capacity));
    if (!wasComplete && capacity > 0 && this.value().length === capacity)
      this.completed.emit(this.value());
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
