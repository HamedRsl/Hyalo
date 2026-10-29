/**
 * @internal Loads the overlay code the first time a tooltip or popover is
 * about to open. A page full of triggers then costs nothing until someone
 * hovers or clicks one, and the import resolves to the same module when the
 * app already uses the overlay elsewhere.
 */
export type HyOverlayKit = typeof import('./overlay-kit');

let kit: Promise<HyOverlayKit> | undefined;

/** @internal */
export function loadOverlay(): Promise<HyOverlayKit> {
  kit ??= import('./overlay-kit').catch((error: unknown) => {
    // A failed chunk load should not stick; the next open tries again.
    kit = undefined;
    throw error;
  });
  return kit;
}
