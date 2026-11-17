import { TestBed } from '@angular/core/testing';
import { HyChatBubble, HyMessageList } from './chat';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('chat', () => {
  it('renders untrusted message text as text and emits retry by ID', async () => {
    const f = TestBed.createComponent(HyChatBubble);
    f.componentRef.setInput('message', {
      id: 'failed',
      sender: 'You',
      text: '<img src=x onerror=alert(1)>',
      status: 'error',
      timestamp: 'invalid',
    });
    const retry = vi.fn();
    f.componentInstance.retry.subscribe(retry);
    await f.whenStable();
    expect(f.nativeElement.querySelector('img')).toBeNull();
    expect(f.nativeElement.textContent).toContain('<img');
    expect(f.nativeElement.querySelector('time')).toBeNull();
    f.nativeElement.querySelector('button').click();
    expect(retry).toHaveBeenCalledWith('failed');
    await expectNoAxeViolations(f.nativeElement);
  });
  it('preserves a reader position, counts new messages, and supports an explicit jump', async () => {
    const f = TestBed.createComponent(HyMessageList);
    f.componentRef.setInput('label', 'Conversation');
    f.componentRef.setInput('messages', [{ id: 'a', sender: 'Support', text: 'Hello' }]);
    await f.whenStable();
    const node = f.nativeElement.querySelector('.viewport') as HTMLElement;
    let height = 1000;
    Object.defineProperty(node, 'scrollHeight', { get: () => height });
    Object.defineProperty(node, 'clientHeight', { value: 200 });
    node.scrollTop = 100;
    node.dispatchEvent(new Event('scroll'));
    height = 1100;
    f.componentRef.setInput('messages', [
      { id: 'a', sender: 'Support', text: 'Hello' },
      { id: 'b', sender: 'Support', text: 'Update' },
    ]);
    await f.whenStable();
    expect(node.scrollTop).toBe(100);
    expect(f.nativeElement.textContent).toContain('New messages (1)');
    f.nativeElement.querySelector('section > button').click();
    await f.whenStable();
    expect(node.scrollTop).toBe(1100);
    expect(node.getAttribute('aria-live')).toBe('off');
    await expectNoAxeViolations(f.nativeElement);
  });
  it('compensates for prepended history while the user reads older content', async () => {
    const f = TestBed.createComponent(HyMessageList);
    f.componentRef.setInput('label', 'Conversation');
    f.componentRef.setInput('autoScroll', 'off');
    f.componentRef.setInput('messages', [{ id: 'b', sender: 'Support', text: 'Second' }]);
    await f.whenStable();
    const node = f.nativeElement.querySelector('.viewport') as HTMLElement;
    let height = 1000;
    Object.defineProperty(node, 'scrollHeight', { get: () => height });
    node.scrollTop = 100;
    node.dispatchEvent(new Event('scroll'));
    height = 1200;
    f.componentRef.setInput('messages', [
      { id: 'a', sender: 'Support', text: 'First' },
      { id: 'b', sender: 'Support', text: 'Second' },
    ]);
    await f.whenStable();
    expect(node.scrollTop).toBe(300);
  });
});

it('scrolls to a message relative to its viewport rather than the page offset parent', async () => {
  const f = TestBed.createComponent(HyMessageList);
  f.componentRef.setInput('label', 'Conversation');
  f.componentRef.setInput('autoScroll', 'off');
  f.componentRef.setInput('messages', [{ id: 'a', sender: 'Support', text: 'Hello' }]);
  await f.whenStable();
  const viewport = f.nativeElement.querySelector('.viewport') as HTMLElement;
  const row = f.nativeElement.querySelector('li') as HTMLElement;
  viewport.scrollTop = 50;
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({ top: 300 } as DOMRect);
  vi.spyOn(row, 'getBoundingClientRect').mockReturnValue({ top: 450 } as DOMRect);
  expect(f.componentInstance.scrollToMessage('a')).toBe(true);
  expect(viewport.scrollTop).toBe(200);
  expect(f.componentInstance.scrollToMessage('missing')).toBe(false);
  expect(viewport.scrollTop).toBe(200);
});
