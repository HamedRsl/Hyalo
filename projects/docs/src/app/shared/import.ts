import { HyIcon } from '@hyalo/angular/icon';
import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { copyText } from './copy-text';
@Component({
  imports: [HyIcon],
  selector: 'docs-import',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './import.html',
  styleUrl: './import.css',
})
export class DocsImport {
  private readonly document = inject(DOCUMENT);
  private readonly clipboard = inject(Clipboard);
  private readonly destroy = inject(DestroyRef);
  readonly code = input.required<string>();
  protected readonly result = signal<'copied' | 'error' | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor() {
    this.destroy.onDestroy(() => clearTimeout(this.timer));
  }
  protected async copy(): Promise<void> {
    const copied = await copyText(this.code(), this.document, this.clipboard);
    if (this.destroy.destroyed) return;
    this.result.set(copied ? 'copied' : 'error');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.result.set(null), 2000);
  }
}
