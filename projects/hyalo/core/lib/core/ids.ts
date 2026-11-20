import { APP_ID, InjectionToken, inject } from '@angular/core';

// Keep state in the application injector, not CDK's module-level counter map.
// Each SSR bootstrap gets fresh counters; child/route injectors share them.
const ID_GENERATOR = new InjectionToken<(prefix: string) => string>('HY_ID_GENERATOR', {
  providedIn: 'root',
  factory: () => {
    const appId = inject(APP_ID);
    const counters = new Map<string, number>();

    return (prefix) => {
      const key = `hy-${prefix}-${appId === 'ng' ? '' : appId}`;
      const count = counters.get(key) ?? 0;
      counters.set(key, count + 1);
      return `${key}${count}`;
    };
  },
});

/**
 * Returns an application-scoped unique id with the given prefix.
 * Matching server/client APP_ID and creation order produce matching ids.
 * Defaults to `hy-${prefix}-${n}`; custom APP_ID follows CDK's naming format.
 */
export function injectId(prefix: string): string {
  return inject(ID_GENERATOR)(prefix);
}
