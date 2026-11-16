import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

@Component({
  selector: 'hy-inline-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './inline-edit.html',
  styleUrl: './inline-edit.css',
})
export class HyInlineEdit extends HyValueControl implements FormValueControl<string> {
  readonly value = model('');
  readonly multiline = input(false);
  readonly placeholder = input('Add text');
  readonly validate = input<(value: string) => string | undefined>(() => undefined);
  readonly saved = output<string>();
  protected readonly editing = signal(false);
  protected readonly draft = signal('');
  protected readonly error = signal('');
  protected begin(): void {
    if (this.blocked()) return;
    this.draft.set(this.value());
    this.error.set('');
    this.editing.set(true);
    queueMicrotask(() => this.element.querySelector<HTMLElement>('textarea,input')?.focus());
  }
  protected update(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }
  protected save(): void {
    if (this.blocked()) return;
    const error =
      this.validate()(this.draft()) ??
      (this.required() && !this.draft().trim() ? 'Enter a value.' : '');
    this.error.set(error);
    if (error) return;
    this.value.set(this.draft());
    this.saved.emit(this.draft());
    this.cancel();
  }
  protected cancel(): void {
    this.editing.set(false);
    this.error.set('');
    queueMicrotask(() => this.focus());
  }
  reset(): void {
    this.editing.set(false);
    this.draft.set(this.value());
    this.error.set('');
  }
  protected keys(event: KeyboardEvent): void {
    if (event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancel();
    } else if (event.key === 'Enter' && !this.multiline()) {
      event.preventDefault();
      this.save();
    }
  }
}
