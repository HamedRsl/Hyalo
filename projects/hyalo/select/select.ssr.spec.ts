import { Component, ɵsetDocument } from '@angular/core';
import {
  bootstrapApplication,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { HySelect } from './select';

@Component({
  selector: 'hy-select-ssr-host',
  imports: [HySelect],
  template: `
    <hy-select [options]="options" [value]="40" name="size" />
    <hy-select [options]="options" required placeholder="Choose" />
    <hy-select [options]="grouped" [value]="40" />
  `,
})
class ServerHost {
  readonly options = [
    { key: 'small', value: 38, label: 'کوچک' },
    { key: 'medium', value: 40, label: 'متوسط' },
  ];
  readonly grouped = this.options.map((option) => ({
    ...option,
    group: { key: 'sizes', label: 'اندازه‌ها' },
  }));
}

describe('HySelect serialized native baseline', () => {
  it('serializes selected values and the required empty placeholder before hydration', async () => {
    // Angular's Domino SSR shim assigns DOM constructors onto globalThis.
    // The CLI shares this worker with browser specs: restore its exact realm,
    // including Angular's cached document, even when rendering/assertions fail.
    const globals = Object.getOwnPropertyDescriptors(globalThis);
    const accessorValues = new Map<string, unknown>();
    for (const [key, descriptor] of Object.entries(globals)) {
      if (descriptor.get && descriptor.set) accessorValues.set(key, Reflect.get(globalThis, key));
    }
    const browserEvent = globalThis.Event;
    const browserKeyboardEvent = globalThis.KeyboardEvent;
    const browserDocument = document;
    let html: string;
    try {
      html = await renderApplication(
        (context) =>
          bootstrapApplication(
            ServerHost,
            {
              providers: [provideServerRendering(), provideClientHydration(withEventReplay())],
            },
            context,
          ),
        {
          document:
            '<!DOCTYPE html><html dir="rtl"><body><hy-select-ssr-host></hy-select-ssr-host></body></html>',
          url: 'http://localhost/',
          allowedHosts: ['localhost'],
        },
      );
    } finally {
      // Vitest exposes DOM globals through accessors; restoring descriptors
      // alone leaves the setter's internal value pointing at Domino.
      for (const [key, value] of accessorValues) {
        if (Reflect.get(globalThis, key) !== value) Reflect.set(globalThis, key, value);
      }
      for (const key of Object.getOwnPropertyNames(globalThis)) {
        if (!(key in globals)) Reflect.deleteProperty(globalThis, key);
      }
      for (const [key, descriptor] of Object.entries(globals)) {
        if (descriptor.configurable || descriptor.writable) {
          Object.defineProperty(globalThis, key, descriptor);
        }
      }
      ɵsetDocument(browserDocument);
    }
    expect(globalThis.Event).toBe(browserEvent);
    expect(globalThis.KeyboardEvent).toBe(browserKeyboardEvent);
    const target = browserDocument.createElement('button');
    expect(() =>
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })),
    ).not.toThrow();
    const parsedDocument = new DOMParser().parseFromString(html, 'text/html');
    const [selected, empty, grouped] = [...parsedDocument.querySelectorAll('select')];
    expect(selected!.querySelector('option[selected]')?.getAttribute('value')).toBe(
      'string:medium',
    );
    expect(selected!.value).toBe('string:medium');
    expect(empty!.querySelector('option[selected]')?.getAttribute('value')).toBe('');
    expect(empty!.value).toBe('');
    expect(empty!.required).toBe(true);
    expect(grouped!.querySelector('optgroup')!.label).toBe('اندازه‌ها');
    expect(grouped!.querySelector('optgroup option[selected]')?.getAttribute('value')).toBe(
      'string:medium',
    );
    expect(grouped!.value).toBe('string:medium');
    expect(
      [...parsedDocument.querySelectorAll('hy-select')].every(
        (host) => !host.querySelector('select')!.hidden && host.querySelector('button')!.hidden,
      ),
    ).toBe(true);
  });
});
