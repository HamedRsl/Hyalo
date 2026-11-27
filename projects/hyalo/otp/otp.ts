import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
import { normalizeDigits } from '@hyalo/angular/core';
@Component({
  selector: 'hy-otp',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './otp.html',
  styleUrl: './otp.css',
})
export class HyOtp extends HyValueControl implements FormValueControl<string> {
  readonly value = model('');
  readonly length = input(6);
  readonly masked = input(false);
  readonly mode = input<'numeric' | 'alphanumeric'>('numeric');
  readonly inputMode = input<'single' | 'per-character'>('single');
  readonly formatter = input<(text: string) => string>();
  readonly cellTemplate = input<TemplateRef<{ $implicit: string; index: number }>>();
  protected readonly cells = computed(() =>
    Array.from({ length: this.count() }, (_, index) => ({
      $implicit: this.masked() && this.value()[index] ? '•' : (this.value()[index] ?? ''),
      index,
    })),
  );
  private normalize(text: string): string {
    const value = normalizeDigits(text);
    return this.mode() === 'numeric'
      ? value.replace(/[^0-9]/gu, '')
      : value.replace(/[^a-zA-Z0-9]/gu, '');
  }
  readonly complete = output<string>();
  protected readonly count = computed(() =>
    Math.min(12, Math.max(1, Math.floor(this.length()) || 6)),
  );
  protected paste(event: ClipboardEvent): void {
    if (this.blocked()) return;
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? 0,
      end = input.selectionEnd ?? start;
    input.value =
      input.value.slice(0, start) +
      (event.clipboardData?.getData('text') ?? '') +
      input.value.slice(end);
    input.setSelectionRange(input.value.length, input.value.length);
    this.commit(input);
  }
  protected update(event: Event): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    const input = event.target as HTMLInputElement;
    this.commit(input);
  }
  private commit(input: HTMLInputElement): void {
    const caret = input.selectionStart ?? input.value.length;
    const formatter = this.formatter();
    const formatted = formatter ? formatter(input.value) : input.value;
    const position = formatter
      ? this.normalize(formatted).length
      : this.normalize(input.value.slice(0, caret)).length;
    const next = this.normalize(formatted).slice(0, this.count());
    input.value = next;
    input.setSelectionRange(Math.min(position, next.length), Math.min(position, next.length));
    this.publish(next);
  }

  protected slotInput(event: Event, index: number): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    const input = event.target as HTMLInputElement;
    this.writeSlot(input, index, input.value);
  }

  protected slotPaste(event: ClipboardEvent, index: number): void {
    if (this.blocked()) return;
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    if (text) this.writeSlot(event.target as HTMLInputElement, index, text);
  }

  protected slotKey(event: KeyboardEvent, index: number): void {
    if (this.blocked() || event.isComposing) return;
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      event.preventDefault();
      this.writeSlot(input, index - 1, '');
      this.focusSlot(input, index - 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.focusSlot(input, index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  }

  private writeSlot(input: HTMLInputElement, index: number, raw: string): void {
    const code = this.value();
    const position = Math.min(index, code.length);
    const text = this.normalize(this.formatter()?.(raw) ?? raw);
    const next = (text.length >= this.count() ? text : code.slice(0, position) + text +
      code.slice(position + Math.max(1, text.length))).slice(0, this.count());
    input.value = next[index] ?? '';
    this.publish(next);
    if (text) this.focusSlot(input, Math.min(this.count() - 1, position + text.length));
  }

  private focusSlot(input: HTMLInputElement, index: number): void {
    input.parentElement?.querySelectorAll<HTMLInputElement>('input')[index]?.focus();
  }

  private publish(next: string): void {
    const changed = next !== this.value();
    this.value.set(next);
    if (changed && next.length === this.count()) this.complete.emit(next);
  }
}
