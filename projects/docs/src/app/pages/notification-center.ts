import { DocsTokens } from '../shared/tokens-table';
import { EXAMPLE } from './examples/notification-center';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HyPopover } from '@hyalo/angular/popover';
import { HyList, HyListItem } from '@hyalo/angular/list';
import { HyBadge } from '@hyalo/angular/badge';
import { HyTabs, HyTab, HyTabHeader } from '@hyalo/angular/tabs';
import { TabContent } from '@angular/aria/tabs';
import { HyEmptyState } from '@hyalo/angular/empty-state';
import { HyButton } from '@hyalo/angular/button';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';

/** Application-owned state: replace these records with data from your API. */
export class NotificationBlockStore {
  private readonly seed = [
    {
      id: 'order',
      title: 'Order confirmed',
      body: 'Your order is being prepared. We will let you know when it is ready.',
      createdAt: '2026-11-17T09:00:00Z',
      timeLabel: 'Nov 17, 09:00 UTC',
      read: false,
    },
    {
      id: 'message',
      title: 'A new message for you',
      body: 'Your care team shared an update to your appointment.',
      createdAt: '2026-11-17T08:00:00Z',
      timeLabel: 'Nov 17, 08:00 UTC',
      read: false,
    },
    {
      id: 'welcome',
      title: 'You are all set',
      body: 'Your notification preferences have been saved.',
      createdAt: '2026-11-16T14:00:00Z',
      timeLabel: 'Nov 16, 14:00 UTC',
      read: true,
    },
  ];
  readonly notifications = signal(this.seed.map((item) => ({ ...item })));
  readonly status = signal<'ready' | 'loading' | 'error'>('ready');
  readonly busy = computed(() => this.status() !== 'ready');
  readonly filter = signal<'all' | 'unread'>('all');
  readonly unreadCount = computed(() => this.notifications().filter((item) => !item.read).length);
  readonly visible = computed(() =>
    this.notifications().filter((item) => this.filter() === 'all' || !item.read),
  );
  readonly push = computed(() => this.notifications().find((item) => !item.read));

  setFilter(value: string | undefined): void {
    if (value === 'all' || value === 'unread') this.filter.set(value);
  }

  read(id: string): void {
    if (this.busy()) return;
    this.notifications.update((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  dismiss(id: string): void {
    if (this.busy()) return;
    this.notifications.update((items) => items.filter((item) => item.id !== id));
  }

  readAll(): void {
    if (this.busy()) return;
    this.notifications.update((items) => items.map((item) => ({ ...item, read: true })));
  }

  clear(): void {
    if (this.busy()) return;
    this.notifications.set([]);
  }

  /** Demo-only state switch. In production, set status around the host's API request. */
  preview(value: string): void {
    if (value === 'loading' || value === 'error') this.status.set(value);
    else if (value === 'empty') {
      this.status.set('ready');
      this.clear();
    } else if (value === 'ready') this.retry();
  }

  retry(): void {
    // The demo has no backend: restore fixtures rather than simulate a network success.
    this.notifications.set(this.seed.map((item) => ({ ...item })));
    this.filter.set('all');
    this.status.set('ready');
  }
}

@Component({
  selector: 'docs-notification-center-page',
  imports: [
    DocsTokens,
    DocsPage,
    DocsExample,
    DocsImport,
    DocsApiTable,
    NgTemplateOutlet,
    HyPopover,
    HyList,
    HyListItem,
    HyBadge,
    HyTabs,
    HyTab,
    TabContent,
    HyTabHeader,
    HyEmptyState,
    HyButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-center.html',
  styleUrl: './notification-block.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly store = new NotificationBlockStore();
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HyNotification.image',
      type: 'string',
      default: 'data',
      description: 'Optional decorative notification image.',
    },
    {
      name: 'HyNotificationCard.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents new user and programmatic actions.',
    },
    {
      name: 'HyNotificationCard.dateFormat',
      type: 'Intl.DateTimeFormatOptions',
      default: "{ dateStyle: 'medium', timeStyle: 'short' }",
      description: 'Intl date/time formatting options; timeZone remains explicit.',
    },
    {
      name: 'HyNotificationCard.activate()',
      type: '(event?: Event) => void',
      default: 'method',
      description: 'Emits an enabled action without owning application work.',
    },
    {
      name: 'HyNotificationCard.markRead()',
      type: '() => void',
      default: 'method',
      description: 'Requests the current unread notification be marked read.',
    },
    {
      name: 'HyNotificationCard.dismiss()',
      type: '() => void',
      default: 'method',
      description:
        'Requests guarded dismissal; the promise reports acceptance rather than animation completion.',
    },
    {
      name: 'HyNotificationCenter.request()',
      type: "(id: string, kind: 'read' | 'dismiss') => void",
      default: 'method',
      description: 'Starts one enabled refresh until complete or cancel.',
    },
    {
      name: 'HyNotificationCenter.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents new user and programmatic actions.',
    },
    {
      name: 'HyNotificationCenter.loading',
      type: 'boolean',
      default: 'false',
      description: 'Shows loading feedback without an empty-state flash.',
    },
    {
      name: 'HyNotificationCenter.error',
      type: 'string',
      default: "''",
      description: 'Application-supplied error text.',
    },
    {
      name: 'HyNotificationCenter.loadingLabel',
      type: 'string',
      default: "'Loading notifications'",
      description: 'Localized loading text.',
    },
    {
      name: 'HyNotificationCenter.retryLabel',
      type: 'string',
      default: "'Retry'",
      description: 'Localized retry text.',
    },
    {
      name: 'HyNotificationCenter.retryRequested',
      type: 'void',
      default: 'output',
      description: 'Requests recovery from an application error.',
    },
    {
      name: 'HyNotificationCenter.hasMore',
      type: 'boolean',
      default: 'false',
      description: 'Exposes pagination when further results exist.',
    },
    {
      name: 'HyNotificationCenter.loadingMore',
      type: 'boolean',
      default: 'false',
      description: 'Prevents repeated pagination while more results are pending.',
    },
    {
      name: 'HyNotificationCenter.loadMoreLabel',
      type: 'string',
      default: "'Load more'",
      description: 'Localized pagination control text.',
    },
    {
      name: 'HyNotificationCenter.moreRequested',
      type: 'void',
      default: 'output',
      description: 'Requests another page from the application.',
    },
    {
      name: 'HyNotificationCenter.itemTemplate',
      type: 'TemplateRef<{\n    $implicit: HyNotification;\n    index: number;\n  }> | undefined',
      default: 'undefined',
      description: 'Custom item content inside the native link/button.',
    },
    {
      name: 'HyNotificationCenter.dateFormat',
      type: 'Intl.DateTimeFormatOptions',
      default: "{ dateStyle: 'medium', timeStyle: 'short' }",
      description: 'Intl date/time formatting options; timeZone remains explicit.',
    },
    {
      name: 'HyNotificationCenter.requestMore()',
      type: '() => void',
      default: 'method',
      description: 'Requests one eligible next page.',
    },
    {
      name: 'HyNotificationCenter.requestMarkAllRead()',
      type: '() => void',
      default: 'method',
      description: 'Requests marking all unread items as read.',
    },
    {
      name: 'HyNotificationCenter.requestClear()',
      type: '() => void',
      default: 'method',
      description: 'Requests clearing an available collection.',
    },
    {
      name: 'HyNotificationCard.notification',
      type: 'HyNotification',
      default: 'required',
      description: 'Public input; see the live example and exported TypeScript declaration.',
    },
    {
      name: 'HyNotificationCard.locale',
      type: 'string',
      default: 'undefined',
      description: 'Intl locale; inherits the shared HyLocale when omitted.',
    },
    {
      name: 'HyNotificationCard.timeZone',
      type: 'string',
      default: "'UTC'",
      description: 'Explicit timezone used for deterministic timestamp formatting.',
    },
    {
      name: 'HyNotificationCard.announce',
      type: 'boolean',
      default: 'false',
      description: 'Public input; see the live example and exported TypeScript declaration.',
    },
    {
      name: 'HyNotificationCard.readLabel',
      type: 'string',
      default: "'Mark as read'",
      description: 'Localized text for read.',
    },
    {
      name: 'HyNotificationCard.dismissLabel',
      type: 'string',
      default: "'Dismiss'",
      description: 'Localized text for dismiss.',
    },
    {
      name: 'HyNotificationCard.readRequested',
      type: 'string',
      default: 'output',
      description: 'Requests that the host mark one ID as read.',
    },
    {
      name: 'HyNotificationCard.dismissed',
      type: 'string',
      default: 'output',
      description: 'Requests dismissal; controlled data remains owned by the host.',
    },
    {
      name: 'HyNotificationCard.action',
      type: 'string',
      default: 'output',
      description: 'Requests the associated host action.',
    },
    {
      name: 'HyNotificationCenter.notifications',
      type: 'readonly HyNotification[]',
      default: 'required',
      description: 'Immutable persistent notifications; updates are owned by the host.',
    },
    {
      name: 'HyNotificationCenter.heading',
      type: 'string',
      default: "'Notifications'",
      description: 'Visible section heading and accessible surface name.',
    },
    {
      name: 'HyNotificationCenter.filter',
      type: "'all' | 'unread'",
      default: "'all'",
      description: 'Controlled all or unread view.',
    },
    {
      name: 'HyNotificationCenter.sort',
      type: "'newest' | 'oldest' | 'none'",
      default: "'newest'",
      description: 'Orders a copy by timestamp, or preserves input order.',
    },
    {
      name: 'HyNotificationCenter.locale',
      type: 'string',
      default: 'undefined',
      description: 'Intl locale; inherits the shared HyLocale when omitted.',
    },
    {
      name: 'HyNotificationCenter.timeZone',
      type: 'string',
      default: "'UTC'",
      description: 'Explicit timezone used for deterministic timestamp formatting.',
    },
    {
      name: 'HyNotificationCenter.allLabel',
      type: 'string',
      default: "'All'",
      description: 'Localized text for all.',
    },
    {
      name: 'HyNotificationCenter.unreadLabel',
      type: 'string',
      default: "'Unread'",
      description: 'Localized text for unread.',
    },
    {
      name: 'HyNotificationCenter.readLabel',
      type: 'string',
      default: "'Mark as read'",
      description: 'Localized text for read.',
    },
    {
      name: 'HyNotificationCenter.dismissLabel',
      type: 'string',
      default: "'Dismiss'",
      description: 'Localized text for dismiss.',
    },
    {
      name: 'HyNotificationCenter.markAllLabel',
      type: 'string',
      default: "'Mark all as read'",
      description: 'Localized text for mark all.',
    },
    {
      name: 'HyNotificationCenter.clearLabel',
      type: 'string',
      default: "'Clear notifications'",
      description: 'Localized text for clear.',
    },
    {
      name: 'HyNotificationCenter.emptyLabel',
      type: 'string',
      default: "'No notifications'",
      description: 'Localized text for empty.',
    },
    {
      name: 'HyNotificationCenter.readRequested',
      type: 'string',
      default: 'output',
      description: 'Requests that the host mark one ID as read.',
    },
    {
      name: 'HyNotificationCenter.dismissed',
      type: 'string',
      default: 'output',
      description: 'Requests dismissal; controlled data remains owned by the host.',
    },
    {
      name: 'HyNotificationCenter.action',
      type: 'string',
      default: 'output',
      description: 'Requests the associated host action.',
    },
    {
      name: 'HyNotificationCenter.markAllRead',
      type: 'void',
      default: 'output',
      description: 'Requests that the host mark every notification as read.',
    },
    {
      name: 'HyNotificationCenter.cleared',
      type: 'void',
      default: 'output',
      description: 'Requests that the host clear its notification data.',
    },
    {
      name: 'HyNotification',
      type: 'readonly object',
      default: 'data',
      description:
        'id, title, optional body, createdAt ISO string, read, tone, actionLabel, href and dismissible.',
    },
    {
      name: 'HyNotificationCard',
      type: 'component',
      default: 'standalone export',
      description:
        'notification, locale, timeZone, announce, readLabel, dismissLabel; readRequested, dismissed and action outputs.',
    },
  ];
}
