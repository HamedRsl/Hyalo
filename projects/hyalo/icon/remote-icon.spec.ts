import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, expect, it, vi } from 'vitest';
import { HyIcon } from './icon';
import { provideHyaloRemoteIcons } from './remote-icon';

@Component({
  imports: [HyIcon],
  providers: [provideHyaloRemoteIcons({
    'brand:mark': { url: '/mark.svg' },
    'brand:invalid': { url: 'data:image/svg+xml,invalid' },
  })],
  template: `<hy-icon [name]="name()" /><hy-icon [name]="name()" />`,
})
class Host {
  readonly name = signal('brand:mark');
}

const valid = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1l4 4" onclick="void 0" fill="url(#paint)" /></svg>';
const response = (body: string) => new Response(body);

afterEach(() => vi.unstubAllGlobals());

it('shares a request, caches validated geometry, and preserves the viewBox', async () => {
  const fetch = vi.fn().mockResolvedValue(response(valid));
  vi.stubGlobal('fetch', fetch);
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const host: HTMLElement = fixture.nativeElement;
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(host.querySelectorAll('path')).toHaveLength(2);
  const path = host.querySelector('path')!;
  expect(path.getAttribute('fill')).toBe('currentColor');
  expect(path.hasAttribute('onclick')).toBe(false);
  expect(path.closest('svg')!.getAttribute('viewBox')).toBe('0 0 10 10');
  fixture.componentInstance.name.set('plus');
  await fixture.whenStable();
  fixture.componentInstance.name.set('brand:mark');
  await fixture.whenStable();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(host.querySelector('path')!.getAttribute('d')).toBe('M1 1l4 4');
});

it('aborts a shared fetch when its last consumer switches name', async () => {
  let signal: AbortSignal | undefined;
  vi.stubGlobal('fetch', vi.fn((_url: URL, init: RequestInit) => {
    signal = init.signal!;
    return new Promise((_resolve, reject) => signal?.addEventListener('abort', () => reject(signal?.reason)));
  }));
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  await vi.waitFor(() => expect(signal).toBeDefined(), { timeout: 1000 });
  fixture.componentInstance.name.set('plus');
  fixture.detectChanges();
  await vi.waitFor(() => expect(signal?.aborted).toBe(true), { timeout: 1000 });
});

it('reports failures, retries, rejects unsupported SVG elements and blocks unsupported URL schemes', async () => {
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response(null, { status: 404 }))
    .mockResolvedValueOnce(response('<svg xmlns="http://www.w3.org/2000/svg"><foreignObject /></svg>'))
    .mockResolvedValueOnce(response(valid));
  vi.stubGlobal('fetch', fetch);
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const icon = fixture.debugElement.children[0]!.componentInstance as HyIcon;
  expect(icon.loadError()).toBeInstanceOf(Error);
  icon.reload();
  await fixture.whenStable();
  expect(icon.loadError()).toBeInstanceOf(Error);
  expect(fixture.nativeElement.querySelector('foreignObject')).toBeNull();
  icon.reload();
  await fixture.whenStable();
  expect(icon.loadError()).toBeUndefined();
  expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  fixture.componentInstance.name.set('brand:invalid');
  await fixture.whenStable();
  expect(icon.loadError()).toBeInstanceOf(Error);
  expect(fetch).toHaveBeenCalledTimes(3);
});
