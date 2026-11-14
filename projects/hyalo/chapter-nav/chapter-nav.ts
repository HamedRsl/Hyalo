import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { PlatformLocation } from '@angular/common';
export interface HyChapter {
  readonly id: string;
  readonly label: string;
}
/** Native fragment links remain usable before hydration and without observers. */
@Component({
  selector: 'hy-chapter-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chapter-nav.html',
  styleUrl: './chapter-nav.css',
})
export class HyChapterNav {
  private readonly document = inject(DOCUMENT);
  private readonly location = inject(PlatformLocation);
  readonly chapters = input.required<readonly HyChapter[]>();
  readonly label = input('On this page');
  // A bare #fragment resolves against <base href>, which can leave the current route.
  protected readonly links = computed(() =>
    this.chapters().map((chapter) => ({
      ...chapter,
      href: this.location.pathname + this.location.search + '#' + encodeURIComponent(chapter.id),
    })),
  );
  protected readonly current = signal('');
  protected readonly progress = computed(() => {
    const index = this.chapters().findIndex((chapter) => chapter.id === this.current());
    return index < 0 ? 0 : ((index + 1) / Math.max(1, this.chapters().length)) * 100;
  });
  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const update = (): void => {
        const chapters = this.chapters();
        let active = '';
        for (const chapter of chapters) {
          const element = this.document.getElementById(chapter.id);
          if (element && !active) active = chapter.id;
          if (element && element.getBoundingClientRect().top <= 120) active = chapter.id;
        }
        this.current.set(active);
      };
      const window = this.document.defaultView;
      let frame = 0;
      const schedule = (): void => {
        if (frame) return;
        frame =
          window?.requestAnimationFrame(() => {
            frame = 0;
            update();
          }) ?? 0;
      };
      const fromHash = (): void => {
        let id = '';
        try {
          id = decodeURIComponent(this.location.hash.slice(1));
        } catch {
          return;
        }
        if (
          this.chapters().some((chapter) => chapter.id === id) &&
          this.document.getElementById(id)
        )
          this.current.set(id);
      };
      window?.addEventListener('scroll', schedule, { passive: true });
      window?.addEventListener('resize', schedule);
      window?.addEventListener('hashchange', fromHash);
      update();
      fromHash();
      destroy.onDestroy(() => {
        window?.removeEventListener('scroll', schedule);
        window?.removeEventListener('resize', schedule);
        window?.removeEventListener('hashchange', fromHash);
        window?.cancelAnimationFrame(frame);
      });
    });
  }
  protected select(event: MouseEvent, id: string): void {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (this.document.getElementById(id)) this.current.set(id);
  }
}
