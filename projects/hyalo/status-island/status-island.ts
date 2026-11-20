import {
  ChangeDetectionStrategy,
  type TemplateRef,
  effect,
  Component,
  Injectable,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HyButton } from '@hyalo/angular/button';
import { HyPopover } from '@hyalo/angular/popover';
import { HyProgress } from '@hyalo/angular/progress';
import type { HyAction, HyTone } from '@hyalo/angular/core';

export interface HyIslandStatus {
  readonly id: string;
  readonly label: string;
  readonly detail?: string;
  readonly priority?: number;
  readonly tone?: HyTone;
  readonly progress?: number | null;
  readonly action?: HyAction;
  readonly dismissible?: boolean;
}
@Injectable({ providedIn: 'root' })
export class HyStatusQueue {
  private readonly state = signal<readonly HyIslandStatus[]>([]);
  readonly items = this.state.asReadonly();
  set(status: HyIslandStatus): void {
    this.state.update((items) =>
      items.some((item) => item.id === status.id)
        ? items.map((item) => (item.id === status.id ? status : item))
        : [...items, status],
    );
  }
  get(id: string): HyIslandStatus | undefined {
    return this.items().find((item) => item.id === id);
  }
  has(id: string): boolean {
    return this.get(id) !== undefined;
  }
  update(id: string, patch: Partial<Omit<HyIslandStatus, 'id'>>): boolean {
    const current = this.get(id);
    if (!current) return false;
    this.set({ ...current, ...patch, id });
    return true;
  }
  remove(id: string): void {
    this.state.update((items) => items.filter((item) => item.id !== id));
  }
  clear(): void {
    this.state.set([]);
  }
}
@Component({
  selector: 'hy-status-island',
  imports: [HyButton, HyPopover, HyProgress, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-island.html',
  styleUrl: './status-island.css',
})
export class HyStatusIsland {
  private readonly queue = inject(HyStatusQueue);
  readonly items = input<readonly HyIslandStatus[]>();
  readonly disabled = input(false);
  readonly detailTemplate = input<TemplateRef<{ $implicit: HyIslandStatus }>>();
  constructor() {
    effect(() => {
      if (!this.current() || this.disabled()) this.expanded.set(false);
    });
  }
  readonly expanded = model(false);
  readonly label = input('Activity');
  readonly emptyLabel = input('No active tasks');
  readonly closeLabel = input('Close details');
  readonly dismissLabel = input('Dismiss');
  readonly live = input<'off' | 'polite' | 'assertive'>('polite');
  readonly dismissed = output<string>();
  readonly action = output<{ readonly status: HyIslandStatus; readonly action: HyAction }>();
  protected readonly current = computed(() => {
    const items = this.items() ?? this.queue.items();
    const priority = (item: HyIslandStatus): number =>
      Number.isFinite(item.priority) ? (item.priority ?? 0) : 0;
    return items.reduce<HyIslandStatus | undefined>(
      (best, item) => (!best || priority(item) > priority(best) ? item : best),
      undefined,
    );
  });
  dismiss(): void {
    const item = this.current();
    if (this.disabled() || !item || item.dismissible === false) return;
    if (this.items() === undefined) this.queue.remove(item.id);
    this.dismissed.emit(item.id);
  }
  activate(): void {
    const status = this.current(),
      action = status?.action;
    if (!this.disabled() && status && action && !action.disabled)
      this.action.emit({ status, action });
  }
}
