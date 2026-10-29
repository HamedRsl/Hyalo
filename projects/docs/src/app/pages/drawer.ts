import { ChangeDetectionStrategy, Component, TemplateRef, inject, viewChild } from '@angular/core';
import { HY_DIALOG_PARTS, HyButton, HyCheckbox, HyDrawer, type HyDrawerSide } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-drawer-page',
  imports: [DocsPage, DocsExample, DocsApiTable, HyButton, HyCheckbox, HY_DIALOG_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './drawer.html',
})
export default class DrawerPage {
  private readonly drawer = inject(HyDrawer);
  private readonly filters = viewChild.required<TemplateRef<unknown>>('filters');

  protected open(side: HyDrawerSide): void {
    this.drawer.open(this.filters(), { side });
  }

  protected readonly code = `<ng-template #filters>
  <h2 hyDialogTitle>Filters</h2>
  <div hyDialogContent>...</div>
  <div hyDialogActions>
    <button hyButton hyDialogClose>Close</button>
  </div>
</ng-template>

this.drawer.open(this.filters(), { side: 'end' });`;
  protected readonly rows: ApiRow[] = [
    {
      name: 'side',
      type: "'start' | 'end' | 'bottom'",
      default: "'end'",
      description: 'Edge it slides from.',
    },
    {
      name: 'size',
      type: 'string',
      default: "'min(24rem, 100vw - 2.5rem)'",
      description: 'Width, or height for the bottom sheet.',
    },
  ];
}
