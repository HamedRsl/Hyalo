import { ChangeDetectionStrategy, Component, TemplateRef, inject, viewChild } from '@angular/core';
import { HY_DIALOG_PARTS, HyButton, HyCheckbox, HyDrawer, type HyDrawerSide } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-drawer-page',
  imports: [DocsPage, DocsExample, DocsApiTable, HyButton, HyCheckbox, HY_DIALOG_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page
      heading="Drawer"
      lead="A modal panel that slides in from an edge. Filters, carts, navigation on phones."
    >
      <docs-example [code]="code">
        <button hyButton variant="glass" (click)="open('start')">From start</button>
        <button hyButton variant="glass" (click)="open('end')">From end</button>
        <button hyButton variant="glass" (click)="open('bottom')">Bottom sheet</button>
      </docs-example>
      <p>
        <code>start</code> and <code>end</code> follow the text direction. Switch the page to RTL in
        the settings and the drawers swap sides.
      </p>

      <ng-template #filters>
        <h2 hyDialogTitle>Filters</h2>
        <div hyDialogContent>
          <div class="docs-stack">
            <hy-checkbox>In stock</hy-checkbox>
            <hy-checkbox>On sale</hy-checkbox>
            <hy-checkbox>Ships this week</hy-checkbox>
          </div>
        </div>
        <div hyDialogActions>
          <button hyButton variant="ghost" tone="neutral" hyDialogClose>Close</button>
          <button hyButton [hyDialogClose]="true">Show 24 results</button>
        </div>
      </ng-template>

      <h2>Accessibility</h2>
      <ul>
        <li>Same behaviour as a dialog: focus trap, Escape, backdrop click and focus restore.</li>
        <li>Give it a title with <code>hyDialogTitle</code> or a <code>label</code>.</li>
        <li>With reduced motion it appears in place, without the slide.</li>
      </ul>

      <h2>API</h2>
      <p>
        <code>HyDrawer.open(content, config)</code> returns a <code>HyDialogRef</code>. It takes
        every dialog option except <code>size</code>, plus these.
      </p>
      <docs-api-table [rows]="rows" />
    </docs-page>
  `,
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
