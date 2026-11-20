import { ChangeDetectionStrategy, Component, Directive, booleanAttribute, computed, input } from '@angular/core';

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
    '[style.translate]': 'overlap() ? "30% -30%" : null',
  },
  template: '<span aria-hidden="true">{{ dot() ? "" : text() }}</span>',
  styles: `:host{position:absolute;display:grid;place-items:center;min-inline-size:1.25em;min-block-size:1.25em;border-radius:999px;background:var(--hy-danger);color:var(--hy-danger-ink);font-size:.75rem;padding-inline:.25em}:host([hidden]){display:none}:host([data-dot]){min-inline-size:.5rem;min-block-size:.5rem;padding:0}`,
})
export class HyNotificationBadge {
  readonly count = input<number | null>(null);
  readonly max = input(99);
  readonly dot = input(false, { transform: booleanAttribute });
  readonly showZero = input(false, { transform: booleanAttribute });
  readonly overlap = input(true, { transform: booleanAttribute });
  readonly position = input<'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'>('top-end');
  readonly label = input('');
  readonly text = computed(() => {
    const count = Math.max(0, Math.floor(this.count() ?? 0));
    const max = Math.max(0, Math.floor(this.max()));
    return count > max ? `${max}+` : String(count);
  });
  protected readonly shown = computed(() => this.dot() || this.showZero() || (this.count() ?? 0) > 0);
}
