import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/** A live demo with its source underneath. */
@Component({
  selector: 'docs-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './example.html',
  styleUrl: './example.css',
})
export class DocsExample {
  readonly code = input('');
  readonly column = input(false, { transform: booleanAttribute });
}
