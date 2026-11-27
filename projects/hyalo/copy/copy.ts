import { HyIcon } from '@hyalo/angular/icon';
import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
@Component({
  selector: 'hy-copy',
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button type="button" (click)="copy()" [attr.aria-label]="label()" [title]="copied() ? copiedLabel() : label()">
      <hy-icon [name]="copied() ? 'check' : 'copy'" size="1.15rem" /></button
    ><span class="sr" role="status">{{ status() }}</span
    ><ng-content />`,
  styleUrl: './copy.css',
})
export class HyCopy {
  readonly text = input.required<string>();
  readonly label = input('Copy');
  readonly copiedLabel = input('Copied');
  readonly failedLabel = input('Copy failed. Select and copy the text.');
  readonly completed = output<boolean>();
  private readonly result = signal<boolean | null>(null);
  protected readonly status = computed(() =>
    this.result() === null ? '' : this.result() ? this.copiedLabel() : this.failedLabel(),
  );
  private readonly clipboard = inject(Clipboard);
  private timer?: ReturnType<typeof setTimeout>;
  protected readonly copied = computed(() => this.result() === true);
  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }
  copy(): void {
    clearTimeout(this.timer);
    const success = this.clipboard.copy(this.text());
    this.result.set(success);
    this.completed.emit(success);
    this.timer = setTimeout(() => this.result.set(null), 2000);
  }
}
