import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  numberAttribute,
  booleanAttribute,
  signal,
} from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { HyMotion } from '@hyalo/angular';

export interface HyChapter {
  readonly id: string;
  readonly label: string;
}
interface ChapterTarget {
  readonly id: string;
  readonly element: HTMLElement;
}
interface ChapterScroll {
  readonly id: string;
  destination: number;
  settled: boolean;
}

/** Route-safe section navigation for a page or an explicitly supplied reading pane. */
@Component({
  selector: 'hy-chapter-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chapter-nav.html',
  styleUrl: './chapter-nav.css',
  host: { '[attr.data-sticky]': 'sticky()', '[style.--hy-chapter-sticky-top]': 'stickyTop()' },
})
export class HyChapterNav {
  private readonly document = inject(DOCUMENT);
  private readonly location = inject(PlatformLocation);
  private readonly motion = inject(HyMotion);
  private readonly ready = signal(false);
  private readonly current = signal('');
  private navigation: ChapterScroll | null = null;
  private frame = 0;
  private dispose: (() => void) | undefined;
  readonly chapters = input.required<readonly HyChapter[]>();
  readonly label = input('On this page');
  readonly sticky = input(false, { transform: booleanAttribute });
  readonly stickyTop = input('6rem');
  readonly scrollBehavior = input<'smooth' | 'instant'>('smooth');
  /** Null scrolls the page; pass an overflow container to scroll a reading pane. */
  readonly scrollRoot = input<HTMLElement | null>(null);
  /** Clearance below a sticky header, in pixels. Target scroll-margin is respected too. */
  readonly offset = input(96, { transform: numberAttribute });
  readonly active = this.current.asReadonly();
  protected readonly links = computed(() =>
    this.chapters().map((chapter) => ({
      ...chapter,
      href: this.location.pathname + this.location.search + '#' + encodeURIComponent(chapter.id),
    })),
  );
  protected readonly progress = computed(() => {
    const index = this.chapters().findIndex((chapter) => chapter.id === this.current());
    return index < 0 ? 0 : ((index + 1) / Math.max(1, this.chapters().length)) * 100;
  });

  constructor() {
    afterNextRender(() => this.ready.set(true));
    afterRenderEffect(() => {
      this.chapters();
      this.scrollRoot();
      this.offset();
      if (!this.ready()) return;
      this.dispose?.();
      this.navigation = null;
      const window = this.document.defaultView;
      if (!window) return;
      const root: EventTarget = this.scrollRoot() ?? window;
      const schedule = (): void => {
        if (this.frame) return;
        this.frame = window.requestAnimationFrame(() => {
          this.frame = 0;
          this.track();
        });
      };
      const interrupt = (event: Event): void => {
        if (
          event instanceof KeyboardEvent &&
          !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)
        )
          return;
        this.navigation = null;
        schedule();
      };
      const settled = (): void => {
        if (this.navigation && Math.abs(this.scrollPosition() - this.navigation.destination) <= 1) {
          this.navigation.settled = true;
        }
      };
      const history = (): void => {
        let id: string;
        try {
          id = decodeURIComponent(this.location.hash.slice(1));
        } catch {
          return;
        }
        if (id) this.navigate(id, false, false);
        else {
          this.navigation = null;
          this.track();
        }
      };
      root.addEventListener('scroll', schedule, { passive: true });
      root.addEventListener('scrollend', settled);
      root.addEventListener('wheel', interrupt, { passive: true });
      root.addEventListener('touchstart', interrupt, { passive: true });
      root.addEventListener('keydown', interrupt);
      window.addEventListener('resize', interrupt);
      window.addEventListener('popstate', history);
      window.addEventListener('hashchange', history);
      this.track();
      history();
      this.dispose = () => {
        root.removeEventListener('scroll', schedule);
        root.removeEventListener('scrollend', settled);
        root.removeEventListener('wheel', interrupt);
        root.removeEventListener('touchstart', interrupt);
        root.removeEventListener('keydown', interrupt);
        window.removeEventListener('resize', interrupt);
        window.removeEventListener('popstate', history);
        window.removeEventListener('hashchange', history);
        window.cancelAnimationFrame(this.frame);
        this.frame = 0;
      };
    });
    inject(DestroyRef).onDestroy(() => this.dispose?.());
  }

  /** Selects, focuses and scrolls to a chapter. Missing targets leave state unchanged. */
  goTo(id: string): boolean {
    return this.navigate(id, true, true);
  }

  protected onLinkClick(event: MouseEvent, id: string): void {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    this.goTo(id);
  }

  private targets(): ChapterTarget[] {
    const root = this.scrollRoot();
    return this.chapters().flatMap((chapter) => {
      const element = this.document.getElementById(chapter.id);
      return element && (!root || root.contains(element)) ? [{ id: chapter.id, element }] : [];
    });
  }
  private scrollPosition(): number {
    return this.scrollRoot()?.scrollTop ?? this.document.defaultView?.scrollY ?? 0;
  }
  private clearance(): number {
    return Number.isFinite(this.offset()) ? Math.max(0, this.offset()) : 96;
  }
  private navigate(id: string, writeHistory: boolean, focus: boolean): boolean {
    if (!this.ready()) return false;
    const window = this.document.defaultView;
    const target = this.targets().find((target) => target.id === id)?.element;
    if (!window || !target) return false;
    const root = this.scrollRoot();
    const origin = root ? root.getBoundingClientRect().top + root.clientTop : 0;
    const margin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
    const scrolling = this.document.scrollingElement ?? this.document.documentElement;
    const maximum = Math.max(
      0,
      root ? root.scrollHeight - root.clientHeight : scrolling.scrollHeight - window.innerHeight,
    );
    const destination = Math.min(
      maximum,
      Math.max(
        0,
        this.scrollPosition() +
          target.getBoundingClientRect().top -
          origin -
          Math.max(margin, this.clearance()),
      ),
    );
    const smooth = writeHistory && this.scrollBehavior() === 'smooth' && !this.motion.reduced();
    this.navigation = {
      id,
      destination,
      settled: !smooth || Math.abs(this.scrollPosition() - destination) < 1,
    };
    this.current.set(id);
    if (writeHistory && this.location.hash !== '#' + encodeURIComponent(id)) {
      this.location.pushState(
        this.location.getState(),
        '',
        this.location.pathname + this.location.search + '#' + encodeURIComponent(id),
      );
    }
    if (focus) {
      const tabindex = target.getAttribute('tabindex');
      if (tabindex === null) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
      target.focus({ preventScroll: true });
    }
    const options: ScrollToOptions = { top: destination, behavior: smooth ? 'smooth' : 'instant' };
    if (root) root.scrollTo(options);
    else window.scrollTo(options);
    return true;
  }
  private track(): void {
    const position = this.scrollPosition();
    if (this.navigation) {
      if (Math.abs(position - this.navigation.destination) <= 1) this.navigation.settled = true;
      if (!this.navigation.settled || Math.abs(position - this.navigation.destination) <= 1) return;
      this.navigation = null;
    }
    const targets = this.targets();
    const root = this.scrollRoot();
    const line =
      (root ? root.getBoundingClientRect().top + root.clientTop : 0) + this.clearance() + 1;
    let active = targets[0]?.id ?? '';
    for (const target of targets)
      if (target.element.getBoundingClientRect().top <= line) active = target.id;
    this.current.set(active);
  }
}
