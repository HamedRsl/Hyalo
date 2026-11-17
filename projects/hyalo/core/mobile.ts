import type { HyTone } from './lib/core/axes';

export interface HyAction {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly icon?: string;
  readonly tone?: HyTone;
  readonly disabled?: boolean;
}
export interface HyNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon?: string;
  readonly badge?: string | number;
  readonly badgeLabel?: string;
  readonly ariaLabel?: string;
  readonly target?: string;
  readonly rel?: string;
  readonly hidden?: boolean;
  readonly disabled?: boolean;
}
