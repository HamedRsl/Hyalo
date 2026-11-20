import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { HyAvatar } from '@hyalo/angular/avatar';
import { HyButton } from '@hyalo/angular/button';
import { HyCard } from '@hyalo/angular/card';
import { HY_TEXT_FIELD } from '@hyalo/angular/field';
import { HyScrollArea } from '@hyalo/angular/scroll-area';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/chat';

// These records belong to this example. Extend them to match your marketplace.
type Delivery = 'received' | 'read' | 'local' | 'pending' | 'failed';
interface MarketplaceMessage {
  readonly id: string;
  readonly sender: string;
  readonly own: boolean;
  readonly text: string;
  readonly instant: string;
  readonly delivery: Delivery;
  readonly attachments: readonly { readonly name: string; readonly url: string }[];
}

@Component({
  selector: 'docs-chat-page',
  imports: [
    DocsPage,
    DocsExample,
    DocsImport,
    HyAvatar,
    HyButton,
    HyCard,
    HY_TEXT_FIELD,
    HyScrollArea,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat.html',
  styleUrl: './marketplace-chat.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  // Application-owned records, not a library conversation schema.
  readonly messages = signal<readonly MarketplaceMessage[]>([
    {
      id: 'seller-1',
      sender: 'Maya Chen',
      own: false,
      text: 'Hi! The chair is still available. It has the original oak finish.',
      instant: '2026-11-17T09:00:00Z',
      delivery: 'received',
      attachments: [
        {
          name: 'Sample attachment (PDF · demo)',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
      ],
    },
    {
      id: 'buyer-1',
      sender: 'You',
      own: true,
      text: 'It looks lovely. Could I collect it on Saturday?',
      instant: '2026-11-17T09:02:00Z',
      delivery: 'read',
      attachments: [],
    },
    {
      id: 'seller-2',
      sender: 'Maya Chen',
      own: false,
      text: 'Saturday works. I can meet you at the studio after 10.',
      instant: '2026-11-17T09:04:00Z',
      delivery: 'received',
      attachments: [],
    },
  ]);
  readonly deliveryLabels: Readonly<Record<Delivery, string>> = {
    received: 'Received',
    read: 'Read',
    local: 'Local draft',
    pending: 'Pending · demo',
    failed: 'Not sent · demo',
  };
  readonly draft = signal('');
  readonly composerError = signal('');
  readonly editingId = signal<string | null>(null);
  readonly announcement = signal('');
  readonly pending = computed(() =>
    this.messages().some((message) => message.delivery === 'pending'),
  );
  private savedDraft = '';
  private nextId = 1;

  edit(id: string): void {
    if (this.pending() || this.editingId()) return;
    const message = this.messages().find((item) => item.id === id && item.delivery === 'local');
    if (!message) return;
    this.savedDraft = this.draft();
    this.editingId.set(id);
    this.updateDraft(message.text);
    this.announcement.set('Editing local draft. Nothing has been sent.');
  }

  cancelEdit(): void {
    if (this.pending() || !this.editingId()) return;
    this.editingId.set(null);
    this.updateDraft(this.savedDraft);
    this.announcement.set('Edit cancelled. Previous composer draft restored.');
  }

  // Explicit preview controls only: no network, timers or fabricated acknowledgement.
  preview(id: string, delivery: 'pending' | 'failed' | 'local'): void {
    if (this.editingId()) return;
    const message = this.messages().find((item) => item.id === id);
    if (!message || !['local', 'pending', 'failed'].includes(message.delivery)) return;
    const allowed =
      delivery === 'pending'
        ? !this.pending() && ['local', 'failed'].includes(message.delivery)
        : message.delivery === 'pending';
    if (!allowed) return;
    this.messages.update((items) =>
      items.map((item) => (item.id === id ? { ...item, delivery } : item)),
    );
    this.announcement.set(`${this.deliveryLabels[delivery]}. Preview only; nothing is sent.`);
  }

  updateDraft(value: string): void {
    if (this.pending()) return;
    this.draft.set(value);
    this.composerError.set('');
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.pending()) return;
    const text = this.draft().trim();
    if (!text) {
      this.composerError.set('Write a message before adding a draft.');
      return;
    }
    const editingId = this.editingId();
    if (editingId) {
      this.messages.update((items) =>
        items.map((item) => (item.id === editingId ? { ...item, text } : item)),
      );
      this.editingId.set(null);
      this.draft.set(this.savedDraft);
      this.composerError.set('');
      this.announcement.set('Local draft updated. Nothing has been sent.');
      return;
    }
    this.messages.update((items) => [
      ...items,
      {
        id: `local-${this.nextId++}`,
        sender: 'You',
        own: true,
        text,
        instant: '2026-11-17T09:05:00Z',
        delivery: 'local',
        attachments: [],
      },
    ]);
    this.announcement.set('Local draft added. Nothing has been sent.');
    this.draft.set('');
    this.composerError.set('');
  }

  readonly clock = new Intl.DateTimeFormat('en-GB', { timeStyle: 'short', timeZone: 'UTC' });
  formatTime(instant: string): string {
    // Date-only values have no instant semantics. Require an explicit UTC ISO instant.
    const valid = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(instant);
    const value = Date.parse(instant);
    return valid && Number.isFinite(value) ? this.clock.format(value) : 'Time unavailable';
  }

  safeAttachmentUrl(value: string): string | null {
    const hasControlOrSpace = Array.from(value).some(
      (character) => (character.codePointAt(0) ?? 0) <= 32 || character.codePointAt(0) === 127,
    );
    if (
      !/^https?:\/\//i.test(value) ||
      value.includes('\\') ||
      hasControlOrSpace ||
      /%0[ad]/i.test(value)
    )
      return null;

    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
        ? url.href
        : null;
    } catch {
      return null;
    }
  }
}
