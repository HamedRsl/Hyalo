import { Component, ɵsetDocument } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { describe, expect, it } from 'vitest';
import { HyTimePicker } from './time-picker';
@Component({
  selector: 'hy-time-ssr',
  imports: [HyTimePicker],
  template: `<hy-time-picker hourFormat="12" value="23:45:30" [showSeconds]="true" />`,
})
class Host {}
describe('API-308/310 native select SSR', () => {
  it('serializes selected hour minute second and meridian before hydration', async () => {
    const globals = Object.getOwnPropertyDescriptors(globalThis);
    const accessors = new Map<string, unknown>();
    for (const [key, descriptor] of Object.entries(globals))
      if (descriptor.get && descriptor.set) accessors.set(key, Reflect.get(globalThis, key));
    const browserDocument = document;
    let html: string;
    try {
      html = await renderApplication(
        (context) => bootstrapApplication(Host, { providers: [provideServerRendering()] }, context),
        {
          document: '<!DOCTYPE html><html><body><hy-time-ssr></hy-time-ssr></body></html>',
          url: 'http://localhost/',
          allowedHosts: ['localhost'],
        },
      );
    } finally {
      for (const [key, value] of accessors)
        if (Reflect.get(globalThis, key) !== value) Reflect.set(globalThis, key, value);
      for (const key of Object.getOwnPropertyNames(globalThis))
        if (!(key in globals)) Reflect.deleteProperty(globalThis, key);
      for (const [key, descriptor] of Object.entries(globals))
        if (descriptor.configurable || descriptor.writable)
          Object.defineProperty(globalThis, key, descriptor);
      ɵsetDocument(browserDocument);
    }
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    expect(
      [...parsed.querySelectorAll('select')].map((select) =>
        select.querySelector('option[selected]')?.getAttribute('value'),
      ),
    ).toEqual(['11', '45', '30', '1']);
  });
});
