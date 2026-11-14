import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  computed,
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
}
interface GalleryData extends HyLightboxOptions {
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
  protected readonly index = signal(
    Math.max(0, Math.min(this.data.images.length - 1, Math.trunc(this.data.index ?? 0) || 0)),
  );
  protected readonly image = computed(() => this.data.images[this.index()]);
  protected move(delta: number): void {
    this.index.update((i) => Math.max(0, Math.min(this.data.images.length - 1, i + delta)));
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
  open(images: readonly HyGalleryImage[], options: HyLightboxOptions = {}): HyDialogRef | null {
    if (!images.length) return null;
    return this.dialog.open(HyLightboxView, {
      size: 'full',
      label: options.label ?? 'Image gallery',
      data: { ...options, images },
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
  open(index: number): void {
    this.lightbox.open(this.images(), { ...this.options(), label: this.label(), index });
  }
}
