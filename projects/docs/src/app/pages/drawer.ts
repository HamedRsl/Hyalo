import { ChangeDetectionStrategy, Component, TemplateRef, inject, viewChild } from '@angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HyCheckbox } from '@hyalo/angular/choice';
import { HY_DIALOG_PARTS, HyDrawer, type HyDrawerSide } from '@hyalo/angular/dialog';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-drawer-page',
  imports: [DocsPage, DocsTokens, DocsExample, DocsApiTable, HyButton, HyCheckbox, HY_DIALOG_PARTS],
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
