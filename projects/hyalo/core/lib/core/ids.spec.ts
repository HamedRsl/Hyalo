import {
  APP_ID,
  ApplicationRef,
  Component,
  EnvironmentInjector,
  createEnvironmentInjector,
  runInInjectionContext,
  ɵsetDocument,
} from '@angular/core';
import {
  bootstrapApplication,
  createApplication,
  provideClientHydration,
} from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { afterEach, describe, expect, it } from 'vitest';
import { injectId } from './ids';

describe('injectId application scope', () => {
  const applications: ApplicationRef[] = [];

  afterEach(() => {
    for (const application of applications.splice(0)) application.destroy();
  });

  async function createApp(appId?: string): Promise<EnvironmentInjector> {
    const application = await createApplication({
      providers: appId === undefined ? [] : [{ provide: APP_ID, useValue: appId }],
    });
    applications.push(application);
    return application.injector;
  }

  function next(injector: EnvironmentInjector, prefix = 'select'): string {
    return runInInjectionContext(injector, () => injectId(prefix));
  }

  it('restarts each application at zero without resetting another live application', async () => {
    const first = await createApp();
    expect(next(first)).toBe('hy-select-0');
    expect(next(first)).toBe('hy-select-1');

    const second = await createApp();
    expect(next(second)).toBe('hy-select-0');
    expect(next(first)).toBe('hy-select-2');
    expect(next(second)).toBe('hy-select-1');
  });

  it('keeps independent per-prefix counters and unique IDs within an application', async () => {
    const app = await createApp();
    const ids = ['select', 'field-label', 'select', 'field-label', '__proto__', ''].map((prefix) =>
      next(app, prefix),
    );
    expect(ids).toEqual([
      'hy-select-0',
      'hy-field-label-0',
      'hy-select-1',
      'hy-field-label-1',
      'hy-__proto__-0',
      'hy--0',
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('shares counters with child environment injectors even if a child overrides APP_ID', async () => {
    const app = await createApp();
    const child = createEnvironmentInjector([{ provide: APP_ID, useValue: 'route' }], app);
    const sibling = createEnvironmentInjector([], app);
    try {
      // Resolve from the child first: its APP_ID must not create a new ID namespace.
      expect(next(child)).toBe('hy-select-0');
      expect(next(app)).toBe('hy-select-1');
      expect(next(sibling)).toBe('hy-select-2');
      child.destroy();
      expect(next(app)).toBe('hy-select-3');
    } finally {
      if (!child.destroyed) child.destroy();
      sibling.destroy();
    }
  });

  it('preserves CDK custom APP_ID formatting and separates multi-app namespaces', async () => {
    const first = await createApp('app-a');
    const second = await createApp('app-b');
    const repeat = await createApp('app-a');
    expect(next(first)).toBe('hy-select-app-a0');
    expect(next(second)).toBe('hy-select-app-b0');
    expect(next(first)).toBe('hy-select-app-a1');
    expect(next(repeat)).toBe('hy-select-app-a0');
  });

  it('restarts counters after an application is destroyed and bootstrapped again', async () => {
    const first = await createApp();
    expect(next(first)).toBe('hy-select-0');
    expect(next(first)).toBe('hy-select-1');
    applications.pop()!.destroy();
    expect(next(await createApp())).toBe('hy-select-0');
  });

  it('requires an Angular injection context', () => {
    expect(() => injectId('select')).toThrow(/NG0203/);
  });
});

@Component({
  selector: 'hy-id-ssr-host',
  template: `
    <label [attr.for]="first">First</label><input [id]="first" />
    <label [attr.for]="second">Second</label><input [id]="second" />
    <span [id]="hint">Hint</span>
  `,
})
class IdServerHost {
  readonly first = injectId('select');
  readonly second = injectId('select');
  readonly hint = injectId('field-hint');
}

describe('injectId repeated SSR requests', () => {
  it('serializes identical IDs on repeated requests and matches a fresh client application', async () => {
    // Domino changes worker globals. Restore descriptors AND accessor-backed
    // values before making assertions or allowing any browser spec to run.
    const globals = Object.getOwnPropertyDescriptors(globalThis);
    const accessorValues = new Map<string, unknown>();
    for (const [key, descriptor] of Object.entries(globals)) {
      if (descriptor.get && descriptor.set) accessorValues.set(key, Reflect.get(globalThis, key));
    }
    const browserDocument = document;
    const browserEvent = globalThis.Event;
    const browserKeyboardEvent = globalThis.KeyboardEvent;
    const html: string[] = [];
    try {
      for (let request = 0; request < 3; request++) {
        html.push(
          await renderApplication(
            (context) =>
              bootstrapApplication(
                IdServerHost,
                { providers: [provideServerRendering(), provideClientHydration()] },
                context,
              ),
            {
              document:
                '<!DOCTYPE html><html><body><hy-id-ssr-host></hy-id-ssr-host></body></html>',
              url: 'http://localhost/',
              allowedHosts: ['localhost'],
            },
          ),
        );
      }
    } finally {
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
    expect(document).toBe(browserDocument);
    const target = browserDocument.createElement('button');
    expect(() =>
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })),
    ).not.toThrow();

    const client = await createApplication();
    try {
      const clientIds = runInInjectionContext(client.injector, () => [
        injectId('select'),
        injectId('select'),
        injectId('field-hint'),
      ]);
      expect(clientIds).toEqual(['hy-select-0', 'hy-select-1', 'hy-field-hint-0']);
      expect(html).toHaveLength(3);
      for (const response of html) {
        const parsed = new DOMParser().parseFromString(response, 'text/html');
        expect([...parsed.querySelectorAll('input, span')].map((node) => node.id)).toEqual(
          clientIds,
        );
        expect([...parsed.querySelectorAll('label')].map((node) => node.htmlFor)).toEqual(
          clientIds.slice(0, 2),
        );
      }
    } finally {
      client.destroy();
    }
  });
});
