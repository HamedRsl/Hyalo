import { ChangeDetectionStrategy, Component, DestroyRef, TemplateRef, booleanAttribute, effect, inject, input, model, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

export interface HyUploadContext {
  readonly signal: AbortSignal;
  readonly progress: (loaded: number, total?: number) => void;
}
export type HyUploader = (file: File, context: HyUploadContext) => Promise<unknown>;
export interface HyUploadState {
  readonly file: File;
  readonly status: 'idle' | 'uploading' | 'success' | 'error' | 'cancelled';
  readonly progress: number | null;
  readonly response?: unknown;
  readonly error?: unknown;
  readonly previewUrl?: string;
}
export interface HyUploadLabels {
  readonly choose?: string;
  readonly remove?: string;
  readonly preview?: string;
  readonly download?: string;
  readonly help?: (maxSize: number) => string;
  readonly invalidType?: (file: File) => string;
  readonly tooLarge?: (file: File) => string;
  readonly tooMany?: (file: File) => string;
}

@Component({
  selector: 'hy-file-upload',
  imports: [NgTemplateOutlet],
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
  readonly directory = input(false, { transform: booleanAttribute });
  readonly uploader = input<HyUploader>();
  readonly beforeAdd = input<(file: File, signal: AbortSignal) => boolean | File | Promise<boolean | File>>();
  readonly beforeRemove = input<(file: File) => boolean | Promise<boolean>>();
  readonly previewFile = input<(file: File) => string | Promise<string>>();
  readonly downloadFile = input<(file: File) => void | Promise<void>>();
  readonly labels = input<HyUploadLabels>({});
  readonly fileTemplate = input<TemplateRef<unknown>>();
  readonly toolbarTemplate = input<TemplateRef<unknown>>();
  readonly emptyTemplate = input<TemplateRef<unknown>>();
  readonly uploadStarted = output<File>();
  readonly uploadProgress = output<HyUploadState>();
  readonly uploadCompleted = output<HyUploadState>();
  readonly uploadFailed = output<HyUploadState>();
  readonly uploadCancelled = output<File>();
  readonly actionFailed = output<{ file: File; error: unknown }>();
  readonly previewRequested = output<File>();
  readonly states = signal<readonly HyUploadState[]>([]);
  readonly preparing = signal(false);
  private readonly requests = new Map<File, AbortController>();
  private preparation: AbortController | undefined;
  private generation = 0;
  private destroyed = false;
  constructor() {
    super();
    effect(() => {
      const files = this.value();
      for (const file of this.requests.keys()) if (!files.includes(file)) this.cancel(file);
      this.states.update((states) => states.filter((state) => files.includes(state.file)));
    });
    inject(DestroyRef).onDestroy(() => { this.destroyed = true; this.reset(); });
  }
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
  protected remove(index: number): void { const file = this.value()[index]; if (file) void this.removeFile(file); }
  async removeFile(file: File): Promise<boolean> {
    if (this.blocked()) return false;
    try {
      if ((await this.beforeRemove()?.(file)) === false || this.destroyed || this.blocked()) return false;
      this.cancel(file);
      this.value.update((files) => files.filter((item) => item !== file));
      return true;
    } catch (error) { this.actionFailed.emit({ file, error }); return false; }
  }
  state(file: File): HyUploadState { return this.states().find((state) => state.file === file) ?? { file, status: 'idle', progress: null }; }
  private update(file: File, patch: Partial<HyUploadState>): HyUploadState {
    const state = { ...this.state(file), ...patch, file };
    this.states.update((states) => [...states.filter((item) => item.file !== file), state]);
    return state;
  }
  async upload(file?: File): Promise<void> {
    const uploader = this.uploader();
    if (!uploader || this.blocked() || this.destroyed) return;
    const files = file ? [file] : [...this.value()];
    await Promise.all(files.map(async (item) => {
      if (!this.value().includes(item) || this.requests.has(item)) return;
      const controller = new AbortController();
      this.requests.set(item, controller);
      this.update(item, { status: 'uploading', progress: 0, response: undefined, error: undefined });
      this.uploadStarted.emit(item);
      const current = (): boolean => !this.destroyed && !controller.signal.aborted && this.requests.get(item) === controller && this.value().includes(item);
      try {
        const response = await uploader(item, {
          signal: controller.signal,
          progress: (loaded, total) => {
            if (!current()) return;
            const progress = total && total > 0 ? Math.max(0, Math.min(100, loaded / total * 100)) : null;
            this.uploadProgress.emit(this.update(item, { progress }));
          },
        });
        if (current()) this.uploadCompleted.emit(this.update(item, { status: 'success', progress: 100, response }));
      } catch (error) {
        if (current()) this.uploadFailed.emit(this.update(item, { status: 'error', error }));
      } finally { if (this.requests.get(item) === controller) this.requests.delete(item); }
    }));
  }
  cancel(file: File): void {
    const request = this.requests.get(file);
    if (!request) return;
    this.requests.delete(file);
    request.abort();
    this.update(file, { status: 'cancelled' });
    if (!this.destroyed) this.uploadCancelled.emit(file);
  }
  async preview(file: File): Promise<void> {
    this.previewRequested.emit(file);
    try {
      const url = await this.previewFile()?.(file);
      if (url && !this.destroyed && this.value().includes(file)) this.update(file, { previewUrl: url });
    } catch (error) { if (!this.destroyed) this.actionFailed.emit({ file, error }); }
  }
  async download(file: File): Promise<void> {
    try { await this.downloadFile()?.(file); }
    catch (error) { if (!this.destroyed) this.actionFailed.emit({ file, error }); }
  }
  reset(): void {
    this.generation++;
    this.preparation?.abort();
    this.preparing.set(false);
    for (const file of this.requests.keys()) this.cancel(file);
    this.messages.set([]);
    this.dragging.set(false);
  }
  private add(incoming: readonly File[]): void {
    if (this.blocked()) return;
    const beforeAdd = this.beforeAdd();
    if (!beforeAdd) { this.acceptFiles(incoming); return; }
    this.preparation?.abort();
    const controller = this.preparation = new AbortController();
    const generation = ++this.generation;
    this.preparing.set(true);
    void Promise.all(incoming.map(async (file) => {
      try { const result = await beforeAdd(file, controller.signal); return result === false ? null : result instanceof File ? result : file; }
      catch (error) { if (!controller.signal.aborted && !this.destroyed) this.actionFailed.emit({ file, error }); return null; }
    })).then((files) => {
      if (controller.signal.aborted || this.destroyed || generation !== this.generation) return;
      this.preparing.set(false);
      if (!this.blocked()) this.acceptFiles(files.filter((file): file is File => file !== null));
    });
  }
  private acceptFiles(incoming: readonly File[]): void {
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
      if (!accepted) errors.push(this.labels().invalidType?.(file) ?? file.name + ': file type is not accepted.');
      else if (file.size > this.maxSize()) errors.push(this.labels().tooLarge?.(file) ?? file.name + ': file is too large.');
      else if (next.length >= (this.multiple() ? this.maxFiles() : 1))
        errors.push(this.labels().tooMany?.(file) ?? file.name + ': file limit reached.');
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
