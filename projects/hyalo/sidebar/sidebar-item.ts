import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { HyLocale } from '@hyalo/angular/core';
import { HyIcon } from '@hyalo/angular/icon';

@Component({
  // A native anchor keeps routerLink and browser link actions available.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[hySidebarItem]',
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar-item.html',
  host: {
    '[attr.aria-label]': 'accessibleLabel()',
    '[attr.title]': 'accessibleLabel()',
    '[attr.aria-current]': 'active() ? "page" : null',
  },
  styleUrl: './sidebar-item.css',
})
export class HySidebarItem {
  private readonly locale = inject(HyLocale);
  readonly label = input.required<string>();
  readonly icon = input('');
  readonly description = input('');
  readonly count = input<number | null>(null);
  readonly countLabel = input('');
  readonly active = input(false, { transform: booleanAttribute });
  protected readonly countText = computed(() => {
    const count = this.count();
    return count === null || !Number.isFinite(count)
      ? null
      : new Intl.NumberFormat(this.locale.locale()).format(Math.max(0, Math.trunc(count)));
  });
  protected readonly accessibleLabel = computed(() =>
    [
      this.label(),
      this.description(),
      this.countText() === null ? '' : this.countLabel() || this.countText(),
    ]
      .filter(Boolean)
      .join(' '),
  );
}
