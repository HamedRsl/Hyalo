import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HyCombobox } from './combobox';
import type { HyOptionPageRequest } from './query';

describe('API-061/062/063/065/067 search policy', () => {
  afterEach(() =>
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()),
  );
  it('loads successive pages, aborts on query replacement and on destruction', async () => {
    const fixture = TestBed.createComponent(HyCombobox<string>);
    const requests: HyOptionPageRequest[] = [];
    fixture.componentRef.setInput('loadPage', async (request: HyOptionPageRequest) => {
      requests.push(request);
      return {
        options: [{ value: request.query + request.offset, label: request.query + request.offset }],
        hasMore: request.offset === 0,
      };
    });
    fixture.componentRef.setInput('pageSize', 1);
    fixture.componentRef.setInput('minQueryLength', 2);
    await fixture.whenStable();
    fixture.componentInstance.show();
    await fixture.whenStable();
    expect(requests).toHaveLength(0);
    fixture.componentInstance.query.set('ab');
    await fixture.whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    await fixture.whenStable();
    expect(requests.map((request) => request.offset)).toEqual([0]);
    fixture.componentInstance.loadMore();
    await fixture.whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    await fixture.whenStable();
    expect(requests.map((request) => request.offset)).toEqual([0, 1]);
    expect(document.querySelectorAll('[role=option]')).toHaveLength(2);
    fixture.componentInstance.query.set('cd');
    await fixture.whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    await fixture.whenStable();
    expect(requests.at(-1)!.offset).toBe(0);
    expect(requests[1]!.signal.aborted).toBe(true);
    fixture.destroy();
    expect(requests.at(-1)!.signal.aborted).toBe(true);
  });
  it('debounces the latest eligible query and cancels a pending query when cleared', async () => {
    const fixture = TestBed.createComponent(HyCombobox<string>);
    const load = vi.fn(async () => []);
    fixture.componentRef.setInput('loadOptions', load);
    fixture.componentRef.setInput('minQueryLength', 2);
    fixture.componentRef.setInput('debounce', 100);
    fixture.componentInstance.show();
    await fixture.whenStable();

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const type = (query: string) => {
        fixture.componentInstance.query.set(query);
        fixture.detectChanges();
      };
      type('a');
      await vi.advanceTimersByTimeAsync(100);
      fixture.detectChanges();
      expect(load).not.toHaveBeenCalled();

      type('ab');
      await vi.advanceTimersByTimeAsync(60);
      type('abc');
      await vi.advanceTimersByTimeAsync(99);
      fixture.detectChanges();
      expect(load).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      fixture.detectChanges();
      expect(load).toHaveBeenCalledExactlyOnceWith('abc', expect.any(AbortSignal));

      type('abcd');
      type('');
      await vi.advanceTimersByTimeAsync(100);
      fixture.detectChanges();
      expect(load).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('commits typed free text only when exact matching is not required and exposes visibility events', async () => {
    const fixture = TestBed.createComponent(HyCombobox<string>);
    fixture.componentRef.setInput('createValue', (text: string) => text.toUpperCase());
    fixture.componentRef.setInput('hint', 'Choose or create');
    const visibility: boolean[] = [];
    fixture.componentInstance.visibilityChange.subscribe((value) => visibility.push(value));
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const enter = async (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await fixture.whenStable();
    };
    await enter('new');
    expect(fixture.componentInstance.value()).toBe('NEW');
    expect(visibility).toEqual([true, false]);
    fixture.componentRef.setInput('requireExactMatch', true);
    await fixture.whenStable();
    await enter('other');
    expect(fixture.componentInstance.value()).toBe('NEW');
    expect(fixture.nativeElement.textContent).toContain('Choose or create');
  });
});
