import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

@Component({
  selector: 'hy-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
})
export class HyFileUpload extends HyValueControl implements FormValueControl<readonly File[]> {
  readonly value = model<readonly File[]>([]);
  readonly accept = input('');
  readonly multiple = input(false);
  readonly maxSize = input(10 * 1024 * 1024);
  readonly maxFiles = input(5);
  readonly rejected = output<readonly string[]>();
  protected readonly dragging = signal(false);
  protected readonly messages = signal<readonly string[]>([]);
  protected browse(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.add(Array.from(input.files ?? []));
    input.value = '';
  }
  protected drag(event: DragEvent, entered: boolean): void {
    event.preventDefault();
    if (this.blocked()) return;
    this.dragging.set(entered);
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }
  protected drop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (!this.blocked()) this.add(Array.from(event.dataTransfer?.files ?? []));
  }
  protected remove(index: number): void {
    if (!this.blocked()) this.value.update((files) => files.filter((_, i) => i !== index));
  }
  reset(): void {
    this.messages.set([]);
    this.dragging.set(false);
  }
  private add(incoming: readonly File[]): void {
    if (this.blocked()) return;
    const next = this.multiple() ? [...this.value()] : [];
    const errors: string[] = [];
    const patterns = this.accept()
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    for (const file of incoming) {
      const accepted =
        !patterns.length ||
        patterns.some((pattern) =>
          pattern.startsWith('.')
            ? file.name.toLowerCase().endsWith(pattern)
            : pattern.endsWith('/*')
              ? file.type.toLowerCase().startsWith(pattern.slice(0, -1))
              : file.type.toLowerCase() === pattern,
        );
      if (!accepted) errors.push(file.name + ': file type is not accepted.');
      else if (file.size > this.maxSize()) errors.push(file.name + ': file is too large.');
      else if (next.length >= (this.multiple() ? this.maxFiles() : 1))
        errors.push(file.name + ': file limit reached.');
      else if (
        !next.some(
          (item) =>
            item.name === file.name &&
            item.size === file.size &&
            item.lastModified === file.lastModified,
        )
      )
        next.push(file);
    }
    if (this.multiple() || next.length) this.value.set(next);
    this.messages.set(errors);
    if (errors.length) this.rejected.emit(errors);
  }
}
