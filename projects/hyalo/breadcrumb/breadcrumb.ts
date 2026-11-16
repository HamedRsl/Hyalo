import { ChangeDetectionStrategy, Component, input } from '@angular/core';
export interface HyBreadcrumbItem {
  readonly label: string;
  readonly href?: string;
}
@Component({
  selector: 'hy-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
})
export class HyBreadcrumb {
  readonly items = input.required<readonly HyBreadcrumbItem[]>();
  readonly label = input('Breadcrumb');
}
