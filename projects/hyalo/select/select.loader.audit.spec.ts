import { TestBed } from '@angular/core/testing';
import { HyFidelity } from '@hyalo/angular/core';
import { HySelect, type HySelectPage, type HySelectPageRequest } from './select';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const wait = () => new Promise((resolve) => setTimeout(resolve, 0));
describe('select page loader contract', () => {
  afterEach(() =>
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()),
  );
  it('loads only on open, appends offsets, aborts dismissal and ignores stale pages before retrying errors', async () => {
    TestBed.inject(HyFidelity).setTier('high');
    const requests: HySelectPageRequest[] = [];
    const pages: ReturnType<typeof deferred<HySelectPage<string>>>[] = [];
    const loader = (request: HySelectPageRequest) => {
      requests.push(request);
      const page = deferred<HySelectPage<string>>();
      pages.push(page);
      return page.promise;
    };
    const fixture = TestBed.createComponent(HySelect<string>);
    fixture.componentRef.setInput('options', []);
    fixture.componentRef.setInput('loadPage', loader);
    fixture.componentRef.setInput('pageSize', 2);
    fixture.detectChanges();
    await wait();
    fixture.detectChanges();
    expect(requests).toHaveLength(0);
    fixture.componentInstance.open();
    fixture.detectChanges();
    await wait();
    fixture.detectChanges();
    expect(requests[0]).toMatchObject({ offset: 0, limit: 2 });
    expect(document.querySelector('[role="status"]')?.textContent).toBe('Loading');
    pages[0]!.resolve({
      options: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
      ],
      hasMore: true,
    });
    await wait();
    fixture.detectChanges();
    await wait();
    fixture.detectChanges();
    fixture.componentInstance.loadMore();
    fixture.detectChanges();
    await wait();
    fixture.detectChanges();
    expect(requests[1]?.offset).toBe(2);
    fixture.componentInstance.close();
    fixture.detectChanges();
    await wait();
    fixture.detectChanges();
    expect(fixture.componentInstance.opened()).toBe(false);
    expect(requests[1]?.signal.aborted).toBe(true);
    pages[1]!.resolve({ options: [{ value: 'stale', label: 'Stale' }], hasMore: false });
    await wait();
    fixture.componentInstance.open();
    fixture.detectChanges();
    await wait();
    fixture.detectChanges();
    pages[2]!.reject(new Error('Offline'));
    await wait();
    fixture.detectChanges();
    await wait();
    fixture.detectChanges();
    const retry = [
      ...document.querySelectorAll<HTMLButtonElement>('.hy-select__panel button'),
    ].find((b) => b.textContent === 'Retry')!;
    expect(retry).toBeDefined();
    retry.click();
    fixture.detectChanges();
    await wait();
    fixture.detectChanges();
    expect(requests[3]?.offset).toBe(2);
    pages[3]!.resolve({ options: [{ value: 'c', label: 'C' }], hasMore: false });
    await wait();
    fixture.detectChanges();
    await wait();
    fixture.detectChanges();
    expect(
      [...document.querySelectorAll('[role="option"]')].map((n) => n.textContent?.trim()),
    ).toEqual(['A', 'B', 'C']);
    fixture.componentInstance.loadMore();
    fixture.detectChanges();
    await wait();
    fixture.detectChanges();
    expect(requests).toHaveLength(4);
  });
});
