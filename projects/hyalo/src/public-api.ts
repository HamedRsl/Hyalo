/*
 * Public API of @hyalo/angular: the foundations every component builds on.
 * Components live in their own entry points, such as @hyalo/angular/button,
 * so an app only loads what each route uses.
 */
export * from './lib/core/axes';
export * from './lib/core/config';
export * from './lib/core/gsap';
export { injectId } from './lib/core/ids';
export * from './lib/fidelity/fidelity';
export * from './lib/motion/motion';
export * from './lib/motion/spring';
export * from './lib/material/material';
export * from './lib/interaction/state';

/** @internal Shared with the other entry points. Not part of the public API. */
export {
  injectIsBrowser as ɵinjectIsBrowser,
  matchesMedia as ɵmatchesMedia,
} from './lib/core/platform';
/** @internal */
export { trackIndicator as ɵtrackIndicator } from './lib/core/indicator';
