import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
@Component({
  selector: 'hy-scroll-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-area.html',
  styleUrl: './scroll-area.css',
  host: {
    role: 'region',
    '[attr.tabindex]': 'scrollHost() ? null : 0',
    '[attr.data-delegated]': 'scrollHost() ? "" : null',
    '[attr.aria-label]': 'label()',
    '[style.max-block-size]': 'scrollHost() ? null : maxHeight()',
  },
})
export class HyScrollArea {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly scrolled = output<{ top: number; left: number }>();
  /** Optional viewport. Its styles, accessible name and keyboard focus belong to the caller. */
  readonly scrollHost = input<HTMLElement | null>(null);

  constructor() {
    effect((cleanup) => {
      const viewport = this.scrollHost() ?? this.host.nativeElement;
      const report = (): void =>
        this.scrolled.emit({ top: viewport.scrollTop, left: viewport.scrollLeft });
      viewport.addEventListener('scroll', report, { passive: true });
      cleanup(() => viewport.removeEventListener('scroll', report));
    });
  }

  scrollTo(options: ScrollToOptions): void {
    (this.scrollHost() ?? this.host.nativeElement).scrollTo(options);
  }
  readonly label = input.required<string>();
  readonly maxHeight = input('20rem');
}
