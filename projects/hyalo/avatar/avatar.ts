import { ChangeDetectionStrategy, Component, computed, input, signal, output } from '@angular/core';
import { HyIcon } from '@hyalo/angular/icon';
import type { HySize } from '@hyalo/angular/core';
@Component({
  selector: 'hy-avatar',
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', '[attr.aria-label]': 'name()', '[attr.data-size]': 'size()', '[style.border-radius]': 'shape() === "circle" ? "50%" : "var(--hy-radius-m)"' },
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class HyAvatar {
  readonly name = input.required<string>();
  readonly src = input('');
  readonly size = input<HySize>('md');
  readonly shape = input<'circle' | 'square'>('circle');
  readonly srcset = input('');
  readonly sizes = input('');
  readonly loading = input<'eager' | 'lazy'>('eager');
  readonly fetchPriority = input<'auto' | 'high' | 'low'>('auto');
  readonly icon = input<string>();
  readonly imageError = output<Event>();
  protected fail(event: Event): void {
    this.failedSrc.set(this.src());
    this.imageError.emit(event);
  }
  protected readonly failedSrc = signal<string | null>(null);
  protected readonly initials = computed(() =>
    this.name()
      .trim()
      .split(/\s+/u)
      .slice(0, 2)
      .map((part) => Array.from(part)[0] ?? '')
      .join(''),
  );
}
@Component({
  selector: 'hy-avatar-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', '[attr.aria-label]': 'label()' },
  template: '<ng-content />',
  styles: ':host { display:flex; flex-wrap:wrap; gap:var(--hy-space-1); }',
})
export class HyAvatarGroup {
  readonly label = input('Team');
}
export const HY_AVATAR = [HyAvatar, HyAvatarGroup] as const;
