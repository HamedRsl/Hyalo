import { inject } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

/**
 * Returns a unique id with the given prefix. The counter is per application,
 * so the server and the client produce the same ids during hydration.
 */
export function injectId(prefix: string): string {
  return inject(_IdGenerator).getId(`hy-${prefix}-`);
}
