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
  template: `
    <header class="page-head">
      <p class="eyebrow">{{ eyebrow() }}</p>
      <h1 tabindex="-1">{{ heading() }}</h1>
      <p class="hy-lead">{{ lead() }}</p>
    </header>
    <ng-content />
  `,
  styles: `
    :host {
      display: block;
      max-inline-size: 52rem;
    }
    .page-head {
      margin-block-end: var(--hy-space-8);
    }
    .eyebrow {
      margin: 0 0 var(--hy-space-2);
      color: var(--hy-accent);
      font-size: var(--hy-step--1);
      font-weight: 600;
    }
    h1 {
      margin: 0 0 var(--hy-space-3);
      font-size: var(--hy-step-5);
      letter-spacing: -0.025em;
      outline: none;
    }
  `,
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
