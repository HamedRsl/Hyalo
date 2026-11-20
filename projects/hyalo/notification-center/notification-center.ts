import {
  ChangeDetectionStrategy,
  type TemplateRef,
  ElementRef,
  afterRenderEffect,
  signal,
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HyLocale, type HyTone } from '@hyalo/angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HyEmptyState } from '@hyalo/angular/empty-state';

export interface HyNotification {
  readonly id: string;
  readonly title: string;
  readonly body?: string;
  readonly image?: string;
  readonly createdAt?: string;
  readonly read?: boolean;
  readonly tone?: HyTone;
  readonly actionLabel?: string;
  readonly href?: string;
  readonly dismissible?: boolean;
}
@Component({
  selector: 'hy-notification-card',
  imports: [HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.html',
  styleUrl: './notification-center.css',
  host: {
    '[attr.data-read]': 'notification().read ?? false',
    '[attr.data-tone]': 'notification().tone ?? "primary"',
    '[attr.role]': 'announce() ? "status" : null',
  },
})
export class HyNotificationCard {
  private readonly globalLocale = inject(HyLocale);
  readonly notification = input.required<HyNotification>();
  readonly locale = input<string>();
  readonly timeZone = input('UTC');
  readonly announce = input(false);
  readonly disabled = input(false);
  readonly dateFormat = input<Intl.DateTimeFormatOptions>({
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  readonly readLabel = input('Mark as read');
  readonly dismissLabel = input('Dismiss');
  readonly readRequested = output<string>();
  readonly dismissed = output<string>();
  readonly action = output<string>();
  activate(event?: Event): void {
    if (this.disabled()) {
      event?.preventDefault();
      return;
    }
    this.action.emit(this.notification().id);
  }
  markRead(): void {
    if (!this.disabled() && !this.notification().read)
      this.readRequested.emit(this.notification().id);
  }
  dismiss(): void {
    if (!this.disabled() && this.notification().dismissible !== false)
      this.dismissed.emit(this.notification().id);
  }
  protected readonly time = computed(() => {
    const stamp = this.notification().createdAt;
    const date = stamp ? new Date(stamp) : null;
    return date && Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat(this.locale() ?? this.globalLocale.locale(), {
          ...this.dateFormat(),
          timeZone: this.timeZone(),
        }).format(date)
      : '';
  });
}
@Component({
  selector: 'hy-notification-center',
  imports: [HyNotificationCard, HyButton, HyEmptyState, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.css',
})
export class HyNotificationCenter {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly focusRecovery = signal<number | null>(null);
  constructor() {
    afterRenderEffect(() => {
      this.visible();
      const index = this.focusRecovery();
      if (index === null) return;
      const cards = this.element.querySelectorAll<HTMLElement>('.notification-list > li');
      const card = cards[Math.min(index, cards.length - 1)];
      (
        card?.querySelector<HTMLElement>('button,a[href]') ??
        this.element.querySelector<HTMLElement>('h2')
      )?.focus();
      this.focusRecovery.set(null);
    });
  }
  request(id: string, kind: 'read' | 'dismiss'): void {
    const item = this.notifications().find((notification) => notification.id === id);
    if (
      this.disabled() ||
      this.loading() ||
      !item ||
      (kind === 'dismiss' && item.dismissible === false) ||
      (kind === 'read' && item.read)
    )
      return;
    const cards = [...this.element.querySelectorAll<HTMLElement>('.notification-list > li')];
    const index = cards.findIndex((card) =>
      card.contains(this.element.ownerDocument.activeElement),
    );
    if (index >= 0) this.focusRecovery.set(index);
    if (kind === 'read') this.readRequested.emit(id);
    else this.dismissed.emit(id);
  }
  readonly notifications = input.required<readonly HyNotification[]>();
  readonly heading = input('Notifications');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly error = input('');
  readonly loadingLabel = input('Loading notifications');
  readonly retryLabel = input('Retry');
  readonly retryRequested = output<void>();
  readonly hasMore = input(false);
  readonly loadingMore = input(false);
  readonly loadMoreLabel = input('Load more');
  readonly moreRequested = output<void>();
  readonly itemTemplate = input<TemplateRef<{ $implicit: HyNotification; index: number }>>();
  readonly dateFormat = input<Intl.DateTimeFormatOptions>({
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  requestMore(): void {
    if (!this.disabled() && !this.loading() && !this.loadingMore() && this.hasMore())
      this.moreRequested.emit();
  }
  requestMarkAllRead(): void {
    if (!this.disabled() && !this.loading() && this.unread()) this.markAllRead.emit();
  }
  requestClear(): void {
    if (!this.disabled() && !this.loading() && this.notifications().length) this.cleared.emit();
  }
  readonly filter = model<'all' | 'unread'>('all');
  readonly sort = input<'newest' | 'oldest' | 'none'>('newest');
  readonly locale = input<string>();
  readonly timeZone = input('UTC');
  readonly allLabel = input('All');
  readonly unreadLabel = input('Unread');
  readonly readLabel = input('Mark as read');
  readonly dismissLabel = input('Dismiss');
  readonly markAllLabel = input('Mark all as read');
  readonly clearLabel = input('Clear notifications');
  readonly emptyLabel = input('No notifications');
  readonly readRequested = output<string>();
  readonly dismissed = output<string>();
  readonly action = output<string>();
  readonly markAllRead = output<void>();
  readonly cleared = output<void>();
  protected readonly unread = computed(
    () => this.notifications().filter((item) => !item.read).length,
  );
  protected readonly visible = computed(() => {
    const rows = this.notifications().filter((item) => this.filter() === 'all' || !item.read);
    if (this.sort() === 'none') return rows;
    const epoch = (stamp?: string): number => {
      const value = stamp ? Date.parse(stamp) : 0;
      return Number.isFinite(value) ? value : 0;
    };
    return [...rows].sort(
      (a, b) => (epoch(a.createdAt) - epoch(b.createdAt)) * (this.sort() === 'oldest' ? 1 : -1),
    );
  });
}
export const HY_NOTIFICATIONS = [HyNotificationCenter, HyNotificationCard] as const;
