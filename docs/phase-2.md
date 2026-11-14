# Phase 2: showcase and marketing

Version 0.2 includes the roadmap's 13 components and six helpers. Each lives in its
own secondary entry point and has a corresponding lazy documentation route.

## Media

- **Carousel:** `HY_CAROUSEL` projects `hy-slide` elements into a native horizontal
  scroll-snap viewport. Touch scrolling uses browser inertia. Mouse dragging projects
  velocity at release to a slide. `[(index)]` and `goTo()` support application control.
  Arrow keys follow reading direction; Home and End jump to the boundaries. There is
  no autoplay. Links and buttons inside slides keep their own pointer interactions.
  The scrollbar is hidden by default and can be enabled with `scrollbar`. Dot,
  counter and hidden pagination modes are available. `mode="fade"` crossfades using
  opacity and makes inactive slides inert; slide mode retains native scrolling.
  `loop` wraps explicit navigation. Scroll events read cached dimensions at most once
  per animation frame, rather than measuring every slide.
  Navigation supports `navigation="text | icons | none"` and
  `navPosition="below | inside-bottom | sides"`. Supply `ng-template[hyCarouselNavigation]`
  for custom buttons; `hyCarouselPrevious` and `hyCarouselNext` handle navigation and
  boundary disabling. Programmatic smooth scrolling retains the requested selection
  until it settles, preventing feedback from intermediate positions in loop mode.
- **Gallery/lightbox:** `HyGallery` accepts image data; `HyLightbox.open()` provides a
  service API. Images require alternative text and may include captions and thumbnails.
  The existing dialog handles focus trapping, Escape, backdrop dismissal and restoration.
  Include `styles/overlays/dialog.css` when using `hyalo-core.css`.
- **Image compare:** a native, visibly labelled range input controls the reveal. Image
  composition remains physically left-to-right in both reading directions.
- **Marquee:** content uses `ng-template[hyMarqueeItem]`, so both visual copies get real
  template instances. The duplicate is inert and hidden from assistive technology.
  Avoid IDs inside item templates. Hover, focus and an explicit pause button can stop
  movement. Low fidelity and reduced motion show the original stationary logo wall.
- **Split text:** plain text is measured into lines after hydration and remeasured on
  resize and font readiness. Assistive technology reads one complete text node. Use it
  inside a semantic heading. Text remains visible during server rendering.

## Effects

- **Refraction:** accepts an explicit scene image; it cannot sample arbitrary DOM
  content. High fidelity uses one shared, lazily loaded WebGL renderer, with a 2D
  presentation canvas per surface. The shader bends the supplied image at its edges.
  Rendering happens on image load, resize and input changes, without a continuous loop.
  Images must be same-origin or CORS-enabled. Medium/low fidelity, unavailable WebGL,
  image failures and context loss retain CSS glass. Reduced transparency hides the
  decorative layers. Keep the image-opacity token low enough for readable content.
- **3D hotspot:** a native button receives projected percent coordinates from the
  application's scene renderer. It does not depend on Three.js. Coordinates use inline
  start; mirror physical x coordinates for RTL. Occluded points can leave the tab order
  with `position.visible = false`.
  `mode="pin"` uses a compact, named button. Supplying `description` enables a detail
  popover beside the trigger, with `[(open)]`, Escape dismissal and focus restoration.
  It uses a solid surface over scene imagery to keep text readable. Include
  `styles/overlays/popover.css` when using the core stylesheet.
- **Mesh:** uses theme color washes behind stationary content. Ambient motion is
  opt-in, has an explicit pause control and follows `HyMotion.enabled()`.

## Display and navigation

- Timeline provides list semantics and optional machine-readable dates. Applications
  format dates, including Persian/Jalali display strings.
- Stepper accepts projected steps, completion gates and disabled states. Its hidden
  panels remain mounted and inert, preserving native form values. Selected headers
  receive focus after navigation. Applications own validation and submission.
- Badges support semantic tone, size, material and optional removal events. Applications
  own the chip collection and focus placement after removing a focused chip.
  `HyChip` adds native toggle-button semantics and `[(selected)]` for selectable filters.
- Avatars provide named image semantics, Unicode initials and failed-image fallback.
- Skeletons are decorative; place `aria-busy` and a loading label on their region.
  Choose `animation="shimmer"`, `"pulse"` or `"none"`. The first two use transform
  or opacity only and stop on low fidelity or reduced motion.
- Button groups collect native actions. Mutually exclusive toggle groups use the
  existing `HySegmented` entry point.
- Links, dividers and aspect-ratio frames retain native link/separator semantics.
- Chapter navigation uses native fragment links, current-section state and a thread
  indicating chapter position. Target IDs must be unique.
- Scroll-to-top returns focus to a heading or configured target and follows reduced
  motion when scrolling.

## Verification

Build the library and prerendered docs with `npm run build`. Run `npm test` for unit
and axe checks, and `npm run lint` for Angular, logical-CSS and prose checks. All new
components can be inspected under the docs toolbar's theme, direction, motion and
fidelity settings. Browser verification should include physical touch gestures on a
touch device; unit tests cannot establish native inertia feel.

Code panels throughout the docs show the actual example HTML, standalone TypeScript
and the custom CSS used by that example. Sources are generated at build/start time;
run `npm run docs:sources` after changing a live example during a development session.
`npm run docs:check-sources` compiles every displayed example together. Source text
stays in each lazy documentation route, with no browser-side parsing or highlighting
engine. Copy uses the native clipboard with a CDK fallback and reports failures.
Imports have their own copy buttons. Opening a source panel leaves the preview card's
border unchanged. Catalog thumbnails use passive previews, with no WebGL contexts or
continuous animations running in the grid.

The package is prepared as 0.2.0. Publishing remains a separate release operation.
