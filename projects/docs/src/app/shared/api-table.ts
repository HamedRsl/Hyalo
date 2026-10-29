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
  templateUrl: './api-table.html',
  styleUrl: './api-table.css',
})
export class DocsApiTable {
  readonly rows = input.required<readonly ApiRow[]>();
}
