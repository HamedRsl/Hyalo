import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import Page from './chat';

describe('copyable marketplace conversation', () => {
  it('keeps a controlled multiline draft, rejects empty submissions and adds plain text only', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Page);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const form = host.querySelector('.marketplace-composer') as HTMLFormElement;
    const input = form.querySelector('textarea')!;
    const submit = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const initialCount = host.querySelectorAll('.marketplace-message').length;
    expect(submit.disabled).toBe(true);
    input.value = '  \n ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(host.querySelectorAll('.marketplace-message')).toHaveLength(initialCount);
    expect(form.textContent).toContain('Write a message before adding a draft.');
    input.value = '<img src=x onerror=alert(1)>\nSaturday works!';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(submit.disabled).toBe(false);
    expect(form.textContent).not.toContain('Write a message before adding a draft.');
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    input.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(false);
    expect(host.querySelectorAll('.marketplace-message')).toHaveLength(initialCount);
    submit.click();
    await fixture.whenStable();
    const added = host.querySelectorAll('.marketplace-message')[initialCount]!;
    expect(added.querySelector('.marketplace-bubble')?.textContent).toBe(
      '<img src=x onerror=alert(1)>\nSaturday works!',
    );
    expect(added.querySelector('img')).toBeNull();
    expect(added.textContent).toContain('Local draft');
    expect(input.value).toBe('');
    expect(host.querySelectorAll('.marketplace-message')).toHaveLength(initialCount + 1);
  });
  it('edits an existing local draft and exposes explicit pending, failure and retry previews without duplicate delivery', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Page);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const composer = host.querySelector('.marketplace-composer') as HTMLFormElement;
    const input = composer.querySelector('textarea')!;
    const add = composer.querySelector('button[type="submit"]') as HTMLButtonElement;
    const setDraft = async (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
    };
    await setDraft('Collect at 11?');
    add.click();
    await fixture.whenStable();
    const local = host.querySelector('[data-message-id="local-1"]')!;
    const action = (name: string) =>
      Array.from(local.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === name,
      )!;
    expect(action('Edit draft')).toBeDefined();
    await setDraft('Another unsaved thought');
    action('Edit draft').click();
    await fixture.whenStable();
    expect(input.value).toBe('Collect at 11?');
    await setDraft('Collect at noon?');
    add.click();
    await fixture.whenStable();
    expect(local.querySelector('.marketplace-bubble')?.textContent).toBe('Collect at noon?');
    expect(input.value).toBe('Another unsaved thought');
    expect(host.querySelectorAll('[data-message-id^="local-"]')).toHaveLength(1);
    action('Preview pending').click();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(add.disabled).toBe(true);
    composer.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(host.querySelectorAll('[data-message-id^="local-"]')).toHaveLength(1);
    expect(local.textContent).toContain('Pending · demo');
    action('Preview failure').click();
    await fixture.whenStable();
    expect(input.disabled).toBe(false);
    expect(local.textContent).toContain('Not sent · demo');
    action('Retry preview').click();
    await fixture.whenStable();
    expect(local.textContent).toContain('Pending · demo');
    expect(host.querySelectorAll('[data-message-id^="local-"]')).toHaveLength(1);
    action('Return to draft').click();
    await fixture.whenStable();
    expect(local.textContent).toContain('Local draft');
    action('Edit draft').click();
    await fixture.whenStable();
    await setDraft('Discard this edit');
    const cancel = Array.from(composer.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Cancel edit',
    )!;
    cancel.click();
    await fixture.whenStable();
    expect(input.value).toBe('Another unsaved thought');
    expect(local.querySelector('.marketplace-bubble')?.textContent).toBe('Collect at noon?');
    expect(host.querySelector('[role="status"]')?.textContent).toContain('cancelled');
  });

  it('validates native attachment destinations and keeps deterministic ISO timestamp semantics', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Page);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const link = host.querySelector('.marketplace-attachment') as HTMLAnchorElement | null;
    expect(link).not.toBeNull();
    expect(link!.getAttribute('href')).toMatch(/^https:\/\//);
    expect(link!.getAttribute('rel')).toContain('noopener');
    const initial = fixture.componentInstance.messages()[0]!;
    fixture.componentInstance.messages.set([
      {
        ...initial,
        attachments: [
          { name: 'Allowed', url: 'https://example.com/guide.pdf' },
          { name: 'Script', url: 'javascript:alert(1)' },
          { name: 'Data', url: 'data:text/html,<script>alert(1)</script>' },
          { name: 'Protocol relative', url: '//evil.test/guide.pdf' },
          { name: 'Backslash', url: '/\\evil.test/guide.pdf' },
          { name: 'Malformed', url: 'https://[' },
          { name: 'Relative', url: '/files/guide.pdf' },
        ],
      },
    ]);
    await fixture.whenStable();
    expect(host.querySelectorAll('.marketplace-attachment')).toHaveLength(1);
    expect(host.querySelector('.marketplace-attachment')?.getAttribute('href')).toBe(
      'https://example.com/guide.pdf',
    );
    expect(host.querySelectorAll('.marketplace-unavailable')).toHaveLength(6);
    const time = host.querySelector('time')!;
    expect(time.getAttribute('datetime')).toBe('2026-11-17T09:00:00Z');
    expect(time.textContent).toBe('09:00');
    expect(fixture.componentInstance.formatTime('2026-11-17')).toBe('Time unavailable');
    expect(fixture.componentInstance.formatTime('not-a-date')).toBe('Time unavailable');
    const page = fixture.componentInstance;
    expect(page.safeAttachmentUrl('http://example.com/guide.pdf')).toBe(
      'http://example.com/guide.pdf',
    );
    expect(page.safeAttachmentUrl('https://user:pass@example.com/file')).toBeNull();
    expect(page.safeAttachmentUrl('https://example.com/%0aheader')).toBeNull();
    expect(page.safeAttachmentUrl('https://example.com/file name')).toBeNull();
    expect(page.safeAttachmentUrl('https:example.com/file')).toBeNull();
    expect(page.safeAttachmentUrl('')).toBeNull();
  });

  it('composes named, keyboard-accessible primitives rather than the legacy chat wrapper', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Page);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const conversation = host.querySelector('.marketplace-chat');
    expect(conversation).not.toBeNull();
    expect(conversation!.querySelector('hy-card')).not.toBeNull();
    expect(conversation!.querySelector('hy-avatar')).not.toBeNull();
    expect(
      conversation!
        .querySelector('hy-scroll-area[aria-label="Conversation with Maya Chen"]')
        ?.getAttribute('tabindex'),
    ).toBe('0');
    expect(conversation!.querySelector('textarea[hyInput]')).not.toBeNull();
    expect(conversation!.querySelector('button[hyButton][type="submit"]')).not.toBeNull();
    expect(host.querySelector('hy-message-list, hy-chat-composer, hy-chat-bubble')).toBeNull();
    expect(conversation!.querySelector('[role="log"]')).toBeNull();
  });

  it('replies through the message menu and forwards into a different conversation', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Page);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const openMenu = async (id: string) => {
      const message = host.querySelector<HTMLElement>(
        `[data-message-id="${id}"] .marketplace-bubble`,
      )!;
      message.dispatchEvent(
        new MouseEvent('contextmenu', {
          button: 2,
          bubbles: true,
          cancelable: true,
          clientX: 50,
          clientY: 50,
        }),
      );
      await fixture.whenStable();
    };
    const named = (root: ParentNode, selector: string, text: string) =>
      [...root.querySelectorAll<HTMLButtonElement>(selector)].find(
        (item) => item.textContent?.trim() === text,
      )!;
    await openMenu('seller-1');
    expect(document.activeElement?.textContent?.trim()).toBe('Reply');
    named(document, 'button[role="menuitem"]', 'Reply').click();
    await fixture.whenStable();
    expect(host.querySelector('.marketplace-composer-quote')?.textContent).toContain(
      'Replying to Maya Chen',
    );
    const input = host.querySelector('textarea')!;
    input.value = 'Can you confirm pickup?';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('.marketplace-composer button[type="submit"]')!.click();
    await fixture.whenStable();
    expect(
      host.querySelector('[data-message-id="local-1"] .marketplace-quote')?.textContent,
    ).toContain('original oak finish');
    await openMenu('local-1');
    named(document, 'button[role="menuitem"]', 'Forward').click();
    await fixture.whenStable();
    named(host, '.marketplace-action-panel button', 'Nora Patel').click();
    const nora = [...host.querySelectorAll<HTMLButtonElement>('.marketplace-thread')].find((item) =>
      item.textContent?.includes('Nora Patel'),
    )!;
    nora.click();
    await fixture.whenStable();
    expect(host.querySelector('.marketplace-header')?.textContent).toContain('Nora Patel');
    expect(host.querySelector('[data-message-id="nora-1"]')?.textContent).toContain('more photos');
    expect(host.querySelector('[data-message-id="local-2"]')?.textContent).toContain(
      'Forwarded from You',
    );
    expect(host.querySelector('[data-message-id="local-2"]')?.textContent).toContain(
      'Can you confirm pickup?',
    );
    expect(nora.querySelector('.marketplace-unread')).toBeNull();
    fixture.destroy();
  });
});
