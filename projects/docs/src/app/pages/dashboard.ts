import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HY_SIDEBAR } from '@hyalo/angular/sidebar';
import { HyBreadcrumb } from '@hyalo/angular/breadcrumb';
import { HY_BENTO } from '@hyalo/angular/bento';
import { HyStat } from '@hyalo/angular/stat';
import { HySparkline } from '@hyalo/angular/sparkline';
import { HyChart } from '@hyalo/angular/chart';
import { HyTable, type HyTableColumn } from '@hyalo/angular/table';
import { HyPagination } from '@hyalo/angular/pagination';
import { HyChip } from '@hyalo/angular/badge';
import { HyButton } from '@hyalo/angular/button';
import { HyAlert } from '@hyalo/angular/alert';
import { HyCommand } from '@hyalo/angular/command';
import { HY_MENU } from '@hyalo/angular/menu';
import { HyProgress } from '@hyalo/angular/progress';
import { HyEmptyState } from '@hyalo/angular/empty-state';
import { HyKbd } from '@hyalo/angular/kbd';
import { DocsPage } from '../shared/page';
@Component({
  selector: 'docs-dashboard',
  imports: [
    DocsPage,
    HY_SIDEBAR,
    HyBreadcrumb,
    HY_BENTO,
    HyStat,
    HySparkline,
    HyChart,
    HyTable,
    HyPagination,
    HyChip,
    HyButton,
    HyAlert,
    HY_MENU,
    HyProgress,
    HyEmptyState,
    HyKbd,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export default class DashboardPage {
  protected readonly collapsed = signal(false);
  protected readonly page = signal(1);
  protected readonly selection = signal<readonly (string | number)[]>([]);
  protected readonly includeComplete = signal(true);
  protected readonly includeActive = signal(true);
  protected readonly notice = signal('');
  private readonly command = inject(HyCommand);
  private readonly router = inject(Router);
  protected readonly trail = [{ label: 'Workspace', href: '/' }, { label: 'Overview' }];
  protected readonly projects = [
    { id: '1', name: 'Website refresh', owner: 'Mina Rahimi', status: 'Active', budget: 12400 },
    { id: '2', name: 'Design system', owner: 'Arman Nouri', status: 'Active', budget: 8600 },
    { id: '3', name: 'Mobile launch', owner: 'Sara Ahmadi', status: 'Complete', budget: 19200 },
    { id: '4', name: 'Brand exploration', owner: 'Mina Rahimi', status: 'Complete', budget: 5600 },
    { id: '5', name: 'Customer portal', owner: 'Ali Moradi', status: 'Active', budget: 23400 },
    { id: '6', name: 'Research sprint', owner: 'Sara Ahmadi', status: 'Active', budget: 7800 },
  ];
  protected readonly columns: readonly HyTableColumn<{
    id: string;
    name: string;
    owner: string;
    status: string;
    budget: number;
  }>[] = [
    { id: 'name', header: 'Project', cell: (row) => row.name, sortable: true },
    { id: 'owner', header: 'Owner', cell: (row) => row.owner, sortable: true },
    { id: 'status', header: 'Status', cell: (row) => row.status, sortable: true },
    { id: 'budget', header: 'Budget ($)', cell: (row) => row.budget, sortable: true, align: 'end' },
  ];
  protected readonly filtered = computed(() =>
    this.projects.filter((row) =>
      row.status === 'Active' ? this.includeActive() : this.includeComplete(),
    ),
  );
  protected readonly paged = computed(() =>
    this.filtered().slice((this.page() - 1) * 3, this.page() * 3),
  );
  protected readonly key = (row: { id: string }): string => row.id;
  protected readonly rowLabel = (row: { name: string }): string => 'Select ' + row.name;
  protected readonly chart = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { label: 'Revenue ($k)', values: [18, 22, 20, 27, 29, 32] },
      { label: 'Expenses ($k)', values: [12, 13, 14, 14, 16, 17] },
    ],
  };
  protected readonly trend = [12, 18, 16, 23, 21, 28, 26, 32];
  protected filter(active: boolean, value: boolean): void {
    (active ? this.includeActive : this.includeComplete).set(value);
    this.page.set(1);
  }
  protected search(): void {
    this.command
      .open({
        label: 'Search workspace',
        items: [
          {
            id: 'projects',
            label: 'Projects',
            description: 'View current work',
            value: '/components/table',
          },
          {
            id: 'team',
            label: 'Team members',
            description: 'People in your workspace',
            value: '/components/list',
          },
          { id: 'settings', label: 'Workspace settings', value: '/theming' },
          { id: 'report', label: 'Revenue report', value: '/components/chart' },
        ],
      })
      .closed.subscribe((item) => {
        if (item) void this.router.navigateByUrl(item.value);
      });
  }
  protected export(): void {
    this.notice.set('Report prepared for ' + this.filtered().length + ' projects.');
  }
}
