import { TestBed } from '@angular/core/testing';
import { HyChatComposer } from './composer';
import { expectNoAxeViolations } from '../src/testing/axe';

describe('HyChatComposer', () => {
  it('keeps Shift+Enter and composition local, then clears a submitted draft exactly once', async () => {
    const f = TestBed.createComponent(HyChatComposer);
    const submitted = vi.fn();
    f.componentInstance.submitted.subscribe(submitted);
    f.componentInstance.message.set('Hello');
    await f.whenStable();
    const textarea = f.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }),
    );
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }),
    );
    expect(submitted).not.toHaveBeenCalled();
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    f.componentInstance.send();
    expect(submitted).toHaveBeenCalledExactlyOnceWith({ text: 'Hello', files: [] });
    expect(f.componentInstance.message()).toBe('');
    await f.whenStable();
    await expectNoAxeViolations(f.nativeElement);
  });
  it('rejects attachments by size/count, allows file-only messages, and respects pending state', async () => {
    const f = TestBed.createComponent(HyChatComposer);
    const submitted = vi.fn();
    const rejected = vi.fn();
    f.componentRef.setInput('allowAttachments', true);
    f.componentRef.setInput('maxFiles', 1);
    f.componentRef.setInput('maxFileSize', 3);
    f.componentInstance.submitted.subscribe(submitted);
    f.componentInstance.filesRejected.subscribe(rejected);
    const small = new File(['ok'], 'a.txt');
    const large = new File(['large'], 'b.txt');
    f.componentInstance.addFiles([small, large, small]);
    expect(rejected.mock.calls[0]?.[0].map((item: { reason: string }) => item.reason)).toEqual([
      'size',
      'count',
    ]);
    f.componentRef.setInput('pending', true);
    f.componentInstance.send();
    f.componentInstance.removeFile(0);
    expect(submitted).not.toHaveBeenCalled();
    expect(f.componentInstance.files()).toHaveLength(1);
    f.componentRef.setInput('pending', false);
    f.componentInstance.send();
    expect(submitted).toHaveBeenCalledWith({ text: '', files: [small] });
  });
});
