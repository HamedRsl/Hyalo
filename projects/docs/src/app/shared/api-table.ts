import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** One row of an API table. */
export interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default?: string;
  readonly description: string;
}

/** A compact table of inputs, outputs or methods. */
@Component({
  selector: 'docs-api-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track row.name) {
            <tr>
              <td>
                <code>{{ row.name }}</code>
              </td>
              <td>
                <code>{{ row.type }}</code>
              </td>
              <td>
                @if (row.default) {
                  <code>{{ row.default }}</code>
                }
              </td>
              <td>{{ row.description }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .wrap {
      overflow-x: auto;
      margin-block: var(--hy-space-4) var(--hy-space-8);
    }
    table {
      inline-size: 100%;
      border-collapse: collapse;
      font-size: var(--hy-step--1);
    }
    th,
    td {
      padding: var(--hy-space-2) var(--hy-space-3);
      border-block-end: 1px solid var(--hy-line);
      text-align: start;
      vertical-align: top;
    }
    th {
      color: var(--hy-ink-3);
      font-weight: 560;
    }
    code {
      font-family: var(--hy-font-mono);
      font-size: 0.8125rem;
      white-space: nowrap;
    }
  `,
})
export class DocsApiTable {
  readonly rows = input.required<readonly ApiRow[]>();
}
