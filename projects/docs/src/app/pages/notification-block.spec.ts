import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import Page, { NotificationBlockStore } from './notification-center';

const wait = (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));
async function panel(): Promise<HTMLElement> {
  for (let attempt = 0; attempt < 100; attempt++) {
    const element = document.querySelector<HTMLElement>('.notification-panel');
    if (element) return element;
    await wait();
  }
  throw new Error('Notification popover did not open');
}

describe('copyable notification composition', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove()));

  it('opens a labelled primitive popover with list, badge and filter tabs, not the legacy wrapper', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Page);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector(
      '[aria-label="Open notifications"]',
    ) as HTMLButtonElement | null;
    expect(trigger).not.toBeNull();
    trigger!.click();
    const surface = await panel();
    await fixture.whenStable();
    expect(surface.closest('[role="dialog"]')?.getAttribute('aria-label')).toBe('Notifications');
    expect(surface.querySelector('hy-list ul')).not.toBeNull();
    expect(surface.querySelector('[role="tablist"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('hy-badge')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('hy-notification-center')).toBeNull();
    expect(surface.querySelector('hy-notification-center')).toBeNull();
  });

  it('previews loading and recoverable errors without flashing the empty state', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Page);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const state = fixture.nativeElement.querySelector(
      '[aria-label="Preview notification state"]',
    ) as HTMLSelectElement | null;
    expect(state).not.toBeNull();
    state!.value = 'loading';
    state!.dispatchEvent(new Event('change'));
    fixture.nativeElement.querySelector('[aria-label="Open notifications"]').click();
    const surface = await panel();
    await fixture.whenStable();
    expect(surface.querySelector('[role="status"]')?.textContent).toContain(
      'Loading notifications',
    );
    expect(surface.querySelector('hy-empty-state')).toBeNull();
    expect(surface.querySelector('hy-list')).toBeNull();
    state!.value = 'error';
    state!.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(surface.querySelector('[role="alert"]')?.textContent).toContain('Could not load');
    const retry = Array.from(surface.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Retry'),
    )!;
    retry.click();
    await fixture.whenStable();
    expect(surface.querySelector('[role="alert"]')).toBeNull();
    expect(surface.querySelectorAll('li[hyListItem]').length).toBe(3);
    expect(state!.value).toBe('ready');
  });

  it('shares read and dismiss state between the push card, badge and unread tab', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Page);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('[aria-label="Open notifications"]').click();
    const surface = await panel();
    await fixture.whenStable();
    const unread = Array.from(surface.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(
      (button) => button.textContent?.includes('Unread'),
    )!;
    unread.click();
    await fixture.whenStable();
    const active = () => surface.querySelector<HTMLElement>('hy-tab:not([inert])')!;
    expect(active().querySelectorAll('li').length).toBe(2);
    fixture.nativeElement.querySelector('.notification-push button').click();
    await fixture.whenStable();
    expect(active().querySelectorAll('li').length).toBe(1);
    expect(
      fixture.nativeElement.querySelector('.notification-launcher hy-badge').textContent.trim(),
    ).toBe('1');
    active()
      .querySelector<HTMLButtonElement>('[aria-label="Dismiss A new message for you"]')!
      .click();
    await fixture.whenStable();
    expect(active().querySelector('hy-empty-state')?.textContent).toContain('caught up');
    expect(fixture.nativeElement.querySelector('.notification-push')).toBeNull();
    const all = Array.from(surface.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(
      (button) => button.textContent?.includes('All'),
    )!;
    all.click();
    await fixture.whenStable();
    expect(active().querySelectorAll('li').length).toBe(2);
    Array.from(surface.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Clear all'))!
      .click();
    await fixture.whenStable();
    expect(active().querySelector('hy-empty-state')?.textContent).toContain('No notifications yet');
  });

  it('closes on Escape and restores the notification trigger', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Page);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector(
      '[aria-label="Open notifications"]',
    ) as HTMLButtonElement;
    trigger.click();
    const surface = await panel();
    await fixture.whenStable();
    surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('does not allow read, dismiss or bulk mutations while loading or failed', () => {
    const store = new NotificationBlockStore();
    for (const status of ['loading', 'error'] as const) {
      store.status.set(status);
      const before = store.notifications();
      store.read('order');
      store.dismiss('order');
      store.readAll();
      store.clear();
      expect(store.notifications()).toBe(before);
    }
  });

  it('updates immutably, preserves the source array and handles unknown IDs', () => {
    const store = new NotificationBlockStore();
    const before = store.notifications();
    store.setFilter('unread');
    expect(store.visible().length).toBe(2);
    store.read('order');
    expect(before[0]!.read).toBe(false);
    expect(store.visible().map((item) => item.id)).toEqual(['message']);
    store.dismiss('missing');
    store.read('missing');
    expect(store.notifications().length).toBe(3);
    store.readAll();
    expect(store.unreadCount()).toBe(0);
    expect(store.visible()).toEqual([]);
    store.setFilter(undefined);
    expect(store.filter()).toBe('unread');
    store.preview('empty');
    expect(store.notifications()).toEqual([]);
    store.retry();
    expect(store.filter()).toBe('all');
    expect(store.unreadCount()).toBe(2);
  });
});
