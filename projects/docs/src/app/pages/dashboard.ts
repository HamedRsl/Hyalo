import {
  HyFilterBar,
  type HyFilterClause,
  type HyFilterField,
  type HyDateRangeValue,
} from '@hyalo/angular/filter';
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
import { HyButton } from '@hyalo/angular/button';
import { HyAlert } from '@hyalo/angular/alert';
import { HyCommand } from '@hyalo/angular/command';
import { HY_MENU } from '@hyalo/angular/menu';
import { HyProgress } from '@hyalo/angular/progress';
import { HyEmptyState } from '@hyalo/angular/empty-state';
import { DocsPage } from '../shared/page';
type DashboardFilter = HyFilterClause<{
  status:
    | { readonly operator: 'eq'; readonly value: 'Active' | 'Complete' }
    | { readonly operator: 'in'; readonly value: readonly ('Active' | 'Complete')[] };
  query: { readonly operator: 'contains'; readonly value: string };
  createdAt: { readonly operator: 'between'; readonly value: HyDateRangeValue };
}>;
@Component({
  selector: 'docs-dashboard',
  imports: [
    HyFilterBar,
    DocsPage,
    HY_SIDEBAR,
    HyBreadcrumb,
    HY_BENTO,
    HyStat,
    HySparkline,
    HyChart,
    HyTable,
    HyPagination,
    HyButton,
    HyAlert,
    HY_MENU,
    HyProgress,
    HyEmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export default class DashboardPage {
  protected readonly collapsed = signal(false);
  protected readonly selectedView = signal('Overview');
  protected selectView(event: MouseEvent, view: string): void {
    event.preventDefault();
    this.selectedView.set(view);
  }
  protected followTrail(event: MouseEvent): void {
    if (!(event.target as Element).closest('a')) return;
    event.preventDefault();
    this.selectedView.set('Overview');
  }
  protected readonly page = signal(1);
  protected readonly selection = signal<readonly (string | number)[]>([]);
  protected readonly clauses = signal<readonly DashboardFilter[]>([]);
  protected readonly filterFields: readonly HyFilterField<DashboardFilter>[] = [
    {
      field: 'status',
      label: 'Status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Complete', label: 'Complete' },
      ],
      create: (id, value) =>
        value === 'Active' || value === 'Complete'
          ? { id, field: 'status', operator: 'eq', value }
          : null,
    },
    {
      field: 'query',
      label: 'Find project',
      create: (id, value) => ({ id, field: 'query', operator: 'contains', value }),
    },
    {
      field: 'createdAt',
      label: 'Updated within',
      options: ['24H', '7D', '30D', '1Y'].map((value) => ({ value, label: value })),
      create: (id, value) =>
        ['24H', '7D', '30D', '1Y'].includes(value)
          ? {
              id,
              field: 'createdAt',
              operator: 'between',
              value: {
                kind: 'preset',
                preset: value as '24H' | '7D' | '30D' | '1Y',
                timeZone: 'UTC',
              },
            }
          : null,
      format: (clause) =>
        clause.field === 'createdAt' && clause.value.kind === 'preset' ? clause.value.preset : '',
    },
  ];
  protected readonly notice = signal('');
  private readonly command = inject(HyCommand);
  private readonly router = inject(Router);
  protected readonly trail = computed(() => [
    { label: 'Workspace', href: '#dashboard-workspace' },
    { label: this.selectedView() },
  ]);
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
    this.projects.filter((row, index) =>
      this.clauses().every((clause) => {
        if (clause.field === 'status')
          return clause.operator === 'in'
            ? clause.value.some((value) => value === row.status)
            : row.status === clause.value;
        if (clause.field === 'query')
          return row.name.toLocaleLowerCase().includes(clause.value.toLocaleLowerCase());
        const dayAge = [0, 2, 10, 20, 45, 200][index] ?? 0;
        if (clause.value.kind !== 'preset') return false;
        return dayAge < { '24H': 1, '7D': 7, '30D': 30, '1Y': 365 }[clause.value.preset];
      }),
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
  protected updateFilters(clauses: readonly DashboardFilter[]): void {
    this.clauses.set(clauses);
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
