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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button type="button" (click)="copy()" [attr.aria-label]="label()">
      {{ copied() ? copiedLabel() : label() }}</button
    ><span class="sr" role="status">{{ status() }}</span
    ><ng-content />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    button {
      min-block-size: 44px;
      border: 1px solid var(--hy-line);
      background: var(--hy-surface-1);
      color: var(--hy-ink);
      border-radius: var(--hy-radius-s);
      font: inherit;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--hy-primary);
      outline-offset: 2px;
    }
    .sr {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      clip-path: inset(50%);
      overflow: hidden;
    }
  `,
})
export class HyCopy {
  readonly text = input.required<string>();
  readonly label = input('Copy');
  readonly copiedLabel = input('Copied');
  readonly failedLabel = input('Copy failed. Select and copy the text.');
  readonly completed = output<boolean>();
  protected readonly status = signal('');
  private readonly clipboard = inject(Clipboard);
  private timer?: ReturnType<typeof setTimeout>;
  protected readonly copied = computed(() => this.status() === this.copiedLabel());
  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }
  copy(): void {
    clearTimeout(this.timer);
    const success = this.clipboard.copy(this.text());
    this.status.set(success ? this.copiedLabel() : this.failedLabel());
    this.completed.emit(success);
    this.timer = setTimeout(() => this.status.set(''), 2000);
  }
}
