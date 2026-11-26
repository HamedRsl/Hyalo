import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
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
  readonly directoryError?: string;
  readonly choose?: string;
  readonly remove?: string;
  readonly preview?: string;
  readonly download?: string;
  readonly upload?: string;
  readonly uploadAll?: string;
  readonly retry?: string;
  readonly cancel?: string;
  readonly status?: Partial<Readonly<Record<HyUploadState['status'], string>>>;
  readonly progress?: (file: File) => string;
  readonly help?: (maxSize: number) => string;
  readonly invalidType?: (file: File) => string;
  readonly tooLarge?: (file: File) => string;
  readonly tooMany?: (file: File) => string;
}
export interface HyUploadFileContext {
  readonly $implicit: File;
  readonly state: HyUploadState;
}
export interface HyUploadToolbarContext {
  readonly $implicit: readonly File[];
  readonly upload: (file?: File) => Promise<void>;
}
const UPLOAD_STATUS: Readonly<Record<HyUploadState['status'], string>> = {
  idle: 'Ready',
  uploading: 'Uploading',
  success: 'Completed',
  error: 'Upload failed',
  cancelled: 'Cancelled',
};

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
  readonly beforeAdd =
    input<(file: File, signal: AbortSignal) => boolean | File | Promise<boolean | File>>();
  readonly beforeRemove = input<(file: File) => boolean | Promise<boolean>>();
  readonly previewFile = input<(file: File) => string | Promise<string>>();
  readonly downloadFile = input<(file: File) => void | Promise<void>>();
  readonly labels = input<HyUploadLabels>({});
  readonly fileTemplate = input<TemplateRef<HyUploadFileContext>>();
  readonly toolbarTemplate = input<TemplateRef<HyUploadToolbarContext>>();
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
  protected readonly runUpload = (file?: File): Promise<void> => this.upload(file);
  protected readonly readyFiles = computed(() =>
    this.value().filter((file) => {
      const status = this.state(file).status;
      return status !== 'uploading' && status !== 'success';
    }),
  );
  private readonly requests = new Map<File, AbortController>();
  private preparation: AbortController | undefined;
  private traversal?: AbortController;
  private generation = 0;
  private destroyed = false;
  constructor() {
    super();
    effect(() => {
      const files = this.value();
      for (const file of this.requests.keys()) if (!files.includes(file)) this.cancel(file);
      this.states.update((states) => states.filter((state) => files.includes(state.file)));
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.reset();
    });
  }
  protected readonly dragging = signal(false);
  protected readonly messages = signal<readonly string[]>([]);
  protected statusLabel(status: HyUploadState['status']): string {
    return this.labels().status?.[status] ?? UPLOAD_STATUS[status];
  }
  protected uploadReady(): void {
    for (const file of this.readyFiles()) void this.upload(file);
  }
  protected browse(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
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
    const transfer = event.dataTransfer;
    if (!transfer || this.blocked()) return;
    this.traversal?.abort();
    const entries = this.directory()
      ? Array.from(transfer.items ?? [])
          .map((item) => item.webkitGetAsEntry?.())
          .filter((entry) => entry != null)
      : [];
    if (!entries.some((entry) => entry.isDirectory)) {
      this.addFiles(Array.from(transfer.files));
      return;
    }
    const controller = (this.traversal = new AbortController());
    const files: File[] = [];
    void this.readEntries(entries, files, controller.signal)
      .then(
        () => {
          if (!controller.signal.aborted && !this.destroyed) this.addFiles(files);
        },
        () => {
          if (!controller.signal.aborted && !this.destroyed) {
            const errors = [this.labels().directoryError ?? 'Could not read this folder.'];
            this.messages.set(errors);
            this.rejected.emit(errors);
          }
        },
      )
      .finally(() => {
        if (this.traversal === controller) this.traversal = undefined;
      });
  }
  private async readEntries(
    entries: readonly FileSystemEntry[],
    files: File[],
    signal: AbortSignal,
  ): Promise<void> {
    const pending = [...entries].reverse();
    while (pending.length) {
      signal.throwIfAborted();
      const entry = pending.pop();
      if (!entry) continue;
      if (entry.isFile) {
        const file = await new Promise<File>((resolve, reject) =>
          (entry as FileSystemFileEntry).file(resolve, reject),
        );
        Object.defineProperty(file, 'webkitRelativePath', {
          value: entry.fullPath.replace(/^\//, ''),
        });
        files.push(file);
      } else if (entry.isDirectory) {
        const reader = (entry as FileSystemDirectoryEntry).createReader();
        const children: FileSystemEntry[] = [];
        for (;;) {
          signal.throwIfAborted();
          const batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
            reader.readEntries(resolve, reject),
          );
          if (!batch.length) break;
          children.push(...batch);
        }
        for (const child of children.reverse()) pending.push(child);
      }
    }
  }
  protected remove(index: number): void {
    const file = this.value()[index];
    if (file) void this.removeFile(file);
  }
  async removeFile(file: File): Promise<boolean> {
    if (this.blocked()) return false;
    try {
      if ((await this.beforeRemove()?.(file)) === false || this.destroyed || this.blocked())
        return false;
      this.cancel(file);
      this.value.update((files) => files.filter((item) => item !== file));
      return true;
    } catch (error) {
      this.actionFailed.emit({ file, error });
      return false;
    }
  }
  state(file: File): HyUploadState {
    return (
      this.states().find((state) => state.file === file) ?? { file, status: 'idle', progress: null }
    );
  }
  private update(file: File, patch: Partial<HyUploadState>): HyUploadState {
    const state = { ...this.state(file), ...patch, file };
    this.states.update((states) => [...states.filter((item) => item.file !== file), state]);
    return state;
  }
  async upload(file?: File): Promise<void> {
    const uploader = this.uploader();
    if (!uploader || this.blocked() || this.destroyed) return;
    const files = file ? [file] : [...this.value()];
    await Promise.all(
      files.map(async (item) => {
        if (!this.value().includes(item) || this.requests.has(item)) return;
        const controller = new AbortController();
        this.requests.set(item, controller);
        this.update(item, {
          status: 'uploading',
          progress: 0,
          response: undefined,
          error: undefined,
        });
        const current = (): boolean =>
          !this.destroyed &&
          !controller.signal.aborted &&
          this.requests.get(item) === controller &&
          this.value().includes(item);
        this.uploadStarted.emit(item);
        if (!current()) return;
        try {
          const response = await uploader(item, {
            signal: controller.signal,
            progress: (loaded, total) => {
              if (!current()) return;
              const progress =
                total && total > 0 && Number.isFinite(total) && Number.isFinite(loaded)
                  ? Math.max(0, Math.min(100, (loaded / total) * 100))
                  : null;
              this.uploadProgress.emit(this.update(item, { progress }));
            },
          });
          if (current())
            this.uploadCompleted.emit(
              this.update(item, { status: 'success', progress: 100, response }),
            );
        } catch (error) {
          if (current()) this.uploadFailed.emit(this.update(item, { status: 'error', error }));
        } finally {
          if (this.requests.get(item) === controller) this.requests.delete(item);
        }
      }),
    );
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
      if (url && !this.destroyed && this.value().includes(file))
        this.update(file, { previewUrl: url });
    } catch (error) {
      if (!this.destroyed) this.actionFailed.emit({ file, error });
    }
  }
  async download(file: File): Promise<void> {
    try {
      await this.downloadFile()?.(file);
    } catch (error) {
      if (!this.destroyed) this.actionFailed.emit({ file, error });
    }
  }
  reset(): void {
    this.generation++;
    this.traversal?.abort();
    this.preparation?.abort();
    this.preparing.set(false);
    for (const file of this.requests.keys()) this.cancel(file);
    this.messages.set([]);
    this.dragging.set(false);
  }
  /** Queue files from a host-owned picker using the same validation as browse and drop. */
  addFiles(incoming: readonly File[]): void {
    if (!incoming.length || this.destroyed || this.blocked()) return;
    const beforeAdd = this.beforeAdd();
    if (!beforeAdd) {
      this.acceptFiles(incoming);
      return;
    }
    this.preparation?.abort();
    const controller = (this.preparation = new AbortController());
    const generation = ++this.generation;
    this.preparing.set(true);
    void Promise.all(
      incoming.map(async (file) => {
        try {
          const result = await beforeAdd(file, controller.signal);
          return result === false ? null : result instanceof File ? result : file;
        } catch (error) {
          if (!controller.signal.aborted && !this.destroyed)
            this.actionFailed.emit({ file, error });
          return null;
        }
      }),
    ).then((files) => {
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
      if (!accepted)
        errors.push(
          this.labels().invalidType?.(file) ?? file.name + ': file type is not accepted.',
        );
      else if (file.size > this.maxSize())
        errors.push(this.labels().tooLarge?.(file) ?? file.name + ': file is too large.');
      else if (next.length >= (this.multiple() ? this.maxFiles() : 1))
        errors.push(this.labels().tooMany?.(file) ?? file.name + ': file limit reached.');
      else if (
        !next.some(
          (item) =>
            item.name === file.name &&
            item.webkitRelativePath === file.webkitRelativePath &&
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
