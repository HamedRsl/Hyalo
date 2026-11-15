import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  inject,
  input,
  signal,
} from '@angular/core';
@Component({
  selector: 'hy-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-block.html',
  styleUrl: './code-block.css',
})
export class HyCodeBlock {
  readonly code = input.required<string>();
  readonly language = input('text');
  readonly label = input('Code sample');
  readonly copyable = input(true, { transform: booleanAttribute });
  readonly status = signal('');
  private readonly clipboard = inject(Clipboard);
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }
  copy(): void {
    clearTimeout(this.timer);
    this.status.set(
      this.clipboard.copy(this.code()) ? 'Copied' : 'Copy failed. Select and copy the code.',
    );
    this.timer = setTimeout(() => this.status.set(''), 2000);
  }
}
