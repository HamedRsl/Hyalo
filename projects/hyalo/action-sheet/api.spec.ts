import { TestBed } from '@angular/core/testing';
import { HyActionSheet, type HySheetAction } from './action-sheet';

describe('action sheet async handlers', () => {
  async function setup(action: HySheetAction) {
    const f = TestBed.createComponent(HyActionSheet);
    f.componentRef.setInput('heading', 'Actions');
    f.componentRef.setInput('actions', [action]);
    await f.whenStable();
    f.componentInstance.open.set(true);
    return f;
  }
  it('blocks duplicate execution, honors false, and recovers for a later selection', async () => {
    let resolve!: (value: boolean) => void;
    const action = {
      id: 'save',
      label: 'Save',
      handler: vi.fn(
        () =>
          new Promise<boolean>((done) => {
            resolve = done;
          }),
      ),
    };
    const f = await setup(action);
    const selected = vi.fn();
    f.componentInstance.selected.subscribe(selected);
    const first = f.componentInstance.choose(action);
    await f.componentInstance.choose(action);
    expect(action.handler).toHaveBeenCalledTimes(1);
    resolve(false);
    await first;
    expect(selected).not.toHaveBeenCalled();
    expect(f.componentInstance.open()).toBe(true);
    expect(f.componentInstance.pending()).toBeNull();
    const next = f.componentInstance.choose(action);
    resolve(true);
    await next;
    expect(selected).toHaveBeenCalledWith(action);
    expect(f.componentInstance.open()).toBe(false);
  });
  it('reports handler rejection and ignores a result after the sheet closes', async () => {
    const failure = new Error('offline');
    const action = { id: 'save', label: 'Save', handler: vi.fn().mockRejectedValue(failure) };
    const f = await setup(action);
    const failed = vi.fn();
    const selected = vi.fn();
    f.componentInstance.actionError.subscribe(failed);
    f.componentInstance.selected.subscribe(selected);
    await f.componentInstance.choose(action);
    expect(failed).toHaveBeenCalledWith({ action, error: failure });
    let resolve!: (value: boolean) => void;
    const late = {
      ...action,
      handler: () =>
        new Promise<boolean>((done) => {
          resolve = done;
        }),
    };
    const pending = f.componentInstance.choose(late);
    f.componentInstance.open.set(false);
    resolve(true);
    await pending;
    expect(selected).not.toHaveBeenCalled();
  });
});
