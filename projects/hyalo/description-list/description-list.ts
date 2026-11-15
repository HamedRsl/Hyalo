import { ChangeDetectionStrategy, Component, input } from '@angular/core';
export interface HyDescription {
  readonly term: string;
  readonly detail: string;
}
@Component({
  selector: 'hy-description-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './description-list.html',
  styleUrl: './description-list.css',
})
export class HyDescriptionList {
  readonly items = input.required<readonly HyDescription[]>();
}
