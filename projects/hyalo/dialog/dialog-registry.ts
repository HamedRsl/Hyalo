import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import type { HyDialogRef } from './dialog-ref';

/** Shared registry for surfaces opened through HyDialog and HyDrawer. */
@Injectable({ providedIn: 'root' })
export class HyDialogRegistry {
  private readonly refs = signal<readonly HyDialogRef[]>([]);
  readonly openDialogs = this.refs.asReadonly();
  readonly afterAllClosed = new Subject<void>();
  getById(id: string): HyDialogRef | undefined { return this.refs().find((ref) => ref.id === id); }
  closeAll(): void { for (const ref of this.refs()) ref.close(); }
  /** @internal */
  track<R>(ref: HyDialogRef<R>): HyDialogRef<R> {
    this.refs.update((refs) => [...refs, ref as HyDialogRef]);
    void ref.closed.then(() => {
      this.refs.update((refs) => refs.filter((item) => item !== ref));
      if (!this.refs().length) this.afterAllClosed.next();
    });
    return ref;
  }
}
