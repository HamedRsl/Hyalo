import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HyIcon } from '@hyalo/angular/icon';
import type { HyAction } from '@hyalo/angular/core';
import { HyBottomSheetHost, type HyBottomSheetConfig } from '@hyalo/angular/bottom-sheet';
import { DestroyRef, effect, inject, model, signal } from '@angular/core';

export interface HySheetAction extends HyAction {
  readonly role?: 'default' | 'destructive' | 'cancel';
  readonly data?: unknown;
  readonly handler?: () => boolean | void | Promise<boolean | void>;
}
@Component({
  selector: 'hy-action-sheet',
  imports: [HyBottomSheetHost, HyButton, HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './action-sheet.html',
  styleUrl: './action-sheet.css',
})
export class HyActionSheet {
  readonly open = model(false);
  readonly heading = input.required<string>();
  readonly description = input('');
  readonly actions = input.required<readonly HySheetAction[]>();
  readonly options = input<HyBottomSheetConfig>({
    breakpoints: [1],
    initialBreakpoint: 1,
    size: 'min(32rem, 85dvh)',
  });
  readonly cancelLabel = input('Cancel');
  readonly disabled = input(false);
  readonly closeOnSelect = input(true);
  readonly pending = signal<string | null>(null);
  readonly actionError = output<{ readonly action: HySheetAction; readonly error: unknown }>();
  private generation = 0;
  private destroyed = false;
  constructor() {
    effect(() => {
      if (!this.open()) {
        this.generation++;
        this.pending.set(null);
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.generation++;
    });
  }
  readonly selected = output<HySheetAction>();
  readonly dismissed = output<void>();
  protected readonly ordered = computed(() => [
    ...this.actions().filter((action) => action.role !== 'cancel'),
    ...this.actions().filter((action) => action.role === 'cancel'),
  ]);
  protected readonly hasCancel = computed(() => this.ordered().at(-1)?.role === 'cancel');
  async choose(action: HySheetAction): Promise<void> {
    if (this.disabled() || action.disabled || this.pending() || !this.open()) return;
    const generation = this.generation;
    this.pending.set(action.id);
    try {
      const result = action.handler ? await action.handler() : undefined;
      if (this.destroyed || generation !== this.generation || !this.open() || result === false)
        return;
      if (action.role !== 'cancel') this.selected.emit(action);
      if (this.closeOnSelect() || action.role === 'cancel') this.open.set(false);
    } catch (error: unknown) {
      if (!this.destroyed && generation === this.generation)
        this.actionError.emit({ action, error });
    } finally {
      if (!this.destroyed && generation === this.generation) this.pending.set(null);
    }
  }
}
