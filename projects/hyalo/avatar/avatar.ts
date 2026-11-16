import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import type { HySize } from '@hyalo/angular/core';
@Component({
  selector: 'hy-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', '[attr.aria-label]': 'name()', '[attr.data-size]': 'size()' },
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class HyAvatar {
  readonly name = input.required<string>();
  readonly src = input('');
  readonly size = input<HySize>('md');
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
