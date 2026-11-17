import { DocsTokens } from '../shared/tokens-table';
import { EXAMPLE } from './examples/chat';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  HyChatComposer,
  HyMessageList,
  type HyChatMessage,
  type HyChatSubmission,
} from '@hyalo/angular/chat';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-chat-page',
  imports: [
    DocsTokens,
    DocsPage,
    DocsExample,
    DocsImport,
    DocsApiTable,
    HyMessageList,
    HyChatComposer,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HyChatAttachment.mimeType',
      type: 'string',
      default: 'data',
      description: 'Optional attachment MIME metadata.',
    },
    {
      name: 'HyChatAttachment.size',
      type: 'number',
      default: 'data',
      description: 'Optional attachment size in bytes.',
    },
    {
      name: 'HyChatBubble.attachmentActivated',
      type: 'HyChatAttachment',
      default: 'output',
      description: 'Attachment activation data; the native link remains usable.',
    },
    {
      name: 'HyChatBubble.showSender',
      type: 'boolean',
      default: 'true',
      description: 'Shows the sender name.',
    },
    {
      name: 'HyChatBubble.showAvatar',
      type: 'boolean',
      default: 'true',
      description: 'Shows the optional sender avatar.',
    },
    {
      name: 'HyChatBubble.dateFormat',
      type: 'Intl.DateTimeFormatOptions',
      default: "{ timeStyle: 'short' }",
      description: 'Intl date/time formatting options; timeZone remains explicit.',
    },
    {
      name: 'HyMessageList.messageTemplate',
      type: 'TemplateRef<{\n    $implicit: HyChatMessage;\n    index: number;\n  }> | undefined',
      default: 'undefined',
      description: 'Custom message content with message and index context.',
    },
    {
      name: 'HyMessageList.showSender',
      type: 'boolean',
      default: 'true',
      description: 'Shows the sender name.',
    },
    {
      name: 'HyMessageList.showAvatar',
      type: 'boolean',
      default: 'true',
      description: 'Shows the optional sender avatar.',
    },
    {
      name: 'HyMessageList.dateFormat',
      type: 'Intl.DateTimeFormatOptions',
      default: "{ timeStyle: 'short' }",
      description: 'Intl date/time formatting options; timeZone remains explicit.',
    },
    {
      name: 'HyMessageList.nearBottomThreshold',
      type: 'number',
      default: '80',
      description: 'Distance from the bottom that permits near-bottom autoscrolling.',
    },
    {
      name: 'HyMessageList.attachmentActivated',
      type: '{\n    readonly message: HyChatMessage;\n    readonly attachment: HyChatAttachment;\n  }',
      default: 'output',
      description: 'Attachment activation data; the native link remains usable.',
    },
    {
      name: 'HyMessageList.scrollToMessage()',
      type: '(id: string) => boolean',
      default: 'method',
      description: 'Scrolls to an existing message ID and reports whether it exists.',
    },
    {
      name: 'HyChatSubmission.text',
      type: 'string',
      default: 'data',
      description: 'Message text preserved as plain text.',
    },
    {
      name: 'HyChatSubmission.files',
      type: 'readonly File[]',
      default: 'data',
      description: 'Controlled attachment selection; uploads remain application-owned.',
    },
    {
      name: 'HyChatFileRejection.file',
      type: 'File',
      default: 'data',
      description: 'Rejected file.',
    },
    {
      name: 'HyChatFileRejection.reason',
      type: "'count' | 'size'",
      default: 'data',
      description: 'Dismissal source; programmatic, backdrop, Escape, gesture, or close button.',
    },
    {
      name: 'HyChatComposer.message',
      type: 'string',
      default: "''",
      description: 'Controlled composer draft.',
    },
    {
      name: 'HyChatComposer.files',
      type: 'readonly File[]',
      default: '[]',
      description: 'Controlled attachment selection; uploads remain application-owned.',
    },
    {
      name: 'HyChatComposer.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents new user and programmatic actions.',
    },
    {
      name: 'HyChatComposer.pending',
      type: 'boolean',
      default: 'false',
      description: 'Pending execution state; prevents further interaction.',
    },
    {
      name: 'HyChatComposer.label',
      type: 'string',
      default: "'Message'",
      description: 'Accessible name for the composer.',
    },
    {
      name: 'HyChatComposer.placeholder',
      type: 'string',
      default: "'Write a message'",
      description: 'Localized draft prompt.',
    },
    {
      name: 'HyChatComposer.sendLabel',
      type: 'string',
      default: "'Send'",
      description: 'Localized submit text.',
    },
    {
      name: 'HyChatComposer.attachLabel',
      type: 'string',
      default: "'Attach files'",
      description: 'Localized file-picker label.',
    },
    {
      name: 'HyChatComposer.removeLabel',
      type: 'string',
      default: "'Remove attachment'",
      description: 'Localized attachment removal label.',
    },
    {
      name: 'HyChatComposer.allowAttachments',
      type: 'boolean',
      default: 'false',
      description: 'Enables the native attachment picker and addFiles API.',
    },
    {
      name: 'HyChatComposer.accept',
      type: 'string',
      default: "''",
      description: 'Native file-picker MIME/extension hint; hosts still validate uploaded content.',
    },
    {
      name: 'HyChatComposer.maxFiles',
      type: 'number',
      default: '10',
      description: 'Maximum attachment count.',
    },
    {
      name: 'HyChatComposer.maxFileSize',
      type: 'number | undefined',
      default: 'undefined',
      description: 'Optional per-file byte limit.',
    },
    {
      name: 'HyChatComposer.submitOnEnter',
      type: 'boolean',
      default: 'true',
      description: 'Enter submits; Shift+Enter inserts a newline and composition is preserved.',
    },
    {
      name: 'HyChatComposer.clearOnSubmit',
      type: 'boolean',
      default: 'true',
      description: 'Clears the draft and selected files before emitting the submission.',
    },
    {
      name: 'HyChatComposer.submitted',
      type: 'HyChatSubmission',
      default: 'output',
      description: 'Text and files to send through the application transport.',
    },
    {
      name: 'HyChatComposer.filesRejected',
      type: 'readonly HyChatFileRejection[]',
      default: 'output',
      description: 'Files rejected by count or byte limits, with reasons.',
    },
    {
      name: 'HyChatComposer.send()',
      type: '(event?: Event) => void',
      default: 'method',
      description: 'Submits an eligible text or attachment draft.',
    },
    {
      name: 'HyChatComposer.addFiles()',
      type: '(files: readonly File[]) => void',
      default: 'method',
      description: 'Adds eligible files and reports rejected entries.',
    },
    {
      name: 'HyChatComposer.removeFile()',
      type: '(index: number) => void',
      default: 'method',
      description: 'Removes one selected file by index.',
    },
    {
      name: 'HyChatBubble.message',
      type: 'HyChatMessage',
      default: 'required',
      description: 'Public input; see the live example and exported TypeScript declaration.',
    },
    {
      name: 'HyChatBubble.locale',
      type: 'string',
      default: 'undefined',
      description: 'Intl locale; inherits the shared HyLocale when omitted.',
    },
    {
      name: 'HyChatBubble.timeZone',
      type: 'string',
      default: "'UTC'",
      description: 'Explicit timezone used for deterministic timestamp formatting.',
    },
    {
      name: 'HyChatBubble.retryLabel',
      type: 'string',
      default: "'Retry message'",
      description: 'Localized text for retry.',
    },
    {
      name: 'HyChatBubble.statusLabels',
      type: 'Readonly<Record<HyMessageStatus, string>>',
      default: 'see type defaults',
      description: 'Localized text for each delivery state.',
    },
    {
      name: 'HyChatBubble.retry',
      type: 'string',
      default: 'output',
      description: 'Requests another attempt for a failed message ID.',
    },
    {
      name: 'HyMessageList.messages',
      type: 'readonly HyChatMessage[]',
      default: 'required',
      description: 'Immutable conversation history with stable message IDs.',
    },
    {
      name: 'HyMessageList.label',
      type: 'string',
      default: 'required',
      description: 'Accessible name for the control or region.',
    },
    {
      name: 'HyMessageList.locale',
      type: 'string',
      default: 'undefined',
      description: 'Intl locale; inherits the shared HyLocale when omitted.',
    },
    {
      name: 'HyMessageList.timeZone',
      type: 'string',
      default: "'UTC'",
      description: 'Explicit timezone used for deterministic timestamp formatting.',
    },
    {
      name: 'HyMessageList.height',
      type: 'string',
      default: "'24rem'",
      description: 'CSS block size of the native scrolling viewport.',
    },
    {
      name: 'HyMessageList.autoScroll',
      type: "'off' | 'near-bottom' | 'always'",
      default: "'near-bottom'",
      description: 'Off, always, or only when the reader was already near the newest message.',
    },
    {
      name: 'HyMessageList.live',
      type: "'off' | 'polite'",
      default: "'off'",
      description: 'Controls live announcements; avoid announcing initial history.',
    },
    {
      name: 'HyMessageList.emptyLabel',
      type: 'string',
      default: "'No messages yet'",
      description: 'Localized text for empty.',
    },
    {
      name: 'HyMessageList.newMessagesLabel',
      type: 'string',
      default: "'New messages'",
      description: 'Localized text for new messages.',
    },
    {
      name: 'HyMessageList.loadOlderLabel',
      type: 'string',
      default: "'Load older messages'",
      description: 'Localized text for load older.',
    },
    {
      name: 'HyMessageList.canLoadOlder',
      type: 'boolean',
      default: 'false',
      description: 'Exposes the Load older messages control.',
    },
    {
      name: 'HyMessageList.loadingOlder',
      type: 'boolean',
      default: 'false',
      description: 'Disables repeated history requests and shows loading feedback.',
    },
    {
      name: 'HyMessageList.retryLabel',
      type: 'string',
      default: "'Retry message'",
      description: 'Localized text for retry.',
    },
    {
      name: 'HyMessageList.statusLabels',
      type: 'Readonly<Record<HyMessageStatus, string>>',
      default: 'see type defaults',
      description: 'Localized text for each delivery state.',
    },
    {
      name: 'HyMessageList.olderRequested',
      type: 'void',
      default: 'output',
      description: 'Requests older history from the host.',
    },
    {
      name: 'HyMessageList.retry',
      type: 'string',
      default: 'output',
      description: 'Requests another attempt for a failed message ID.',
    },
    {
      name: 'HyChatMessage',
      type: 'readonly object',
      default: 'data',
      description:
        'id, sender, text, direction, timestamp, delivery status, quote, and attachments with id/name/url.',
    },
    {
      name: 'HyChatBubble',
      type: 'component',
      default: 'standalone export',
      description: 'message, locale, timeZone, retryLabel, statusLabels; retry output.',
    },
    {
      name: 'scrollToEnd()',
      type: 'void',
      default: 'method',
      description: 'Moves to the newest content after explicit user intent.',
    },
  ];
  protected readonly messages = signal<readonly HyChatMessage[]>([
    {
      id: 'welcome',
      text: 'How can we help?',
      sender: 'Support',
      direction: 'incoming' as const,
      timestamp: '2026-11-17T09:00:00Z',
      status: 'delivered' as const,
    },
  ]);
  protected send(submission: HyChatSubmission): void {
    const text = submission.text.trim();
    if (!text) return;
    this.messages.update((items) => [
      ...items,
      {
        id: 'message-' + items.length,
        text,
        sender: 'You',
        direction: 'outgoing' as const,
        timestamp: '2026-11-17T09:05:00Z',
        status: 'delivered' as const,
      },
    ]);
  }
  protected retry(id: string): void {
    this.messages.update((items) =>
      items.map((item) => (item.id === id ? { ...item, status: 'delivered' as const } : item)),
    );
  }
}
