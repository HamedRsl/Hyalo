import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/** A live demo with its source underneath. */
@Component({
  selector: 'docs-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="example">
      <div class="example__stage hy-mesh" [class.example__stage--column]="column()">
        <ng-content />
      </div>
      @if (code()) {
        <details class="example__code">
          <summary>Code</summary>
          <pre><code>{{ code() }}</code></pre>
        </details>
      }
    </figure>
  `,
  styles: `
    .example {
      margin: var(--hy-space-6) 0;
      border: 1px solid var(--hy-line);
      border-radius: var(--hy-radius-l);
      overflow: hidden;
      background: var(--hy-surface-1);
    }
    .example__stage {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--hy-space-4);
      padding: var(--hy-space-8) var(--hy-space-6);
      min-block-size: 8rem;
    }
    .example__stage--column {
      flex-direction: column;
      align-items: stretch;
    }
    .example__code {
      border-block-start: 1px solid var(--hy-line);
    }
    summary {
      padding: var(--hy-space-3) var(--hy-space-5);
      color: var(--hy-ink-2);
      font-size: var(--hy-step--1);
      font-weight: 560;
      cursor: pointer;
    }
    pre {
      margin: 0;
      padding: var(--hy-space-4) var(--hy-space-5) var(--hy-space-5);
      overflow-x: auto;
      font-family: var(--hy-font-mono);
      font-size: 0.8125rem;
      line-height: 1.6;
      direction: ltr;
      text-align: left; /* physical-ok: code always reads left to right */
    }
  `,
})
export class DocsExample {
  readonly code = input('');
  readonly column = input(false, { transform: booleanAttribute });
}
