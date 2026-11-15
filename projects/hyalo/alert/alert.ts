import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
  output,
} from '@angular/core';
@Component({
  selector: 'hy-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert.html',
  styleUrl: './alert.css',
  host: { '[hidden]': '!visible()', '[attr.data-tone]': 'tone()' },
})
export class HyAlert {
  readonly heading = input('');
  readonly tone = input<'info' | 'success' | 'warning' | 'danger'>('info');
  readonly announce = input(false, { transform: booleanAttribute });
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissLabel = input('Dismiss message');
  readonly visible = model(true);
  readonly dismissed = output<void>();
  dismiss(): void {
    this.visible.set(false);
    this.dismissed.emit();
  }
}
