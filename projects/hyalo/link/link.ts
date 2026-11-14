import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[hyLink]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styleUrl: './link.css',
})
export class HyLink {}
