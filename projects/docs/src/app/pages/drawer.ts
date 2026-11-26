import { EXAMPLES } from './examples/drawer';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HyCheckbox } from '@hyalo/angular/choice';
import {
  HY_DIALOG_PARTS,
  HyDockedDrawer,
  HyDrawer,
  HyDrawerLayout,
  type HyDockedDrawerSide,
  type HyDrawerMode,
  type HyDrawerSide,
} from '@hyalo/angular/dialog';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-drawer-page',
  imports: [
    DocsPage, DocsTokens, DocsExample, DocsApiTable, HyButton, HyCheckbox, HY_DIALOG_PARTS,
    HyDockedDrawer, HyDrawerLayout,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './drawer.html',
  styleUrl: './drawer.css',
})
export default class DrawerPage {
  protected readonly examples = EXAMPLES;

  private readonly drawer = inject(HyDrawer);
  private readonly filters = viewChild.required<TemplateRef<unknown>>('filters');
  protected readonly drawerNotice = signal('');
  protected readonly dockedOpen = signal(false);
  protected readonly dockedMode = signal<HyDrawerMode>('side');
  protected readonly dockedSide = signal<HyDockedDrawerSide>('start');
  protected readonly modes = ['side', 'push', 'over'] as const;
  protected readonly sides = ['start', 'end'] as const;

  protected open(side: HyDrawerSide, guardGesture = false): void {
    this.drawerNotice.set('');
    const ref = this.drawer.open(this.filters(), {
      side,
      closeGuard: ({ reason }) => !guardGesture || reason !== 'gesture',
    });
    ref.closeVetoed.subscribe(() => this.drawerNotice.set('Filters stay open after the swipe.'));
  }

  protected readonly code = `<ng-template #filters>
  <h2 hyDialogTitle>Filters</h2>
  <div hyDialogContent>...</div>
  <div hyDialogActions>
    <button hyButton hyDialogClose>Close</button>
  </div>
</ng-template>

this.drawer.open(this.filters(), { side: 'end' });`;
  protected readonly layoutRows: ApiRow[] = [
    { name: 'opened', type: 'model<boolean>', default: 'false', description: 'Two-way visibility.' },
    {
      name: 'mode', type: "'side' | 'push' | 'over'", default: "'over'",
      description: 'Resize, shift, or cover the content within the nearest layout.',
    },
    { name: 'side', type: "'start' | 'end'", default: "'start'", description: 'Logical edge.' },
    { name: 'size', type: 'string', default: "'18rem'", description: 'CSS inline size.' },
    { name: 'hasBackdrop', type: 'boolean', description: 'Defaults on for push and over.' },
    { name: 'dismissible', type: 'boolean', default: 'true', description: 'Escape and backdrop dismissal.' },
    { name: 'open(), close(), toggle()', type: 'void', description: 'Update the opened model.' },
  ];
  protected readonly rows: ApiRow[] = [
    {
      name: 'side',
      type: "'start' | 'end' | 'bottom' | 'top'",
      default: "'end'",
      description: 'Edge it slides from.',
    },
    {
      name: 'size',
      type: 'string',
      default: "'min(24rem, 100vw - 2.5rem)'",
      description: 'Width for a side drawer or height for a top or bottom sheet.',
    },
  ];
}
