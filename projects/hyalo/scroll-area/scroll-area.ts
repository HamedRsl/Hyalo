import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output } from '@angular/core';
@Component({
  selector: 'hy-scroll-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-area.html',
  styleUrl: './scroll-area.css',
  host: {
    role: 'region',
    '(scroll)': 'reportScroll()',
    tabindex: '0',
    '[attr.aria-label]': 'label()',
    '[style.max-block-size]': 'maxHeight()',
  },
})
export class HyScrollArea {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly scrolled = output<{ top: number; left: number }>();
  scrollTo(options: ScrollToOptions): void { this.host.nativeElement.scrollTo(options); }
  protected reportScroll(): void {
    const { scrollTop: top, scrollLeft: left } = this.host.nativeElement;
    this.scrolled.emit({ top, left });
  }
  readonly label = input.required<string>();
  readonly maxHeight = input('20rem');
}
