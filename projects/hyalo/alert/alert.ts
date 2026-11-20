import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
  output,
  effect,
  afterNextRender,
  signal,
} from '@angular/core';
@Component({
  selector: 'hy-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert.html',
  styleUrl: './alert.css',
  host: { '[hidden]': '!visible()', '[attr.data-tone]': 'tone()', '[attr.data-banner]': 'banner() || null' },
})
export class HyAlert {
  readonly heading = input('');
  readonly tone = input<'info' | 'success' | 'warning' | 'danger'>('info');
  readonly announce = input(false, { transform: booleanAttribute });
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissLabel = input('Dismiss message');
  readonly visible = model(true);
  readonly dismissed = output<void>();
  readonly duration = input(0);
  readonly banner = input(false, { transform: booleanAttribute });
  private readonly ready = signal(false);
  constructor() {
    afterNextRender(() => this.ready.set(true));
    effect(cleanup => {
      const duration = this.duration();
      if (!this.ready() || !this.visible() || !Number.isFinite(duration) || duration <= 0) return;
      const timer = setTimeout(() => this.dismiss(), duration);
      cleanup(() => clearTimeout(timer));
    });
  }
  dismiss(): void {
    if (!this.visible()) return;
    this.visible.set(false);
    this.dismissed.emit();
  }
}
