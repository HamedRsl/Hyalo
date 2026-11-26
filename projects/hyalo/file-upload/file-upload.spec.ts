import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { HyFileUpload, type HyUploader } from './file-upload';

@Component({
  imports: [HyFileUpload],
  template: `
    <hy-file-upload
      [fileTemplate]="fileView"
      [toolbarTemplate]="toolbar"
      [emptyTemplate]="empty"
      [value]="files()"
      [uploader]="uploader()"
      [labels]="labels"
    />
    <ng-template #fileView let-file let-state="state"
      ><span class="file">{{ file.name }} · {{ state.status }}</span></ng-template
    >
    <ng-template #toolbar let-files let-upload="upload">
      <button type="button" class="transfer" (click)="upload()">
        {{ files.length }} seleccionado
      </button>
    </ng-template>
    <ng-template #empty><p class="empty">Sin archivos</p></ng-template>
  `,
})
class UploadTemplateHost {
  readonly files = signal<readonly File[]>([]);
  readonly labels = {
    cancel: 'Cancelar carga',
    retry: 'Reintentar',
    status: { uploading: 'Subiendo', error: 'Error de carga', success: 'Listo' },
    progress: (file: File) => 'Progreso de ' + file.name,
  };
  readonly uploader = signal<HyUploader>(async () => undefined);
}
describe('file validation', () => {
  it('provides typed template contexts, localized progress controls and ordered lifecycle payloads', async () => {
    const fixture = TestBed.createComponent(UploadTemplateHost);
    const host = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance;
    const control = () =>
      fixture.debugElement.query(By.directive(HyFileUpload)).componentInstance as HyFileUpload;
    await fixture.whenStable();
    expect(host.querySelector('.empty')?.textContent).toBe('Sin archivos');
    const file = new File(['hi'], 'photo.png', { type: 'image/png' });
    component.files.set([file]);
    const reports: Parameters<HyUploader>[1][] = [];
    const reject: ((reason: unknown) => void)[] = [];
    const resolve: ((value: unknown) => void)[] = [];
    component.uploader.set((_file, context) =>
      new Promise((done, fail) => {
        reports.push(context);
        resolve.push(done);
        reject.push(fail);
      }));
    await fixture.whenStable();
    const events: unknown[] = [];
    const upload = control();
    expect(upload.value()).toEqual([file]);
    expect(upload.uploader()).toBe(component.uploader());
    upload.uploadStarted.subscribe((item) => events.push(['started', item]));
    upload.uploadProgress.subscribe((state) => events.push(['progress', state.progress]));
    upload.uploadCancelled.subscribe((item) => events.push(['cancelled', item]));
    upload.uploadFailed.subscribe((state) => events.push(['error', state.error]));
    upload.uploadCompleted.subscribe((state) => events.push(['completed', state.response]));
    host.querySelector<HTMLButtonElement>('.transfer')!.click();
    expect(reports).toHaveLength(1);
    expect(upload.state(file).status).toBe('uploading');
    reports[0]?.progress(1, 4);
    await fixture.whenStable();
    expect(host.querySelector('.file')?.textContent).toBe('photo.png · uploading');
    expect(host.querySelector('progress')?.getAttribute('aria-label')).toBe(
      'Progreso de photo.png',
    );
    expect(host.querySelector('progress')?.value).toBe(25);
    const button = (text: string) =>
      [...host.querySelectorAll('button')].find((item) => item.textContent?.trim() === text)!;
    button('Cancelar carga').click();
    expect(reports[0]?.signal.aborted).toBe(true);
    resolve[0]?.('stale');
    await fixture.whenStable();
    button('Reintentar').click();
    const failure = new Error('offline');
    reject[1]?.(failure);
    await fixture.whenStable();
    expect(host.textContent).toContain('Error de carga');
    button('Reintentar').click();
    resolve[2]?.({ id: 'success' });
    await fixture.whenStable();
    expect(host.textContent).toContain('Listo');
    expect(events).toEqual([
      ['started', file],
      ['progress', 25],
      ['cancelled', file],
      ['started', file],
      ['error', failure],
      ['started', file],
      ['completed', { id: 'success' }],
    ]);
  });
  it('applies the same restrictions to files supplied by an external picker', async () => {
    const fixture = TestBed.createComponent(HyFileUpload);
    fixture.componentRef.setInput('accept', 'image/*');
    await fixture.whenStable();
    const upload = fixture.componentInstance;
    const image = new File(['image'], 'photo.png', { type: 'image/png' });
    const rejected = vi.fn();
    upload.rejected.subscribe(rejected);
    upload.addFiles([new File(['text'], 'note.txt', { type: 'text/plain' }), image]);
    expect(upload.value()).toEqual([image]);
    expect(rejected).toHaveBeenCalledOnce();
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    upload.addFiles([new File(['image'], 'another.png', { type: 'image/png' })]);
    expect(upload.value()).toEqual([image]);
  });
  it('cancels transport, ignores stale progress/results and retries without changing selected files', async () => {
    const fixture = TestBed.createComponent(HyFileUpload);
    const file = new File(['data'], 'report.pdf');
    fixture.componentRef.setInput('value', [file]);
    const requests: {
      signal: AbortSignal;
      progress: (loaded: number, total?: number) => void;
      resolve: (value: unknown) => void;
      reject: (error: unknown) => void;
    }[] = [];
    fixture.componentRef.setInput(
      'uploader',
      (
        _file: File,
        context: { signal: AbortSignal; progress: (loaded: number, total?: number) => void },
      ) => new Promise((resolve, reject) => requests.push({ ...context, resolve, reject })),
    );
    await fixture.whenStable();
    const upload = fixture.componentInstance;
    const first = upload.upload(file);
    requests[0]!.progress(1, 4);
    expect(upload.state(file).progress).toBe(25);
    upload.cancel(file);
    expect(requests[0]!.signal.aborted).toBe(true);
    const second = upload.upload(file);
    requests[0]!.progress(4, 4);
    requests[0]!.resolve('stale');
    await first;
    expect(upload.state(file).status).toBe('uploading');
    expect(upload.state(file).progress).toBe(0);
    requests[1]!.reject(new Error('offline'));
    await second;
    expect(upload.state(file).status).toBe('error');
    const third = upload.upload(file);
    requests[2]!.resolve('ok');
    await third;
    expect(upload.state(file)).toMatchObject({ status: 'success', progress: 100, response: 'ok' });
    expect(upload.value()).toEqual([file]);
    const fourth = upload.upload(file);
    fixture.destroy();
    expect(requests[3]!.signal.aborted).toBe(true);
    requests[3]!.resolve('late');
    await fourth;
  });
  it('transforms asynchronously before validating and abandons superseded preparations', async () => {
    const fixture = TestBed.createComponent(HyFileUpload);
    const pending: { signal: AbortSignal; resolve: (value: File | boolean) => void }[] = [];
    fixture.componentRef.setInput('accept', '.pdf');
    fixture.componentRef.setInput(
      'beforeAdd',
      (_file: File, signal: AbortSignal) =>
        new Promise<File | boolean>((resolve) => pending.push({ signal, resolve })),
    );
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const choose = (file: File): void => {
      Object.defineProperty(input, 'files', { configurable: true, value: [file] });
      input.dispatchEvent(new Event('change'));
    };
    choose(new File(['old'], 'old.txt'));
    choose(new File(['new'], 'new.txt'));
    expect(pending[0]!.signal.aborted).toBe(true);
    const transformed = new File(['pdf'], 'converted.pdf');
    pending[1]!.resolve(transformed);
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([transformed]);
    expect(fixture.componentInstance.preparing()).toBe(false);
    pending[0]!.resolve(new File(['stale'], 'stale.pdf'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([transformed]);
  });
  it('honors asynchronous removal vetoes and exposes preview/download failures', async () => {
    const fixture = TestBed.createComponent(HyFileUpload);
    const file = new File(['pdf'], 'report.pdf');
    fixture.componentRef.setInput('value', [file]);
    fixture.componentRef.setInput('beforeRemove', async () => false);
    fixture.componentRef.setInput('previewFile', async () => 'https://example.test/preview.png');
    fixture.componentRef.setInput('downloadFile', async () => {
      throw new Error('offline');
    });
    fixture.componentRef.setInput('directory', true);
    fixture.componentRef.setInput('labels', {
      remove: 'Delete',
      preview: 'View',
      download: 'Save',
    });
    await fixture.whenStable();
    const upload = fixture.componentInstance;
    expect(fixture.nativeElement.querySelector('input').hasAttribute('webkitdirectory')).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label="Delete report.pdf"]')).not.toBeNull();
    expect(await upload.removeFile(file)).toBe(false);
    await upload.preview(file);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe(
      'https://example.test/preview.png',
    );
    const errors: unknown[] = [];
    upload.actionFailed.subscribe((event) => errors.push(event));
    await upload.download(file);
    expect(errors).toEqual([{ file, error: new Error('offline') }]);
    fixture.componentRef.setInput('beforeRemove', async () => true);
    expect(await upload.removeFile(file)).toBe(true);
    await fixture.whenStable();
    expect(upload.value()).toEqual([]);
    expect(upload.states()).toEqual([]);
  });
  it('preserves an accepted file when a replacement is rejected', async () => {
    const fixture = TestBed.createComponent(HyFileUpload);
    const previous = new File(['ok'], 'accepted.pdf');
    fixture.componentRef.setInput('value', [previous]);
    fixture.componentRef.setInput('accept', '.pdf');
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['x'], 'wrong.txt')],
    });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([previous]);
  });
  it('applies accept, byte size, count limits, removal, and disabled state', async () => {
    const fixture = TestBed.createComponent(HyFileUpload);
    fixture.componentRef.setInput('accept', '.pdf');
    fixture.componentRef.setInput('maxSize', 5);
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('maxFiles', 1);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [
        new File(['ok'], 'one.pdf'),
        new File(['other'], 'two.pdf'),
        new File(['x'], 'x.txt'),
        new File(['too large'], 'big.pdf'),
      ],
    });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value().map((file) => file.name)).toEqual(['one.pdf']);
    expect(fixture.nativeElement.textContent).toContain('file limit reached');
    expect(fixture.nativeElement.textContent).toContain('not accepted');
    expect(fixture.nativeElement.textContent).toContain('too large');
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    fixture.componentRef.setInput('disabled', false);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([]);
  });
});

it('traverses nested directory drops across batches and preserves relative paths', async () => {
  const fixture = TestBed.createComponent(HyFileUpload);
  fixture.componentRef.setInput('directory', true);
  fixture.componentRef.setInput('multiple', true);
  await fixture.whenStable();
  const entry = (path: string) => ({
    isFile: true, isDirectory: false, fullPath: path,
    file: (resolve: (file: File) => void) => resolve(new File(['x'], 'notes.txt', { lastModified: 0 })),
  });
  const nested = {
    isDirectory: true,
    createReader: () => {
      const batches = [[entry('/folder/nested/notes.txt')], []];
      return { readEntries: (resolve: (batch: unknown[]) => void) => resolve(batches.shift() ?? []) };
    },
  };
  const root = {
    isDirectory: true,
    createReader: () => {
      const batches = [[entry('/folder/notes.txt')], [nested], []];
      return { readEntries: (resolve: (batch: unknown[]) => void) => resolve(batches.shift() ?? []) };
    },
  };
  const event = new Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { items: [{ webkitGetAsEntry: () => root }], files: [] } });
  fixture.nativeElement.querySelector('.dropzone').dispatchEvent(event);
  await vi.waitFor(() => expect(fixture.componentInstance.value().map((file) => file.webkitRelativePath)).toEqual([
    'folder/notes.txt', 'folder/nested/notes.txt',
  ]));
});
