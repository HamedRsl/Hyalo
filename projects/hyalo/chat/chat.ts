import {
  ChangeDetectionStrategy,
  type TemplateRef,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HyLocale } from '@hyalo/angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HyChatComposer } from './composer';

export type HyMessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';
export interface HyChatAttachment {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly mimeType?: string;
  readonly size?: number;
}
export interface HyChatMessage {
  readonly id: string;
  readonly avatar?: string;
  readonly text: string;
  readonly sender: string;
  readonly direction?: 'incoming' | 'outgoing';
  readonly timestamp?: string;
  readonly status?: HyMessageStatus;
  readonly quote?: string;
  readonly attachments?: readonly HyChatAttachment[];
}
@Component({
  selector: 'hy-chat-bubble',
  imports: [HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bubble.html',
  styleUrl: './chat.css',
  host: { '[attr.data-direction]': 'message().direction ?? "incoming"' },
})
export class HyChatBubble {
  private readonly globalLocale = inject(HyLocale);
  readonly message = input.required<HyChatMessage>();
  readonly locale = input<string>();
  readonly timeZone = input('UTC');
  readonly retryLabel = input('Retry message');
  readonly statusLabels = input<Readonly<Record<HyMessageStatus, string>>>({
    sending: 'Sending',
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Read',
    error: 'Could not send',
  });
  readonly retry = output<string>();
  readonly attachmentActivated = output<HyChatAttachment>();
  readonly showSender = input(true);
  readonly showAvatar = input(true);
  readonly dateFormat = input<Intl.DateTimeFormatOptions>({ timeStyle: 'short' });
  protected readonly time = computed(() => {
    const stamp = this.message().timestamp;
    const epoch = stamp ? Date.parse(stamp) : NaN;
    return Number.isFinite(epoch)
      ? new Intl.DateTimeFormat(this.locale() ?? this.globalLocale.locale(), {
          ...this.dateFormat(),
          timeZone: this.timeZone(),
        }).format(epoch)
      : '';
  });
  protected readonly statusText = computed(() => {
    const status = this.message().status;
    return status ? this.statusLabels()[status] : '';
  });
}
@Component({
  selector: 'hy-message-list',
  imports: [HyChatBubble, HyButton, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class HyMessageList {
  readonly messageTemplate = input<TemplateRef<{ $implicit: HyChatMessage; index: number }>>();
  readonly showSender = input(true);
  readonly showAvatar = input(true);
  readonly dateFormat = input<Intl.DateTimeFormatOptions>({ timeStyle: 'short' });
  readonly nearBottomThreshold = input(80);
  readonly attachmentActivated = output<{
    readonly message: HyChatMessage;
    readonly attachment: HyChatAttachment;
  }>();
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  readonly messages = input.required<readonly HyChatMessage[]>();
  readonly label = input.required<string>();
  readonly locale = input<string>();
  readonly timeZone = input('UTC');
  readonly height = input('24rem');
  readonly autoScroll = input<'off' | 'near-bottom' | 'always'>('near-bottom');
  readonly live = input<'off' | 'polite'>('off');
  readonly emptyLabel = input('No messages yet');
  readonly newMessagesLabel = input('New messages');
  readonly loadOlderLabel = input('Load older messages');
  readonly canLoadOlder = input(false);
  readonly loadingOlder = input(false);
  readonly retryLabel = input('Retry message');
  readonly statusLabels = input<Readonly<Record<HyMessageStatus, string>>>({
    sending: 'Sending',
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Read',
    error: 'Could not send',
  });
  readonly olderRequested = output<void>();
  readonly retry = output<string>();
  protected readonly unseen = signal(0);
  private first = '';
  private last = '';
  private wasNear = true;
  private oldHeight = 0;
  private initialized = false;
  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const node = this.viewport().nativeElement;
      const scroll = (): void => {
        this.wasNear =
          node.scrollHeight - node.scrollTop - node.clientHeight <=
          (Number.isFinite(this.nearBottomThreshold())
            ? Math.max(0, this.nearBottomThreshold())
            : 80);
        this.oldHeight = node.scrollHeight;
        if (this.wasNear) this.unseen.set(0);
      };
      node.addEventListener('scroll', scroll, { passive: true });
      destroy.onDestroy(() => node.removeEventListener('scroll', scroll));
    });
    afterRenderEffect(() => {
      const messages = this.messages(),
        node = this.viewport().nativeElement;
      const first = messages[0]?.id ?? '',
        last = messages.at(-1)?.id ?? '';
      if (!this.initialized) {
        if (this.autoScroll() !== 'off') node.scrollTop = node.scrollHeight;
        this.initialized = true;
      } else if (first !== this.first && last === this.last && this.first) {
        node.scrollTop += node.scrollHeight - this.oldHeight;
      } else if (last !== this.last) {
        if (
          this.autoScroll() === 'always' ||
          (this.autoScroll() === 'near-bottom' && this.wasNear)
        ) {
          node.scrollTop = node.scrollHeight;
          this.unseen.set(0);
        } else {
          const index = messages.findIndex((message) => message.id === this.last);
          this.unseen.update((count) => count + (index < 0 ? 1 : messages.length - index - 1));
        }
      }
      this.first = first;
      this.last = last;
      this.oldHeight = node.scrollHeight;
    });
  }
  scrollToMessage(id: string): boolean {
    const index = this.messages().findIndex((message) => message.id === id);
    const node = this.viewport().nativeElement.querySelectorAll<HTMLElement>('ol > li')[index];
    if (!node) return false;
    const viewport = this.viewport().nativeElement;
    viewport.scrollTop +=
      node.getBoundingClientRect().top - viewport.getBoundingClientRect().top - viewport.clientTop;
    return true;
  }
  scrollToEnd(): void {
    const node = this.viewport().nativeElement;
    node.scrollTop = node.scrollHeight;
    this.wasNear = true;
    this.unseen.set(0);
  }
}
export const HY_CHAT = [HyChatBubble, HyMessageList, HyChatComposer] as const;
