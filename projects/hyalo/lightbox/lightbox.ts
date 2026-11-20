import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injectable,
  Signal,
  computed,
  effect,
  model,
  untracked,
  inject,
  input,
  signal,
} from '@angular/core';
import { HY_DIALOG_DATA, HyDialog, HyDialogRef } from '@hyalo/angular/dialog';
import { HyButton } from '@hyalo/angular/button';

export interface HyGalleryImage {
  readonly src: string;
  readonly alt: string;
  readonly thumbnail?: string;
  readonly caption?: string;
}
export interface HyLightboxOptions {
  readonly index?: number;
  readonly label?: string;
  readonly closeLabel?: string;
  readonly previousLabel?: string;
  readonly nextLabel?: string;
  readonly zoomInLabel?: string;
  readonly zoomOutLabel?: string;
  readonly rotateLabel?: string;
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
};
interface GalleryData extends HyLightboxOptions {
  readonly attach?: (view: HyLightboxView) => void;
  readonly images: readonly HyGalleryImage[];
}

@Component({
  selector: 'hy-lightbox-view',
  imports: [HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown)': 'onKey($event)' },
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.css',
})
export class HyLightboxView {
  protected readonly data = inject(HY_DIALOG_DATA) as GalleryData;
  protected readonly ref = inject(HyDialogRef);
  readonly index = signal(
    Math.max(0, Math.min(this.data.images.length - 1, Math.trunc(this.data.index ?? 0) || 0)),
  );
  protected readonly image = computed(() => this.data.images[this.index()]);
  readonly scale = signal(1);
  readonly rotation = signal(0);
  readonly playing = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  private timer?: ReturnType<typeof setInterval>;
  constructor() {
    this.data.attach?.(this);
    this.destroyRef.onDestroy(() => this.pause());
  }
  get destroyed(): boolean {
    return this.destroyRef.destroyed;
  }
  zoomIn(): void {
    this.scale.update((value) => Math.min(4, value + 0.25));
  }
  zoomOut(): void {
    this.scale.update((value) => Math.max(0.25, value - 0.25));
  }
  rotate(): void {
    this.rotation.update((value) => (value + 90) % 360);
  }
  goTo(index: number): void {
    const next = Math.max(0, Math.min(this.data.images.length - 1, Math.trunc(index) || 0));
    if (next === this.index()) return;
    this.index.set(next);
    this.scale.set(1);
    this.rotation.set(0);
    this.data.indexChange?.(next);
  }
  play(): void {
    if (this.destroyRef.destroyed || this.playing() || this.data.images.length < 2) return;
    this.playing.set(true);
    const interval = this.data.slideshowInterval ?? 3000;
    this.timer = setInterval(
      () => {
        if (this.index() >= this.data.images.length - 1) this.pause();
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
    if ((event.target as HTMLElement).matches('input, textarea, select')) return;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class HyGallery {
  private readonly lightbox = inject(HyLightbox);
  readonly images = input.required<readonly HyGalleryImage[]>();
  readonly label = input('Image gallery');
  readonly openLabel = input('Open image');
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
      untracked(() => {
        if (!visible) {
          active?.close();
          return;
        }
        if (active) {
          if (this.closing !== active) active.goTo(index);
          return;
        }
        const options = this.options();
        const ref = this.lightbox.open(this.images(), {
          ...options,
          label: this.label(),
          index,
          indexChange: (next) => {
            this.index.set(next);
            options.indexChange?.(next);
          },
        });
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
