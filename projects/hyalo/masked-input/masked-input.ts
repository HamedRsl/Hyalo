import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
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
  /** Defer partial edits until blur, or commit immediately when the mask becomes complete. */
  readonly commitOn = input<'input' | 'blur' | 'complete'>('input');
  private readonly draft = signal<{ raw: string; model: string; mask: string } | null>(null);
  private readonly current = computed(() => {
    const draft = this.draft();
    return draft && draft.model === this.value() && draft.mask === this.mask()
      ? draft.raw
      : this.value();
  });
  protected readonly inputMode = computed(() =>
    Object.keys(this.tokens()).length ? 'text' : 'numeric',
  );
  protected blur(event: Event): void {
    if (this.blocked()) {
      this.draft.set(null);
      return;
    }
    const parsed = parseMask(this.current(), this.mask(), this.tokens());
    if (!parsed.complete && this.incompletePolicy() === 'clear') {
      this.value.set('');
    } else if (this.commitOn() === 'blur' && this.draft()) {
      this.value.set(this.valueFormat() === 'masked' ? parsed.masked : parsed.raw);
    }
    this.draft.set(null);
    (event.target as HTMLInputElement).value = this.display();
  }

  protected readonly display = computed(() =>
    Object.keys(this.tokens()).length || this.valueFormat() === 'masked'
      ? parseMask(this.current(), this.mask(), this.tokens()).masked
      : formatMask(this.current(), this.mask()),
  );

  private publish(raw: string, masked: string, complete: boolean): void {
    if (this.commitOn() === 'input' || (this.commitOn() === 'complete' && (complete || !raw))) {
      this.draft.set(null);
      this.value.set(this.valueFormat() === 'masked' ? masked : raw);
    } else {
      this.draft.set({ raw, model: this.value(), mask: this.mask() });
    }
  }

  protected beforeDelete(event: Event): void {
    if (this.blocked() || !event.cancelable || event.defaultPrevented) return;
    const input = event.target as HTMLInputElement;
    if (Object.keys(this.tokens()).length) {
      const edit = event as InputEvent;
      const caret = input.selectionStart;
      if (edit.isComposing || caret === null || caret !== input.selectionEnd) return;
      const backwards = edit.inputType === 'deleteContentBackward';
      if (!backwards && edit.inputType !== 'deleteContentForward') return;
      const parsed = parseMask(input.value, this.mask(), this.tokens());
      const characters = Array.from(parsed.raw);
      const adjacent = backwards ? caret - 1 : caret;
      if (adjacent < 0 || adjacent >= input.value.length || parsed.positions.includes(adjacent + 1))
        return;
      const before = parsed.positions.filter((position) => position <= caret).length;
      const index = backwards ? before - 1 : before;
      if (index < 0 || index >= characters.length) return;
      event.preventDefault();
      characters.splice(index, 1);
      const next = parseMask(
        characters.join(''),
        this.mask(),
        this.tokens(),
      );
      this.publish(next.raw, next.masked, next.complete);
      input.value = next.masked;
      const position = next.positions[index - 1] ?? 0;
      input.setSelectionRange(position, position);
      return;
    }
    const deletion = deleteMaskSeparator(event, input);
    if (!deletion) return;
    const parsed = parseMask(deletion.value, this.mask(), this.tokens());
    this.publish(parsed.raw, parsed.masked, parsed.complete);
    input.value = this.display();
    maskCaret(input, deletion.digitCaret);
  }
  protected update(event: Event): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    const element = event.target as HTMLInputElement;
    if (Object.keys(this.tokens()).length || this.valueFormat() === 'masked') {
      const before = parseMask(this.current(), this.mask(), this.tokens());
      const parsed = parseMask(element.value, this.mask(), this.tokens());
      const caret = parseMask(
        element.value.slice(0, element.selectionStart ?? element.value.length),
        this.mask(),
        this.tokens(),
      ).positions.length;
      this.publish(parsed.raw, parsed.masked, parsed.complete);
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
    const wasComplete = capacity > 0 && this.current().length === capacity;
    const raw = normalizeIdentifier(element.value).slice(0, capacity);
    const complete = capacity > 0 && raw.length === capacity;
    this.publish(raw, formatMask(raw, this.mask()), complete);
    if (!wasComplete && complete) this.completed.emit(raw);
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
