import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  afterRenderEffect,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

export interface HyInlineDisplayContext {
  readonly $implicit: string;
}
export interface HyInlineEditorContext {
  readonly $implicit: string;
  readonly update: (value: string) => void;
  readonly save: () => void;
  readonly cancel: () => void;
  readonly disabled: boolean;
  readonly readonly: boolean;
  readonly error: string;
}

@Component({
  selector: 'hy-inline-edit',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './inline-edit.html',
  styleUrl: './inline-edit.css',
})
export class HyInlineEdit extends HyValueControl implements FormValueControl<string> {
  readonly value = model('');
  readonly displayTemplate = input<TemplateRef<HyInlineDisplayContext> | null>(null);
  readonly editorTemplate = input<TemplateRef<HyInlineEditorContext> | null>(null);
  protected readonly editorContext = computed<HyInlineEditorContext>(() => ({
    $implicit: this.draft(),
    update: (value) => {
      if (!this.blocked()) this.draft.set(value);
    },
    save: () => this.save(),
    cancel: () => this.cancel(),
    disabled: this.effectiveDisabled(),
    readonly: this.readonly(),
    error: this.error(),
  }));
  readonly multiline = input(false);
  readonly placeholder = input('Add text');
  readonly validate = input<(value: string) => string | undefined>(() => undefined);
  readonly saved = output<string>();
  readonly opened = output<void>();
  readonly closed = output<void>();
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
      if (editing) {
        this.element.querySelector<HTMLElement>('.control textarea,.control input')?.focus();
        this.opened.emit();
      } else {
        this.focus();
        this.closed.emit();
      }
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
