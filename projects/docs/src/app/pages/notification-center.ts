import { DocsTokens } from '../shared/tokens-table';
import { EXAMPLE } from './examples/notification-center';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyNotificationCenter } from '@hyalo/angular/notification-center';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-notification-center-page',
  imports: [DocsTokens, DocsPage, DocsExample, DocsImport, DocsApiTable, HyNotificationCenter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-center.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
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
  protected readonly notifications = signal([
    {
      id: 'order',
      title: 'Order confirmed',
      body: 'Your order is being prepared.',
      createdAt: '2026-11-17T09:00:00Z',
      read: false,
    },
    {
      id: 'message',
      title: 'New message',
      body: 'Your clinician sent an update.',
      createdAt: '2026-11-17T08:00:00Z',
      read: false,
    },
  ]);
  protected read(id: string): void {
    this.notifications.update((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }
  protected dismiss(id: string): void {
    this.notifications.update((items) => items.filter((item) => item.id !== id));
  }
  protected readAll(): void {
    this.notifications.update((items) => items.map((item) => ({ ...item, read: true })));
  }
}
