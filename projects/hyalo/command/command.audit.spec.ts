import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { HyCommand, type HyCommandItem } from './command';

describe('API-068/069 command pages and remote search', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove()));
  it('enters a nested page without closing and returns to its parent', async () => {
    const ref = TestBed.inject(HyCommand).open({
      items: [
        {
          id: 'settings',
          label: 'Settings',
          value: 0,
          children: [{ id: 'theme', label: 'Theme', value: 1 }],
        },
      ],
    });
    await TestBed.inject(ApplicationRef).whenStable();
    const panel = document.querySelector('hy-command-panel')!;
    panel.querySelector<HTMLElement>('[role=option]')!.click();
    await TestBed.inject(ApplicationRef).whenStable();
    expect(panel.textContent).toContain('Theme');
    expect(panel.querySelectorAll('[role=option]')).toHaveLength(1);
    panel.querySelector<HTMLButtonElement>('[aria-label="Back"]')!.click();
    await TestBed.inject(ApplicationRef).whenStable();
    expect(panel.querySelector('[role=option]')!.textContent).toContain('Settings');
    ref.close();
  });
  it('aborts stale remote searches and ignores late results after close', async () => {
    const requests: {
      query: string;
      signal: AbortSignal;
      resolve: (items: readonly HyCommandItem<number>[]) => void;
    }[] = [];
    const ref = TestBed.inject(HyCommand).open<number>({
      items: [],
      loadItems: (query, signal) =>
        new Promise<readonly HyCommandItem<number>[]>((resolve) =>
          requests.push({ query, signal, resolve }),
        ),
    });
    await TestBed.inject(ApplicationRef).whenStable();
    const panel = document.querySelector('hy-command-panel')!;
    const input = panel.querySelector('input')!;
    input.value = 'new';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await TestBed.inject(ApplicationRef).whenStable();
    expect(requests[0]!.signal.aborted).toBe(true);
    requests[0]!.resolve([{ id: 'old', label: 'Old', value: 0 }]);
    requests[1]!.resolve([{ id: 'new', label: 'New', value: 1 }]);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    await TestBed.inject(ApplicationRef).whenStable();
    expect(panel.textContent).not.toContain('Old');
    expect(panel.querySelector('[role=option]')!.textContent).toContain('New');
    const closed = firstValueFrom(ref.closed);
    ref.close();
    await closed;
    expect(requests[1]!.signal.aborted).toBe(true);
    expect(document.querySelector('hy-command-panel')).toBeNull();
  });
});
