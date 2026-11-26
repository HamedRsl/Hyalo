import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injectable,
  type Signal,
  TemplateRef,
  Directive,
  computed,
  ElementRef,
  viewChild,
  effect,
  model,
  untracked,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HY_DIALOG_DATA, HyDialog, HyDialogRef } from '@hyalo/angular/dialog';
import { HyButton } from '@hyalo/angular/button';

export interface HyGalleryImage {
  readonly src: string;
  readonly alt: string;
  readonly thumbnail?: string;
  readonly caption?: string;
}
export interface HyLightboxTransform {
  readonly scale: number;
  readonly rotation: number;
  readonly x: number;
  readonly y: number;
  readonly flipX: boolean;
  readonly flipY: boolean;
}
const INITIAL_TRANSFORM: HyLightboxTransform = {
  scale: 1,
  rotation: 0,
  x: 0,
  y: 0,
  flipX: false,
  flipY: false,
};

export interface HyLightboxContentContext extends HyLightboxTransform {
  readonly transformStyle: string;
  readonly $implicit: HyGalleryImage;
  readonly index: number;
  readonly count: number;
}
export interface HyGalleryThumbnailContext {
  readonly $implicit: HyGalleryImage;
  readonly index: number;
}
@Directive({ selector: 'ng-template[hyLightboxContent]', exportAs: 'hyLightboxContent' })
export class HyLightboxContent {
  readonly template = inject<TemplateRef<HyLightboxContentContext>>(TemplateRef);
  static ngTemplateContextGuard(
    _directive: HyLightboxContent,
    _context: unknown,
  ): _context is HyLightboxContentContext {
    return typeof _context === 'object' && _context !== null && '$implicit' in _context;
  }
}
@Directive({ selector: 'ng-template[hyGalleryThumbnail]', exportAs: 'hyGalleryThumbnail' })
export class HyGalleryThumbnail {
  readonly template = inject<TemplateRef<HyGalleryThumbnailContext>>(TemplateRef);
  static ngTemplateContextGuard(
    _directive: HyGalleryThumbnail,
    _context: unknown,
  ): _context is HyGalleryThumbnailContext {
    return typeof _context === 'object' && _context !== null && '$implicit' in _context;
  }
}
export interface HyLightboxOptions {
  readonly contentTemplate?: TemplateRef<HyLightboxContentContext>;
  readonly captionTemplate?: TemplateRef<HyLightboxContentContext>;
  readonly index?: number;
  readonly label?: string;
  readonly closeLabel?: string;
  readonly previousLabel?: string;
  readonly nextLabel?: string;
  readonly zoomInLabel?: string;
  readonly zoomOutLabel?: string;
  readonly rotateLabel?: string;
  readonly flipHorizontalLabel?: string;
  readonly flipVerticalLabel?: string;
  readonly resetLabel?: string;
  readonly panLabel?: string;
  readonly playLabel?: string;
  readonly pauseLabel?: string;
  readonly slideshowInterval?: number;
  readonly indexChange?: (index: number) => void;
}
export type HyLightboxRef = HyDialogRef & {
  readonly index: Signal<number>;
  readonly playing: Signal<boolean>;
  goTo(index: number): void;
  play(): void;
  pause(): void;
  zoomIn(): void;
  zoomOut(): void;
  rotate(): void;
  flipHorizontal(): void;
  flipVertical(): void;
  panBy(x: number, y: number): void;
  resetTransform(): void;
  update(images: readonly HyGalleryImage[], options?: HyLightboxOptions): void;
  readonly transform: Signal<HyLightboxTransform>;
};
interface GalleryData extends HyLightboxOptions {
  readonly attach?: (view: HyLightboxView) => void;
  readonly images: readonly HyGalleryImage[];
}

@Component({
  selector: 'hy-lightbox-view',
  imports: [HyButton, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown)': 'onKey($event)' },
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.css',
})
export class HyLightboxView {
  private readonly initialData = inject(HY_DIALOG_DATA) as GalleryData;
  private readonly configuration = signal<GalleryData>(this.initialData);
  protected readonly data = this.configuration.asReadonly();
  protected readonly ref = inject(HyDialogRef);
  readonly index = signal(
    Math.max(
      0,
      Math.min(this.initialData.images.length - 1, Math.trunc(this.initialData.index ?? 0) || 0),
    ),
  );
  protected readonly image = computed(() => this.data().images[this.index()]);
  private readonly stage = viewChild<ElementRef<HTMLElement>>('stage');
  private readonly transformState = signal(INITIAL_TRANSFORM);
  readonly transform = this.transformState.asReadonly();
  private pointer: { id: number; x: number; y: number } | undefined;
  protected readonly dragging = signal(false);
  readonly playing = signal(false);
  protected readonly contentContext = computed<HyLightboxContentContext | undefined>(() => {
    const image = this.image();
    if (!image) return undefined;
    const transform = this.transform();
    const { scale, rotation, x, y, flipX, flipY } = transform;
    return {
      ...transform,
      transformStyle: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${flipX ? -scale : scale}, ${flipY ? -scale : scale})`,
      $implicit: image,
      index: this.index(),
      count: this.data().images.length,
    };
  });
  private readonly destroyRef = inject(DestroyRef);
  private timer?: ReturnType<typeof setInterval>;
  constructor() {
    this.initialData.attach?.(this);
    this.destroyRef.onDestroy(() => this.pause());
  }
  get destroyed(): boolean {
    return this.destroyRef.destroyed;
  }
  zoomIn(): void {
    this.setTransform({ ...this.transform(), scale: Math.min(4, this.transform().scale + 0.25) });
  }
  zoomOut(): void {
    this.setTransform({
      ...this.transform(),
      scale: Math.max(0.25, this.transform().scale - 0.25),
    });
  }
  rotate(): void {
    const current = this.transform();
    this.setTransform({ ...current, rotation: (current.rotation + 90) % 360 });
  }
  flipHorizontal(): void {
    this.transformState.update((value) => ({ ...value, flipX: !value.flipX }));
  }
  flipVertical(): void {
    this.transformState.update((value) => ({ ...value, flipY: !value.flipY }));
  }
  resetTransform(): void {
    this.transformState.set(INITIAL_TRANSFORM);
  }
  panBy(x: number, y: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const current = this.transform();
    this.setTransform({ ...current, x: current.x + x, y: current.y + y });
  }
  private setTransform(next: HyLightboxTransform): void {
    const stage = this.stage()?.nativeElement;
    const media = stage?.querySelector<HTMLElement>('[data-lightbox-media] > *');
    const rotated = next.rotation % 180 !== 0;
    const limitX =
      Math.max(
        0,
        ((rotated ? media?.offsetHeight : media?.offsetWidth) ?? 0) * next.scale -
          (stage?.clientWidth ?? 0),
      ) / 2;
    const limitY =
      Math.max(
        0,
        ((rotated ? media?.offsetWidth : media?.offsetHeight) ?? 0) * next.scale -
          (stage?.clientHeight ?? 0),
      ) / 2;
    this.transformState.set({
      ...next,
      x: Math.max(-limitX, Math.min(limitX, next.x)),
      y: Math.max(-limitY, Math.min(limitY, next.y)),
    });
  }
  protected startPan(event: PointerEvent): void {
    if (event.button !== 0 || !event.isPrimary || this.transform().scale <= 1) return;
    if ((event.target as Element).closest('button, a, input, select, textarea, video, audio'))
      return;
    const stage = this.stage()?.nativeElement;
    if (!stage) return;
    this.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    stage.setPointerCapture(event.pointerId);
    this.dragging.set(true);
  }
  protected movePan(event: PointerEvent): void {
    const pointer = this.pointer;
    if (pointer?.id !== event.pointerId) return;
    this.panBy(event.clientX - pointer.x, event.clientY - pointer.y);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }
  protected stopPan(event: PointerEvent): void {
    if (this.pointer?.id !== event.pointerId) return;
    this.pointer = undefined;
    this.dragging.set(false);
  }
  protected panWithKey(event: KeyboardEvent): void {
    if (
      event.target !== event.currentTarget ||
      this.transform().scale <= 1 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const x = event.key === 'ArrowLeft' ? -32 : event.key === 'ArrowRight' ? 32 : 0;
    const y = event.key === 'ArrowUp' ? -32 : event.key === 'ArrowDown' ? 32 : 0;
    if (!x && !y) return;
    event.preventDefault();
    this.panBy(x, y);
  }
  goTo(index: number): void {
    const next = Math.max(0, Math.min(this.data().images.length - 1, Math.trunc(index) || 0));
    if (next === this.index()) return;
    this.index.set(next);
    this.resetTransform();
    this.data().indexChange?.(next);
  }
  update(images: readonly HyGalleryImage[], options?: HyLightboxOptions): void {
    if (!images.length) {
      this.pause();
      this.ref.close();
      return;
    }
    const previous = this.data();
    if (previous.images === images && !options) return;
    const oldImage = this.image();
    const next = Math.max(
      0,
      Math.min(images.length - 1, Math.trunc(options?.index ?? this.index()) || 0),
    );
    const wasPlaying = this.playing();
    const restart =
      previous.slideshowInterval !==
        (options ? options.slideshowInterval : previous.slideshowInterval) ||
      (wasPlaying && images.length < 2);
    if (restart) this.pause();
    this.configuration.set({ ...(options ?? previous), images });
    if (options && options.label !== previous.label) {
      this.ref.containerElement?.setAttribute('aria-label', options.label ?? 'Image gallery');
    }
    if (oldImage?.src !== images[next]?.src || this.index() !== next) this.resetTransform();
    if (this.index() !== next) {
      this.index.set(next);
      this.data().indexChange?.(next);
    }
    if (restart && wasPlaying) this.play();
  }
  play(): void {
    if (this.destroyRef.destroyed || this.playing() || this.data().images.length < 2) return;
    this.playing.set(true);
    const interval = this.data().slideshowInterval ?? 3000;
    this.timer = setInterval(
      () => {
        if (this.index() >= this.data().images.length - 1) this.pause();
        else this.move(1);
      },
      Number.isFinite(interval) ? Math.max(100, interval) : 3000,
    );
  }
  pause(): void {
    clearInterval(this.timer);
    this.playing.set(false);
  }
  protected move(delta: number): void {
    this.goTo(this.index() + delta);
  }
  protected onKey(event: KeyboardEvent): void {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (event.target as HTMLElement).closest(
        'input, textarea, select, [contenteditable], audio, video',
      )
    )
      return;
    const rtl =
      (event.currentTarget as HTMLElement).ownerDocument.defaultView?.getComputedStyle(
        event.currentTarget as HTMLElement,
      ).direction === 'rtl';
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.move(rtl ? -1 : 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.move(rtl ? 1 : -1);
    }
  }
}
/** Opens a gallery using the kit dialog's focus trap, Escape handling and focus restore. */
@Injectable({ providedIn: 'root' })
export class HyLightbox {
  private readonly dialog = inject(HyDialog);
  open(images: readonly HyGalleryImage[], options: HyLightboxOptions = {}): HyLightboxRef | null {
    if (!images.length) return null;
    let view: HyLightboxView | undefined;
    const ref = this.dialog.open(HyLightboxView, {
      size: 'full',
      label: options.label ?? 'Image gallery',
      data: {
        ...options,
        images,
        attach: (instance: HyLightboxView) => {
          view = instance;
        },
      },
    });
    // Dialog content is instantiated synchronously by the CDK. Keep the original ref.
    const viewer = view;
    if (!viewer) throw new Error('Lightbox content was not created synchronously.');
    return Object.assign(ref, {
      index: viewer.index.asReadonly(),
      playing: viewer.playing.asReadonly(),
      transform: viewer.transform,
      update: (items: readonly HyGalleryImage[], config?: HyLightboxOptions) => {
        if (!viewer.destroyed) viewer.update(items, config);
      },
      flipHorizontal: () => {
        if (!viewer.destroyed) viewer.flipHorizontal();
      },
      flipVertical: () => {
        if (!viewer.destroyed) viewer.flipVertical();
      },
      panBy: (x: number, y: number) => {
        if (!viewer.destroyed) viewer.panBy(x, y);
      },
      resetTransform: () => {
        if (!viewer.destroyed) viewer.resetTransform();
      },
      goTo: (index: number) => {
        if (!viewer.destroyed) viewer.goTo(index);
      },
      play: () => viewer.play(),
      pause: () => viewer.pause(),
      zoomIn: () => {
        if (!viewer.destroyed) viewer.zoomIn();
      },
      zoomOut: () => {
        if (!viewer.destroyed) viewer.zoomOut();
      },
      rotate: () => {
        if (!viewer.destroyed) viewer.rotate();
      },
    });
  }
}
@Component({
  selector: 'hy-gallery',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class HyGallery {
  private readonly lightbox = inject(HyLightbox);
  readonly images = input.required<readonly HyGalleryImage[]>();
  readonly label = input('Image gallery');
  readonly openLabel = input('Open image');
  readonly thumbnailTemplate = input<TemplateRef<HyGalleryThumbnailContext>>();
  /** Minimum column width. The grid adds a column when the container can fit it. */
  readonly thumbnailMinWidth = input('10rem');
  readonly thumbnailAspectRatio = input('4 / 3');
  readonly thumbnailGap = input('var(--hy-space-3)');
  readonly options = input<HyLightboxOptions>({});
  readonly index = model(0);
  readonly visible = model(false);
  private readonly active = signal<HyLightboxRef | null>(null);
  private closing: HyLightboxRef | null = null;
  private readonly destroyRef = inject(DestroyRef);
  constructor() {
    effect(() => {
      const visible = this.visible();
      const index = this.index();
      const active = this.active();
      const images = this.images();
      const options = this.options();
      const label = this.label();
      untracked(() => {
        if (!visible) {
          active?.close();
          return;
        }
        const config: HyLightboxOptions = {
          ...options,
          label,
          index,
          indexChange: (next) => {
            this.index.set(next);
            options.indexChange?.(next);
          },
        };
        if (active) {
          if (this.closing !== active) active.update(images, config);
          return;
        }
        const ref = this.lightbox.open(images, config);
        this.active.set(ref);
        if (!ref) {
          this.visible.set(false);
          return;
        }
        ref.beforeClosed.subscribe(() => {
          if (this.active() !== ref) return;
          this.closing = ref;
          this.visible.set(false);
        });
        this.index.set(ref.index());
        void ref.closed.then(() => {
          if (this.active() !== ref) return;
          const wasClosing = this.closing === ref;
          this.closing = null;
          this.active.set(null);
          if (!wasClosing && !this.destroyRef.destroyed) this.visible.set(false);
        });
      });
    });
    this.destroyRef.onDestroy(() => this.active()?.close());
  }
  open(index: number): void {
    this.index.set(index);
    this.visible.set(true);
  }
  play(): void {
    this.active()?.play();
  }
  pause(): void {
    this.active()?.pause();
  }
}
