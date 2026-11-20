import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  InjectionToken,
  Injector,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_DIALOG_DATA, HyDialogRef } from '@hyalo/angular/dialog';
import { HyMotion } from '@hyalo/angular/motion';
import { HyBottomSheet } from './bottom-sheet';
const CONTENT_SCOPE = new InjectionToken<string>('content scope');
const destroyed = vi.fn();
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
    '<p>{{ data }} / {{ scope }}</p><button type="button" (click)="ref.close(\'done\')">Save</button>',
})
class StandaloneContent {
  readonly data = inject(HY_DIALOG_DATA);
  readonly scope = inject(CONTENT_SCOPE);
  readonly ref = inject(HyDialogRef<string>);
  constructor() {
    inject(DestroyRef).onDestroy(destroyed);
  }
}
describe('bottom sheet standalone content', () => {
  it('preserves custom injection, data, dialog refs, and content destruction', async () => {
    TestBed.inject(HyMotion).setReduced(true);
    destroyed.mockClear();
    const injector = Injector.create({
      parent: TestBed.inject(Injector),
      providers: [{ provide: CONTENT_SCOPE, useValue: 'custom' }],
    });
    const ref = TestBed.inject(HyBottomSheet).open<string>(StandaloneContent, {
      data: 'Address',
      injector,
      label: 'Edit',
    });
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.querySelector('.body')?.textContent).toContain('Address / custom');
    document.querySelector<HTMLButtonElement>('.body button')!.click();
    expect(await ref.closed).toBe('done');
    expect(destroyed).toHaveBeenCalledTimes(1);
    injector.destroy();
    TestBed.inject(HyMotion).setReduced(null);
  });
});
