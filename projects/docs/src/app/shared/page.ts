import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { Title } from '@angular/platform-browser';

let firstPage = true;

/**
 * Page frame: eyebrow, title and lead. Sets the document title, and after
 * client-side navigation moves focus to the heading so screen reader users
 * land on the new page.
 */
@Component({
  selector: 'docs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'docs-prose' },
  templateUrl: './page.html',
  styleUrl: './page.css',
})
export class DocsPage implements OnInit {
  private readonly title = inject(Title);

  readonly eyebrow = input('Components');
  readonly heading = input.required<string>();
  readonly lead = input('');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      if (!firstPage) host.querySelector('h1')?.focus({ preventScroll: true });
      firstPage = false;
    });
  }

  ngOnInit(): void {
    this.title.setTitle(`${this.heading()} | Hyalo`);
  }
}
