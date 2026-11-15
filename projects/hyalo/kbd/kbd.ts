import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({
  // Native elements preserve link, list, key, and button semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'kbd[hyKbd]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kbd.html',
  styleUrl: './kbd.css',
})
export class HyKbd {}
