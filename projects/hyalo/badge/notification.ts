import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

/** Establishes the positioning context for an attached notification badge. */
@Directive({ selector: '[hyBadgeHost]', host: { '[style.position]': '"relative"' } })
export class HyBadgeHost {}

@Component({
  selector: 'hy-notification-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[hidden]': '!shown()',
    '[attr.aria-label]': 'label() || text()',
    '[attr.data-position]': 'position()',
    '[attr.data-dot]': 'dot() || null',
    '[style.inset-block-start]': 'position().startsWith("top") ? "0" : null',
    '[style.inset-block-end]': 'position().startsWith("bottom") ? "0" : null',
    '[style.inset-inline-start]': 'position().endsWith("start") ? "0" : null',
    '[style.inset-inline-end]': 'position().endsWith("end") ? "0" : null',
    '[style.translate]': 'translation()',
    '[attr.dir]': 'direction()',
  },
  template: '<span aria-hidden="true">{{ dot() ? "" : text() }}</span>',
  styleUrl: './notification.css',
})
export class HyNotificationBadge {
  readonly count = input<number | null>(null);
  readonly max = input(99);
  readonly dot = input(false, { transform: booleanAttribute });
  readonly showZero = input(false, { transform: booleanAttribute });
  readonly overlap = input(true, { transform: booleanAttribute });
  readonly position = input<'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'>('top-end');
  readonly label = input('');
  readonly direction = input<'ltr' | 'rtl'>('ltr');
  protected readonly translation = computed(() => {
    if (!this.overlap()) return null;
    const start = this.position().endsWith('start');
    const negativeX = this.direction() === 'rtl' ? !start : start;
    return `${negativeX ? '-30%' : '30%'} ${this.position().startsWith('top') ? '-30%' : '30%'}`;
  });
  private readonly safeCount = computed(() => {
    const count = this.count() ?? 0;
    return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  });
  readonly text = computed(() => {
    const count = this.safeCount();
    const max = Number.isFinite(this.max()) ? Math.max(0, Math.floor(this.max())) : 99;
    return count > max ? `${max}+` : String(count);
  });
  protected readonly shown = computed(() => this.dot() || this.showZero() || this.safeCount() > 0);
}
