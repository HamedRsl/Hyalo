import { Clipboard } from '@angular/cdk/clipboard';
import { TestBed } from '@angular/core/testing';
import { HyCopy } from './copy';

describe('HyCopy', () => {
  const execCommandDescriptor = Object.getOwnPropertyDescriptor(document, 'execCommand');

  afterEach(() => {
    if (execCommandDescriptor)
      Object.defineProperty(document, 'execCommand', execCommandDescriptor);
    else Reflect.deleteProperty(document, 'execCommand');
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it.each([true, false])(
    'reports the real CDK clipboard result (%s) without moving focus',
    async (success) => {
      let copiedText: string | undefined;
      const execCommand = vi.fn(() => {
        copiedText = document.querySelector('textarea')?.value;
        return success;
      });
      Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });
      const fixture = TestBed.createComponent(HyCopy);
      fixture.componentRef.setInput('text', 'متن\n<script>literal</script>');
      fixture.componentRef.setInput('label', 'رونوشت');
      fixture.componentRef.setInput('copiedLabel', 'رونوشت شد');
      fixture.componentRef.setInput('failedLabel', 'رونوشت نشد');
      await fixture.whenStable();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      const completed = vi.fn();
      fixture.componentInstance.completed.subscribe(completed);
      button.focus();
      expect(document.activeElement).toBe(button);
      button.click();
      await fixture.whenStable();
      expect(execCommand).toHaveBeenCalledExactlyOnceWith('copy');
      expect(copiedText).toBe('متن\n<script>literal</script>');
      expect(completed).toHaveBeenCalledExactlyOnceWith(success);
      expect(document.activeElement).toBe(button);
      expect(button.type).toBe('button');
      expect(button.getAttribute('aria-label')).toBe('رونوشت');
      expect(button.getAttribute('title')).toBe(success ? 'رونوشت شد' : 'رونوشت');
      expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toBe(
        success ? 'رونوشت شد' : 'رونوشت نشد',
      );
      expect(document.querySelector('textarea')).toBeNull();
      expect(fixture.nativeElement.querySelector('script')).toBeNull();
    },
  );

  it('passes the current text verbatim and resets feedback two seconds after the last attempt', () => {
    vi.useFakeTimers();
    const copy = vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);
    TestBed.configureTestingModule({ providers: [{ provide: Clipboard, useValue: { copy } }] });
    const fixture = TestBed.createComponent(HyCopy);
    fixture.componentRef.setInput('text', 'first');
    fixture.detectChanges();
    const completed = vi.fn();
    fixture.componentInstance.completed.subscribe(completed);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    button.click();
    fixture.detectChanges();
    expect(status.textContent).toBe('Copied');
    vi.advanceTimersByTime(1500);
    fixture.componentRef.setInput('text', 'دوم\n  exact spacing  ');
    fixture.detectChanges();
    button.click();
    fixture.detectChanges();
    expect(copy.mock.calls).toEqual([['first'], ['دوم\n  exact spacing  ']]);
    expect(completed.mock.calls).toEqual([[true], [false]]);
    expect(status.textContent).toBe('Copy failed. Select and copy the text.');
    vi.advanceTimersByTime(500);
    fixture.detectChanges();
    expect(status.textContent).not.toBe('');
    vi.advanceTimersByTime(1499);
    fixture.detectChanges();
    expect(status.textContent).not.toBe('');
    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(status.textContent).toBe('');
    expect(button.getAttribute('title')).toBe('Copy');
  });

  it('clears its feedback timer when destroyed', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: Clipboard, useValue: { copy: () => true } }],
    });
    const fixture = TestBed.createComponent(HyCopy);
    fixture.componentRef.setInput('text', 'text');
    await fixture.whenStable();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const timeout = vi.spyOn(globalThis, 'setTimeout');
    const clear = vi.spyOn(globalThis, 'clearTimeout');
    fixture.componentInstance.copy();
    const feedbackTimer = timeout.mock.results.find(
      (_, index) => timeout.mock.calls[index]?.[1] === 2000,
    )!.value;
    fixture.destroy();
    expect(clear).toHaveBeenCalledWith(feedbackTimer);
  });

  it('keeps successful feedback when its translated label changes', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: Clipboard, useValue: { copy: () => true } }],
    });
    const fixture = TestBed.createComponent(HyCopy);
    fixture.componentRef.setInput('text', 'text');
    await fixture.whenStable();
    fixture.componentInstance.copy();
    await fixture.whenStable();
    fixture.componentRef.setInput('copiedLabel', 'رونوشت شد');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button').getAttribute('title')).toBe('رونوشت شد');
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toBe('رونوشت شد');
  });

  it('reports a browser clipboard exception as failure and removes the temporary textarea', async () => {
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: () => {
        throw new DOMException('Clipboard denied', 'NotAllowedError');
      },
    });
    const fixture = TestBed.createComponent(HyCopy);
    fixture.componentRef.setInput('text', 'text');
    await fixture.whenStable();
    const completed = vi.fn();
    fixture.componentInstance.completed.subscribe(completed);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.focus();
    button.click();
    await fixture.whenStable();
    expect(completed).toHaveBeenCalledExactlyOnceWith(false);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toBe(
      'Copy failed. Select and copy the text.',
    );
    expect(document.querySelector('textarea')).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('does not show a successful button when failure and success labels coincide', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: Clipboard, useValue: { copy: () => false } }],
    });
    const fixture = TestBed.createComponent(HyCopy);
    fixture.componentRef.setInput('text', 'متن');
    fixture.componentRef.setInput('copiedLabel', 'Result');
    fixture.componentRef.setInput('failedLabel', 'Result');
    fixture.detectChanges();
    const completed = vi.fn();
    fixture.componentInstance.completed.subscribe(completed);
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(completed).toHaveBeenCalledExactlyOnceWith(false);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toBe('Result');
    expect(fixture.nativeElement.querySelector('button').getAttribute('title')).toBe('Copy');
  });
});
