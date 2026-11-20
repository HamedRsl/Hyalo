import {
  ChangeDetectionStrategy,
  Component,
  afterRenderEffect,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
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
  /** Two-way editor state; closing externally discards the uncommitted draft. */
  readonly editing = model(false);
  protected readonly draft = linkedSignal({
    source: this.editing,
    computation: () => untracked(this.value),
  });
  protected readonly error = linkedSignal({ source: this.editing, computation: () => '' });
  private wasEditing = false;

  constructor() {
    super();
    afterRenderEffect(() => {
      const editing = this.editing();
      if (editing === this.wasEditing) return;
      this.wasEditing = editing;
      if (editing) this.element.querySelector<HTMLElement>('.control textarea,.control input')?.focus();
      else this.focus();
    });
  }
  protected begin(): void {
    if (this.blocked()) return;
    this.editing.set(true);
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

  }
  reset(): void {
    this.editing.set(false);

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
