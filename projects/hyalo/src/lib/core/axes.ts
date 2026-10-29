/**
 * How see-through a surface is.
 *
 * - `clear`: a light veil, most of the background shows through.
 * - `frosted`: the default glass, blurred and saturated.
 * - `tinted`: frosted glass coloured by the accent.
 * - `solid`: opaque. Used automatically when the browser cannot blur, when
 *   the user asks for reduced transparency, and on the low fidelity tier.
 */
export type HyMaterial = 'clear' | 'frosted' | 'tinted' | 'solid';

/**
 * How heavy a glass surface reads. Bigger surfaces should be thicker: more
 * blur and a deeper shadow.
 *
 * - `thin`: chips and buttons.
 * - `regular`: the default, for cards, bars, popovers and toasts.
 * - `thick`: dialogs, drawers and sheets.
 */
export type HyThickness = 'thin' | 'regular' | 'thick';

/** Control size. All sizes keep a touch target of at least 32px. */
export type HySize = 'sm' | 'md' | 'lg';

/** Colour role of a control. */
export type HyTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger';

/**
 * How much visual effort the device can afford.
 *
 * - `high`: everything, including cursor physics and (from v0.2) WebGL.
 * - `medium`: GSAP tilt and reveals, no WebGL.
 * - `low`: CSS only. Glass turns solid and nothing waits on JavaScript to
 *   become visible.
 */
export type HyFidelityTier = 'high' | 'medium' | 'low';
