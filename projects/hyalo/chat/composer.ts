import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { HyButton } from '@hyalo/angular/button';

export interface HyChatSubmission {
  readonly text: string;
  readonly files: readonly File[];
}
export interface HyChatFileRejection {
  readonly file: File;
  readonly reason: 'count' | 'size';
}
@Component({
  selector: 'hy-chat-composer',
  imports: [HyButton, CdkTextareaAutosize],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './composer.html',
  styleUrl: './chat.css',
})
export class HyChatComposer {
  readonly message = model('');
  readonly files = model<readonly File[]>([]);
  readonly disabled = input(false);
  readonly pending = input(false);
  readonly label = input('Message');
  readonly placeholder = input('Write a message');
  readonly sendLabel = input('Send');
  readonly attachLabel = input('Attach files');
  readonly removeLabel = input('Remove attachment');
  readonly allowAttachments = input(false);
  readonly accept = input('');
  readonly maxFiles = input(10);
  readonly maxFileSize = input<number>();
  readonly submitOnEnter = input(true);
  readonly clearOnSubmit = input(true);
  readonly submitted = output<HyChatSubmission>();
  readonly filesRejected = output<readonly HyChatFileRejection[]>();
  protected readonly canSend = computed(
    () => !this.disabled() && !this.pending() && (!!this.message().trim() || !!this.files().length),
  );
  send(event?: Event): void {
    event?.preventDefault();
    if (!this.canSend()) return;
    const submission = { text: this.message(), files: [...this.files()] };
    if (this.clearOnSubmit()) {
      this.message.set('');
      this.files.set([]);
    }
    this.submitted.emit(submission);
  }
  protected keys(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.submitOnEnter() && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      if (!event.repeat) this.send();
    }
  }
  protected edit(event: Event): void {
    if (!this.disabled() && !this.pending())
      this.message.set((event.target as HTMLTextAreaElement).value);
  }
  protected attach(event: Event): void {
    const control = event.target as HTMLInputElement;
    this.addFiles(Array.from(control.files ?? []));
    control.value = '';
  }
  addFiles(files: readonly File[]): void {
    if (this.disabled() || this.pending() || !this.allowAttachments()) return;
    const accepted = [...this.files()];
    const rejected: HyChatFileRejection[] = [];
    const max = Number.isFinite(this.maxFiles()) ? Math.max(0, Math.trunc(this.maxFiles())) : 10;
    const size = this.maxFileSize();
    for (const file of files) {
      if (size !== undefined && Number.isFinite(size) && file.size > Math.max(0, size))
        rejected.push({ file, reason: 'size' });
      else if (accepted.length >= max) rejected.push({ file, reason: 'count' });
      else accepted.push(file);
    }
    this.files.set(accepted);
    if (rejected.length) this.filesRejected.emit(rejected);
  }
  removeFile(index: number): void {
    if (!this.disabled() && !this.pending())
      this.files.update((files) => files.filter((_, position) => index !== position));
  }
}
