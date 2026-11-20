import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HyEmptyState } from '@hyalo/angular/empty-state';
import { HySpinner } from '@hyalo/angular/progress';

export type HyStateLiveness = 'off' | 'polite' | 'assertive';

@Component({
  selector: 'hy-error-state',
  imports: [HyEmptyState, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-state.html',
  styleUrl: './state.css',
  host: {
    '[attr.aria-live]': 'live()',
    'aria-atomic': 'true',
    '[attr.data-compact]': 'compact()',
  },
})
export class HyErrorState {
  readonly heading = input.required<string>();
  readonly description = input('');
  readonly headingLevel = input<2 | 3 | 4 | 5 | 6>(2);
  readonly retryLabel = input('');
  readonly retrying = input(false, { transform: booleanAttribute });
  readonly compact = input(false, { transform: booleanAttribute });
  readonly live = input<HyStateLiveness>('polite');
  readonly retry = output<void>();
}

@Component({
  selector: 'hy-loading-state',
  imports: [HySpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-state.html',
  styleUrl: './state.css',
  host: { '[attr.data-compact]': 'compact()' },
})
export class HyLoadingState {
  readonly label = input.required<string>();
  readonly description = input('');
  readonly compact = input(false, { transform: booleanAttribute });
  readonly live = input<HyStateLiveness>('polite');
}
@Component({
  selector: 'hy-result-state',
  imports: [HyEmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './result-state.html',
  styleUrl: './state.css',
  host: { '[attr.data-variant]': 'variant()', '[attr.aria-live]': 'live()', 'aria-atomic': 'true' },
})
export class HyResultState {
  readonly heading = input.required<string>();
  readonly description = input('');
  readonly headingLevel = input<2 | 3 | 4 | 5 | 6>(2);
  readonly variant = input<'info' | 'success' | 'warning' | 'error'>('info');
  readonly live = input<HyStateLiveness>('off');
}
export const HY_STATE = [HyErrorState, HyLoadingState, HyResultState] as const;
