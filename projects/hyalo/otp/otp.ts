import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
import { normalizeIdentifier } from '@hyalo/angular/core';
@Component({
  selector: 'hy-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './otp.html',
  styleUrl: './otp.css',
})
export class HyOtp extends HyValueControl implements FormValueControl<string> {
  readonly value = model('');
  readonly length = input(6);
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
      normalizeIdentifier(event.clipboardData?.getData('text') ?? '') +
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
    const position = normalizeIdentifier(input.value.slice(0, caret)).length;
    const next = normalizeIdentifier(input.value).slice(0, this.count());
    const changed = next !== this.value();
    input.value = next;
    input.setSelectionRange(Math.min(position, next.length), Math.min(position, next.length));
    this.value.set(next);
    if (changed && next.length === this.count()) this.complete.emit(next);
  }
}
