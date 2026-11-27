import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HyAvatar } from '@hyalo/angular/avatar';
import { HyButton } from '@hyalo/angular/button';
import { HyCard } from '@hyalo/angular/card';
import { HY_TEXT_FIELD } from '@hyalo/angular/field';
import { HyScrollArea } from '@hyalo/angular/scroll-area';
import {
  HyContextMenu,
  HyContextMenuTrigger,
  type HyContextAction,
} from '@hyalo/angular/context-menu';
import { HyFileUpload } from '@hyalo/angular/file-upload';
import { HyIcon } from '@hyalo/angular/icon';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { EXAMPLE } from './examples/chat';

// These records belong to this example. Extend them to match your marketplace.
type Delivery = 'received' | 'read' | 'local' | 'pending' | 'failed';
type ConversationKind = 'direct' | 'group' | 'forum';
interface MarketplaceAttachment {
  readonly name: string;
  readonly url: string;
  readonly type?: string;
}
interface MarketplaceMessage {
  readonly id: string;
  readonly sender: string;
  readonly own: boolean;
  readonly text: string;
  readonly instant: string;
  readonly delivery: Delivery;
  readonly attachments: readonly MarketplaceAttachment[];
  readonly reply?: { readonly id: string; readonly sender: string; readonly text: string };
  readonly forwardedFrom?: string;
  readonly reactions?: readonly string[];
  readonly edited?: boolean;
}

interface MarketplaceConversation {
  readonly id: string;
  readonly name: string;
  readonly listing: string;
  readonly price: string;
  readonly preview: string;
  readonly unread: number;
  readonly kind: ConversationKind;
  readonly online?: boolean;
  readonly muted?: boolean;
}

interface PhotoEdit {
  readonly file: File;
  readonly image: ImageBitmap;
  readonly turns: number;
  readonly ratio: number;
}

const DEFAULT_CONVERSATION: MarketplaceConversation = {
  id: 'maya',
  name: 'Maya Chen',
  listing: 'Oak lounge chair',
  price: '$240',
  preview: 'Saturday works. I can meet you at the studio after 10.',
  unread: 0,
  kind: 'direct',
  online: true,
};

const EMOJI = [
  { value: '\u{1F44D}', label: 'Thumbs up' },
  { value: '\u2764\uFE0F', label: 'Heart' },
  { value: '\u{1F60A}', label: 'Smile' },
  { value: '\u{1F602}', label: 'Tears of joy' },
  { value: '\u{1F389}', label: 'Celebrate' },
  { value: '\u{1F64F}', label: 'Thank you' },
  { value: '\u{1F44B}', label: 'Wave' },
  { value: '\u{1F917}', label: 'Hug' },
  { value: '\u{1F60E}', label: 'Sunglasses' },
  { value: '\u{1F914}', label: 'Thinking' },
  { value: '\u{1F62E}', label: 'Surprised' },
  { value: '\u{1F622}', label: 'Sad' },
  { value: '\u{1F525}', label: 'Fire' },
  { value: '\u2728', label: 'Sparkles' },
  { value: '\u2705', label: 'Check' },
  { value: '\u{1F4E6}', label: 'Package' },
  { value: '\u{1F4CD}', label: 'Location' },
  { value: '\u{1F4F8}', label: 'Camera' },
] as const;

const CONVERSATION_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'direct', label: 'Direct' },
  { value: 'group', label: 'Groups' },
  { value: 'forum', label: 'Forums' },
] as const;

const DIRECTORY: readonly MarketplaceConversation[] = [
  {
    id: 'leila',
    name: 'Leila Morgan',
    listing: 'Ceramic planter',
    price: '$32',
    preview: 'No messages yet',
    unread: 0,
    kind: 'direct',
  },
  {
    id: 'jamie',
    name: 'Jamie Park',
    listing: 'Oak bookcase',
    price: '$180',
    preview: 'No messages yet',
    unread: 0,
    kind: 'direct',
    online: true,
  },
];

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
    HyContextMenu,
    HyContextMenuTrigger,
    HyFileUpload,
    HyIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat.html',
  styleUrls: ['./marketplace-chat.css', './marketplace-composer.css'],
})
export default class Page {
  protected readonly example = EXAMPLE;
  private readonly destroy = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly composer = viewChild.required<ElementRef<HTMLTextAreaElement>>('composer');
  private readonly conversationHeading =
    viewChild.required<ElementRef<HTMLElement>>('conversationHeading');
  private readonly history = viewChild.required<unknown, ElementRef<HTMLElement>>('history', {
    read: ElementRef,
  });
  private readonly photoPreview = viewChild<ElementRef<HTMLCanvasElement>>('photoPreview');
  private readonly savedMessages = new Map<string, readonly MarketplaceMessage[]>();
  private readonly savedComposers = new Map<
    string,
    {
      text: string;
      files: readonly File[];
      reply: MarketplaceMessage | null;
    }
  >();
  private readonly objectUrls = new Set<string>();
  private photoRequest = 0;
  private recorder: MediaRecorder | undefined;
  private recordingStream: MediaStream | undefined;
  private recordingRequest = 0;
  protected readonly recording = signal<'idle' | 'starting' | 'active'>('idle');
  protected readonly conversationId = signal('maya');
  protected readonly listOpen = signal(false);
  protected readonly directoryOpen = signal(false);
  protected readonly contacts = computed(() =>
    DIRECTORY.filter((contact) => !this.conversations().some((chat) => chat.id === contact.id)),
  );
  protected readonly search = signal('');
  protected readonly filters = CONVERSATION_FILTERS;
  protected readonly filter = signal<(typeof CONVERSATION_FILTERS)[number]['value']>('all');
  protected readonly emojiQuery = signal('');
  protected readonly emoji = computed(() => {
    const query = this.emojiQuery().trim().toLowerCase();
    return EMOJI.filter(
      ({ label, value }) => label.toLowerCase().includes(query) || value === query,
    );
  });
  protected readonly conversations = signal<readonly MarketplaceConversation[]>([
    DEFAULT_CONVERSATION,
    {
      id: 'nora',
      name: 'Nora Patel',
      listing: 'Studio lamp',
      price: '$85',
      preview: 'I can send a few more photos.',
      unread: 2,
      kind: 'direct',
    },
    {
      id: 'alex',
      name: 'Alex Rivera',
      listing: 'Walnut side table',
      price: '$120',
      preview: 'Thanks for asking about the table!',
      unread: 0,
      kind: 'direct',
    },
    {
      id: 'studio',
      name: 'Studio pickup group',
      listing: 'Weekend pickup',
      price: '',
      preview: 'The studio opens at 10 on Saturday.',
      unread: 0,
      kind: 'group',
      muted: true,
    },
    {
      id: 'forum',
      name: 'Marketplace help',
      listing: 'Community forum',
      price: '',
      preview: 'Use this thread for collection questions.',
      unread: 0,
      kind: 'forum',
    },
  ]);
  protected readonly conversation = computed(
    () =>
      this.conversations().find(({ id }) => id === this.conversationId()) ?? DEFAULT_CONVERSATION,
  );
  protected readonly visibleConversations = computed(() => {
    const query = this.search().trim().toLowerCase();
    const filter = this.filter();
    return this.conversations().filter(
      ({ name, listing, unread, kind }) =>
        (filter === 'all' || kind === filter || (filter === 'unread' && unread > 0)) &&
        `${name} ${listing}`.toLowerCase().includes(query),
    );
  });
  protected readonly files = signal<readonly File[]>([]);
  protected readonly photo = signal<PhotoEdit | null>(null);
  protected readonly savingPhoto = signal(false);
  protected readonly ratios = [
    { value: 0, label: 'Original' },
    { value: 1, label: 'Square' },
    { value: 4 / 3, label: '4:3' },
    { value: 16 / 9, label: '16:9' },
  ];
  protected readonly attachmentsOpen = signal(false);
  protected readonly emojiOpen = signal(false);
  protected readonly replying = signal<MarketplaceMessage | null>(null);
  protected readonly forwarding = signal<MarketplaceMessage | null>(null);
  protected readonly deleting = signal<MarketplaceMessage | null>(null);
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
  readonly historyScrolled = signal(false);
  readonly composerError = signal('');
  readonly editingId = signal<string | null>(null);
  readonly announcement = signal('');
  readonly pending = computed(() =>
    this.messages().some((message) => message.delivery === 'pending'),
  );
  private savedDraft = '';
  private nextId = 1;

  constructor() {
    this.scrollToLatest();
    afterNextRender(() => this.keepComposerInView());
    afterRenderEffect({
      write: () => {
        const photo = this.photo();
        const preview = this.photoPreview()?.nativeElement;
        if (photo && preview) this.drawPhoto(preview, photo, 640);
      },
    });
    this.destroy.onDestroy(() => {
      this.cancelRecording();
      this.closePhoto();
      for (const url of this.objectUrls) URL.revokeObjectURL(url);
    });
  }

  private keepComposerInView(): void {
    const input = this.composer().nativeElement;
    const bar = input.closest<HTMLElement>('.marketplace-actions');
    const document = input.ownerDocument;
    const view = document.defaultView;
    const viewport = view?.visualViewport;
    if (!bar || !view || !viewport) return;

    const touch = view.matchMedia('(pointer: coarse)');
    let frame = 0;
    const schedule = (): void => {
      if (frame || !touch.matches || document.activeElement !== input) return;
      frame = view.requestAnimationFrame(() => {
        frame = 0;
        // The keyboard can shrink the visible viewport without resizing the page.
        if (document.activeElement !== input || viewport.scale !== 1) return;
        bar.style.setProperty('--marketplace-visible-height', `${viewport.height}px`);
        const visibleBottom = viewport.offsetTop + viewport.height;
        const overflow = bar.getBoundingClientRect().bottom + 8 - visibleBottom;
        if (overflow > 1) view.scrollBy({ top: Math.ceil(overflow), behavior: 'instant' });
      });
    };
    const clearHeight = (): void => {
      bar.style.removeProperty('--marketplace-visible-height');
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(bar);
    viewport.addEventListener('resize', schedule);
    input.addEventListener('focus', schedule);
    input.addEventListener('blur', clearHeight);
    this.destroy.onDestroy(() => {
      observer.disconnect();
      viewport.removeEventListener('resize', schedule);
      input.removeEventListener('focus', schedule);
      input.removeEventListener('blur', clearHeight);
      view.cancelAnimationFrame(frame);
    });
  }

  protected selectConversation(chat: MarketplaceConversation): void {
    if (this.listOpen() || this.filter() === 'unread') {
      afterNextRender(() => this.conversationHeading().nativeElement.focus(), {
        injector: this.injector,
      });
    }
    this.listOpen.set(false);
    this.directoryOpen.set(false);
    const previous = this.conversationId();
    if (chat.id === previous) return;
    if (this.editingId()) this.cancelEdit();
    this.cancelRecording();
    this.closePhoto();
    this.savedMessages.set(previous, this.messages());
    this.savedComposers.set(previous, {
      text: this.draft(),
      files: this.files(),
      reply: this.replying(),
    });
    const draft = this.savedComposers.get(chat.id);
    this.conversationId.set(chat.id);
    this.messages.set(
      this.savedMessages.get(chat.id) ?? [
        {
          id: `${chat.id}-1`,
          sender: chat.name,
          text: chat.preview,
          own: false,
          instant: '2026-11-17T09:00:00Z',
          delivery: 'received',
          attachments: [],
        },
      ],
    );
    this.savedMessages.delete(chat.id);
    this.savedComposers.delete(chat.id);
    this.updateConversation(chat.id, { unread: 0 });
    this.historyScrolled.set(false);
    this.draft.set(draft?.text ?? '');
    this.files.set(draft?.files ?? []);
    this.replying.set(draft?.reply ?? null);
    this.composerError.set('');
    this.announcement.set('');
    this.forwarding.set(null);
    this.deleting.set(null);
    this.emojiOpen.set(false);
    this.emojiQuery.set('');
    this.attachmentsOpen.set(!!this.files().length);
    this.scrollToLatest();
  }

  protected startConversation(contact: MarketplaceConversation): void {
    if (this.conversations().some(({ id }) => id === contact.id)) return;
    this.savedMessages.set(contact.id, []);
    this.conversations.update((chats) => [...chats, contact]);
    this.search.set('');
    this.filter.set('all');
    this.selectConversation(contact);
    this.focusComposer();
  }

  private updateConversation(id: string, patch: Partial<MarketplaceConversation>): void {
    this.conversations.update((chats) =>
      chats.map((chat) => (chat.id === id ? { ...chat, ...patch } : chat)),
    );
  }

  private readonly standardActions: readonly HyContextAction[] = [
    { id: 'reply', label: 'Reply', icon: 'reply' },
    { id: 'forward', label: 'Forward', icon: 'arrow-end' },
    {
      id: 'react',
      label: 'React', icon: 'smile',
      children: EMOJI.slice(0, 6).map(({ value, label }) => ({
        id: value,
        label: `${value} ${label}`,
      })),
    },
    { id: 'copy', label: 'Copy text', icon: 'copy' },
  ];
  private readonly ownActions: readonly HyContextAction[] = [
    ...this.standardActions,
    { id: 'edit', label: 'Edit draft' },
    { id: 'delete', label: 'Delete draft' },
  ];

  protected actionsFor(message: MarketplaceMessage): readonly HyContextAction[] {
    return message.delivery === 'local' ? this.ownActions : this.standardActions;
  }

  protected openMessageMenu(event: MouseEvent, trigger: HyContextMenuTrigger): void {
    if ((event.target as Element).closest('a, audio, video, button')) return;
    trigger.openFromEvent(event);
  }

  protected async messageAction(action: string, message: MarketplaceMessage): Promise<void> {
    switch (action) {
      case 'reply':
        if (this.pending() || this.editingId()) return;
        this.replying.set(message);
        this.focusComposer();
        break;
      case 'forward':
        this.deleting.set(null);
        this.forwarding.set(message);
        break;
      case 'edit':
        this.edit(message.id);
        this.focusComposer();
        break;
      case 'delete':
        this.forwarding.set(null);
        this.deleting.set(message);
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(message.text);
          this.announcement.set('Message copied.');
        } catch {
          this.announcement.set('Clipboard unavailable. Select the message to copy it.');
        }
        break;
      default:
        if (EMOJI.some(({ value }) => value === action)) this.toggleReaction(message, action);
    }
  }

  protected toggleReaction(message: MarketplaceMessage, emoji: string): void {
    this.messages.update((items) =>
      items.map((item) => {
        if (item.id !== message.id) return item;
        const reactions = item.reactions ?? [];
        return {
          ...item,
          reactions: reactions.includes(emoji)
            ? reactions.filter((value) => value !== emoji)
            : [...reactions, emoji],
        };
      }),
    );
  }

  protected jumpToReply(id: string): void {
    const history = this.history().nativeElement;
    const row = Array.from(history.querySelectorAll<HTMLElement>('[data-message-id]')).find(
      (element) => element.dataset['messageId'] === id,
    );
    row
      ?.querySelector<HTMLButtonElement>('.marketplace-message-footer button')
      ?.focus({ preventScroll: true });
    if (row)
      history.scrollTop +=
        row.getBoundingClientRect().top - history.getBoundingClientRect().top - history.clientTop;
    else this.announcement.set('The original message is unavailable.');
  }

  protected forward(chat: MarketplaceConversation): void {
    const message = this.forwarding();
    if (!message || chat.id === this.conversationId()) return;
    // Seed an unopened conversation with its original incoming message first.
    const previous = this.savedMessages.get(chat.id) ?? [
      {
        id: `${chat.id}-1`,
        sender: chat.name,
        text: chat.preview,
        own: false,
        instant: '2026-11-17T09:00:00Z',
        delivery: 'received' as const,
        attachments: [],
      },
    ];
    this.savedMessages.set(chat.id, [
      ...previous,
      {
        ...this.localMessage(message.text, message.attachments),
        forwardedFrom: message.forwardedFrom ?? message.sender,
      },
    ]);
    this.updateConversation(chat.id, { preview: message.text || 'Attachment' });
    this.forwarding.set(null);
    this.announcement.set(`Message forwarded to ${chat.name} in this demo.`);
  }

  protected deleteDraft(): void {
    const message = this.deleting();
    if (!message || message.delivery !== 'local') return;
    if (this.editingId() === message.id) this.cancelEdit();
    if (this.replying()?.id === message.id) this.replying.set(null);
    this.messages.update((items) => items.filter(({ id }) => id !== message.id));
    this.releaseAttachments(message.attachments);
    this.updatePreview();
    this.deleting.set(null);
    this.announcement.set('Local draft deleted.');
    this.focusComposer();
  }

  protected insertEmoji(value: string): void {
    if (this.pending()) return;
    const input = this.composer().nativeElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = this.draft();
    this.updateDraft(text.slice(0, start) + value + text.slice(end));
    this.emojiOpen.set(false);
    this.emojiQuery.set('');
    afterNextRender(
      () => {
        input.focus();
        input.setSelectionRange(start + value.length, start + value.length);
      },
      { injector: this.injector },
    );
  }

  protected addPhoto(input: HTMLInputElement, upload: HyFileUpload): void {
    upload.addFiles(Array.from(input.files ?? []));
    input.value = '';
  }

  protected canEditPhoto(file: File): boolean {
    return ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type);
  }

  protected async editPhoto(file: File): Promise<void> {
    this.closePhoto();
    const request = this.photoRequest;
    try {
      const image = await createImageBitmap(file);
      if (request !== this.photoRequest || !this.files().includes(file)) {
        image.close();
        return;
      }
      this.photo.set({ file, image, turns: 0, ratio: 0 });
    } catch {
      if (request === this.photoRequest) this.announcement.set('The photo could not be opened.');
    }
  }

  protected changePhoto(ratio: number, rotate = false): void {
    if (this.savingPhoto()) return;
    this.photo.update(
      (photo) => photo && { ...photo, ratio, turns: (photo.turns + Number(rotate)) % 4 },
    );
  }

  protected closePhoto(): void {
    this.photoRequest++;
    this.photo()?.image.close();
    this.photo.set(null);
    this.savingPhoto.set(false);
  }

  protected updateFiles(files: readonly File[]): void {
    const photo = this.photo();
    if (photo && !files.includes(photo.file)) this.closePhoto();
    this.files.set(files);
  }

  protected async savePhoto(): Promise<void> {
    const photo = this.photo();
    if (!photo || this.savingPhoto()) return;
    const request = this.photoRequest;
    const canvas = this.composer().nativeElement.ownerDocument.createElement('canvas');
    this.savingPhoto.set(true);
    try {
      this.drawPhoto(canvas, photo, 2048);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/webp', 0.9),
      );
      if (request !== this.photoRequest) return;
      if (!blob || blob.size > 10 * 1024 * 1024) throw new Error('Invalid photo export');
      const extension = blob.type === 'image/webp' ? 'webp' : 'png';
      const name = photo.file.name.replace(/\.[^.]+$/, '');
      const file = new File([blob], `${name}-edited.${extension}`, { type: blob.type });
      this.files.update((files) => files.map((item) => (item === photo.file ? file : item)));
      this.closePhoto();
      this.announcement.set('Edited photo attached.');
      this.focusComposer();
    } catch {
      if (request === this.photoRequest) this.announcement.set('Photo edits could not be saved.');
    } finally {
      if (request === this.photoRequest) this.savingPhoto.set(false);
    }
  }

  private drawPhoto(canvas: HTMLCanvasElement, photo: PhotoEdit, maxSide: number): void {
    const { image, turns, ratio } = photo;
    const width = turns % 2 ? image.height : image.width;
    const height = turns % 2 ? image.width : image.height;
    const cropWidth = ratio ? Math.min(width, height * ratio) : width;
    const cropHeight = ratio ? cropWidth / ratio : height;
    const scale = Math.min(1, maxSide / Math.max(cropWidth, cropHeight));
    canvas.width = Math.max(1, Math.round(cropWidth * scale));
    canvas.height = Math.max(1, Math.round(cropHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) return;
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(scale, scale);
    context.rotate((turns * Math.PI) / 2);
    context.drawImage(image, -image.width / 2, -image.height / 2);
  }

  protected async startRecording(): Promise<void> {
    if (this.pending() || this.editingId() || this.photo() || this.recording() !== 'idle') return;
    const request = ++this.recordingRequest;
    let stream: MediaStream | undefined;
    this.recording.set('starting');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (request !== this.recordingRequest || this.pending()) {
        stream.getTracks().forEach((track) => track.stop());
        if (request === this.recordingRequest) this.recording.set('idle');
        return;
      }
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      let size = 0;
      recorder.ondataavailable = ({ data }) => {
        size += data.size;
        if (size <= 10 * 1024 * 1024) chunks.push(data);
        else if (recorder.state === 'recording') recorder.stop();
      };
      recorder.onstop = () => {
        if (request !== this.recordingRequest) return;
        this.cancelRecording();
        if (size > 10 * 1024 * 1024 || this.files().length >= 5) {
          this.announcement.set('Recording exceeds the attachment limit.');
        } else if (size) {
          const type = recorder.mimeType || chunks[0]?.type || 'audio/webm';
          const extension = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
          this.files.update((files) => [
            ...files,
            new File(chunks, `Voice message.${extension}`, { type }),
          ]);
          this.attachmentsOpen.set(true);
          this.announcement.set('Voice recording attached.');
        }
      };
      recorder.onerror = () => {
        if (request !== this.recordingRequest) return;
        this.cancelRecording();
        this.announcement.set('Voice recording could not be completed.');
      };
      recorder.start(1000);
      this.recorder = recorder;
      this.recordingStream = stream;
      this.recording.set('active');
    } catch {
      stream?.getTracks().forEach((track) => track.stop());
      if (request !== this.recordingRequest) return;
      this.cancelRecording();
      this.announcement.set('Microphone unavailable. Check permission or attach an audio file.');
    }
  }

  protected finishRecording(): void {
    if (this.recorder?.state === 'recording') this.recorder.stop();
  }

  protected cancelRecording(): void {
    this.recordingRequest++;
    if (this.recorder?.state === 'recording') this.recorder.stop();
    this.recordingStream?.getTracks().forEach((track) => track.stop());
    this.recorder = undefined;
    this.recordingStream = undefined;
    this.recording.set('idle');
  }

  protected isLocalAttachment(url: string): boolean {
    return this.objectUrls.has(url);
  }

  private releaseAttachments(attachments: readonly MarketplaceAttachment[]): void {
    if (!attachments.length) return;
    const histories = [this.messages(), ...this.savedMessages.values()];
    for (const { url } of attachments) {
      if (
        this.objectUrls.has(url) &&
        !histories.some((messages) =>
          messages.some((message) =>
            message.attachments.some((attachment) => attachment.url === url),
          ),
        )
      ) {
        this.objectUrls.delete(url);
        URL.revokeObjectURL(url);
      }
    }
  }

  private focusComposer(): void {
    afterNextRender(() => this.composer().nativeElement.focus({ preventScroll: true }), {
      injector: this.injector,
    });
  }

  private scrollToLatest(): void {
    afterNextRender(
      () => {
        const node = this.history().nativeElement;
        node.scrollTop = node.scrollHeight;
      },
      { injector: this.injector },
    );
  }

  private localMessage(
    text: string,
    attachments: readonly MarketplaceAttachment[],
  ): MarketplaceMessage {
    return {
      id: `local-${this.nextId++}`,
      sender: 'You',
      own: true,
      text,
      instant: '2026-11-17T09:05:00Z',
      delivery: 'local',
      attachments,
    };
  }

  private updatePreview(): void {
    const latest = this.messages().at(-1);
    this.updateConversation(this.conversationId(), {
      preview: latest ? latest.text || 'Attachment' : 'No messages yet',
    });
  }

  edit(id: string): void {
    if (this.pending() || this.editingId() || this.recording() !== 'idle') return;
    const message = this.messages().find((item) => item.id === id && item.delivery === 'local');
    if (!message) return;
    this.closePhoto();
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
    if (this.editingId() || this.recording() !== 'idle') return;
    const message = this.messages().find((item) => item.id === id);
    if (!message || !['local', 'pending', 'failed'].includes(message.delivery)) return;
    const allowed =
      delivery === 'pending'
        ? !this.pending() && ['local', 'failed'].includes(message.delivery)
        : message.delivery === 'pending';
    if (!allowed) return;
    this.closePhoto();
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
    if (this.pending() || this.recording() !== 'idle' || this.photo()) return;
    const text = this.draft().trim();
    const editingId = this.editingId();
    if (!text && (editingId || !this.files().length)) {
      this.composerError.set('Write a message before adding a draft.');
      return;
    }
    if (editingId) {
      this.messages.update((items) =>
        items.map((item) => (item.id === editingId ? { ...item, text, edited: true } : item)),
      );
      this.editingId.set(null);
      this.draft.set(this.savedDraft);
      this.composerError.set('');
      this.announcement.set('Local draft updated. Nothing has been sent.');
      this.updatePreview();
      return;
    }
    const attachments = this.files().map((file) => {
      const url = URL.createObjectURL(file);
      this.objectUrls.add(url);
      return { name: file.name, type: file.type, url };
    });
    const source = this.replying();
    const reply = source && {
      id: source.id,
      sender: source.sender,
      text: source.text || 'Attachment',
    };
    this.messages.update((items) => [
      ...items,
      { ...this.localMessage(text, attachments), reply: reply ?? undefined },
    ]);
    this.updatePreview();
    this.announcement.set('Local draft added. Nothing has been sent.');
    this.draft.set('');
    this.files.set([]);
    this.replying.set(null);
    this.attachmentsOpen.set(false);
    this.emojiOpen.set(false);
    this.composerError.set('');
    this.scrollToLatest();
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
