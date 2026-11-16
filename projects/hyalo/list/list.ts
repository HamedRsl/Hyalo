import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  selector: 'hy-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class HyList {
  readonly label = input.required<string>();
}
@Component({
  // Native elements preserve link, list, key, and button semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[hyListItem]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
    '<div class="body"><strong>{{heading()}}</strong>@if(description()){<span>{{description()}}</span>}</div><ng-content />',
  styles:
    ':host{display:flex;align-items:center;gap:1rem;padding:1rem;border-block-end:1px solid var(--hy-line);color:var(--hy-ink);min-inline-size:0}.body{flex:1;min-inline-size:0}strong,span{display:block;overflow-wrap:anywhere}span{color:var(--hy-ink-2);font-size:.875rem;margin-block-start:.25rem}',
})
export class HyListItem {
  readonly heading = input.required<string>();
  readonly description = input('');
}
export const HY_LIST = [HyList, HyListItem] as const;
