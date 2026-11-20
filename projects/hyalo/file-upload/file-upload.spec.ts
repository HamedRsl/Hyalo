import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyFileUpload } from './file-upload';
describe('file validation', () => {
  it('cancels transport, ignores stale progress/results and retries without changing selected files', async () => {
    const fixture = TestBed.createComponent(HyFileUpload);
    const file = new File(['data'], 'report.pdf');
    fixture.componentRef.setInput('value', [file]);
    const requests: {signal: AbortSignal; progress: (loaded: number, total?: number) => void; resolve: (value: unknown) => void; reject: (error: unknown) => void}[] = [];
    fixture.componentRef.setInput('uploader', (_file: File, context: {signal: AbortSignal; progress: (loaded: number, total?: number) => void}) =>
      new Promise((resolve, reject) => requests.push({...context, resolve, reject})));
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
    expect(upload.state(file)).toMatchObject({status: 'success', progress: 100, response: 'ok'});
    expect(upload.value()).toEqual([file]);
    const fourth = upload.upload(file);
    fixture.destroy();
    expect(requests[3]!.signal.aborted).toBe(true);
    requests[3]!.resolve('late');
    await fourth;
  });
  it('transforms asynchronously before validating and abandons superseded preparations', async () => {
    const fixture = TestBed.createComponent(HyFileUpload);
    const pending: {signal:AbortSignal;resolve:(value:File|boolean)=>void}[] = [];
    fixture.componentRef.setInput('accept','.pdf');
    fixture.componentRef.setInput('beforeAdd',(_file:File,signal:AbortSignal)=>new Promise<File|boolean>(resolve=>pending.push({signal,resolve})));
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const choose = (file:File):void => {
      Object.defineProperty(input,'files',{configurable:true,value:[file]});
      input.dispatchEvent(new Event('change'));
    };
    choose(new File(['old'],'old.txt'));
    choose(new File(['new'],'new.txt'));
    expect(pending[0]!.signal.aborted).toBe(true);
    const transformed = new File(['pdf'],'converted.pdf');
    pending[1]!.resolve(transformed);
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([transformed]);
    expect(fixture.componentInstance.preparing()).toBe(false);
    pending[0]!.resolve(new File(['stale'],'stale.pdf'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([transformed]);
  });
  it('honors asynchronous removal vetoes and exposes preview/download failures', async () => {
    const fixture = TestBed.createComponent(HyFileUpload);
    const file = new File(['pdf'],'report.pdf');
    fixture.componentRef.setInput('value',[file]);
    fixture.componentRef.setInput('beforeRemove',async ()=>false);
    fixture.componentRef.setInput('previewFile',async ()=> 'https://example.test/preview.png');
    fixture.componentRef.setInput('downloadFile',async ()=>{throw new Error('offline');});
    fixture.componentRef.setInput('directory',true);
    fixture.componentRef.setInput('labels',{remove:'Delete',preview:'View',download:'Save'});
    await fixture.whenStable();
    const upload = fixture.componentInstance;
    expect(fixture.nativeElement.querySelector('input').hasAttribute('webkitdirectory')).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label="Delete report.pdf"]')).not.toBeNull();
    expect(await upload.removeFile(file)).toBe(false);
    await upload.preview(file);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('https://example.test/preview.png');
    const errors: unknown[] = [];
    upload.actionFailed.subscribe(event=>errors.push(event));
    await upload.download(file);
    expect(errors).toEqual([{file,error:new Error('offline')}]);
    fixture.componentRef.setInput('beforeRemove',async ()=>true);
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
