# Changelog

All notable changes to `@hyalo/angular` are listed here. The format follows [Keep a Changelog](https://keepachangelog.com), and versions follow [Semantic Versioning](https://semver.org). Until 1.0, a minor version can include breaking changes.

## 0.4.0 (2026-11-16)

### Advanced forms

- Added all 14 phase 4 families with Signal Forms metadata and compatForm coverage.
- Added Gregorian and Jalali date adapters, keyboard calendars, date ranges, and time slots.
- Isolated the trusted Jalali conversion behind the optional jalaali-js peer and added
  native validity plus explicit Signal Forms parse-validation hooks.
- Added cancellable remote combobox and multi-select, localized number parsing, password
  reveal, OTP paste/autofill, masks, Iranian phone entry, sliders, uploads, rating,
  selectable radio/checkbox cards, and validated inline editing.
- Added booking, authentication, and workspace settings blocks with host-owned actions.
- Added component documentation, source examples, catalog previews, and advanced dashboard editors.
- Kept new scalar fields registered on clear by using null, and separated composite
  field surfaces so disabled descendants do not dim enabled sibling controls.

## 0.3.1 (2026-11-15)

### App shell and data

- Added sidebar, breadcrumb, dropdown and navigation menus, command palette,
  pagination, tables, charts, sparklines, statistics, progress, alerts and lists.
- Added filters, copy controls, number tickers, progressive blur and composed blocks.
- Separated core and motion entry points; chart and syntax engines remain optional.

### Polish and fixes

- Sorted documentation navigation and completed all component catalog previews.
- Refined dashboard spacing, sidebar surfaces, collapsed navigation and responsive layout.
- Matched input focus rings to rounded field surfaces and standardized SVG chevrons.
- Fixed Signal Forms integration, command dismissal and exact code-block whitespace.
- Batched pointer and WebGL geometry reads, canceled pending indicator work on destroy,
  cached shader uniforms and released WebGL resources explicitly.
- Extracted larger templates and styles and aligned lint checks with package boundaries.

## 0.2.0

### Showcase and marketing

- Rebuilt chapter navigation with explicit smooth scrolling, nested reading panes,
  stable selection, history and focus handling, and optional sticky links.

- Hotspots can open anchored, solid detail panels with Escape dismissal and focus
  return, and support labelled or compact pin modes.
- Carousel hides its native scrollbar by default, offers dot/counter pagination,
  slide/fade modes and optional loop navigation. Scroll position updates use cached
  dimensions and one animation-frame callback instead of scanning every slide.
- Skeletons offer shimmer, pulse and static modes.
- Docs code panels have HTML, TypeScript and conditional CSS tabs, keyboard navigation,
  copy feedback without highlighting the preview card. Their sources are generated
  from live demos; import snippets have their own copy buttons.
- Added selectable `HyChip` controls, custom carousel navigation templates, icon and
  hidden button modes, three navigation positions, and passive catalog previews.
- Fixed loop-mode scroll feedback, first-frame popover placement, accordion padding
  jumps and mesh animation visibility. Mesh pause/resume retains its animation position.
- Fixed chapter links resolving against the app base URL instead of the current route;
  selection now follows clicks and fragment history without leaving the page.

- Added independently importable carousel, lightbox/gallery, image compare, marquee,
  split-text reveal, refraction, scene hotspot, mesh background, timeline, stepper,
  badge/chip, avatar/group and skeleton components.
- Added button group, link, divider, aspect-ratio frame, chapter navigation and
  scroll-to-top helpers. Toggle groups use the existing segmented control.
- Carousel supports native touch inertia, mouse drag velocity, keyboard navigation
  and RTL. Lightbox reuses CDK dialog focus trapping, dismissal and focus restore.
- Stepper gates incomplete steps, retains form DOM and focuses the selected header.
- Refraction shares one WebGL context across image-backed surfaces on high fidelity,
  with CSS glass fallbacks. Decorative motion follows fidelity and reduced motion.
- Added 19 lazy docs pages with live demos, API tables and accessibility notes.

## 0.1.0

The first release.

### Foundations (`@hyalo/angular`)

- `provideHyalo()` for global config, with the material, size and tone axes.
- `HyFidelity`, which steps the glass down on devices or settings where blur would hurt.
- `HyMotion` with motion presets, a spring helper and an optional, lazily loaded GSAP.
- The glass material directive and interaction state.

### Components

Each one is standalone and has its own entry point.

- `@hyalo/angular/accordion`: `hy-accordion` and `hy-accordion-item` on Angular Aria.
- `@hyalo/angular/button`: `hyButton` for buttons and link buttons, with an inline loading spinner.
- `@hyalo/angular/card`: `hy-card` with media, header, body and footer slots.
- `@hyalo/angular/choice`: `hy-checkbox`, `hy-radio-group` with `hy-radio`, and `hy-switch`.
- `@hyalo/angular/dialog`: the `HyDialog` and `HyDrawer` services, content parts, a confirm helper, side drawers and bottom sheets.
- `@hyalo/angular/field`: `hy-field` and `hyInput` for text fields, with Signal Forms support.
- `@hyalo/angular/icon`: `hy-icon` with a name registry and Lucide-compatible data.
- `@hyalo/angular/interaction`: reveal, tilt, magnetic and ripple directives.
- `@hyalo/angular/navbar`: `hy-navbar` with a collapsible menu and scroll behaviour.
- `@hyalo/angular/overlay`: logical placement helpers for CDK overlays.
- `@hyalo/angular/popover`: `hyTooltip` and `hyPopover`, loading the CDK overlay on first open.
- `@hyalo/angular/segmented`: `hy-segmented`.
- `@hyalo/angular/select`: `hy-select` on the Angular Aria combobox and listbox.
- `@hyalo/angular/tabs`: `hy-tabs` on Angular Aria.
- `@hyalo/angular/theme`: `HyPalette` for switching palettes at runtime.
- `@hyalo/angular/toast`: the `HyToaster` service with swipe to dismiss.

### Styles

- `styles/hyalo.css` with everything, or `styles/hyalo-core.css` plus one file per overlay from `styles/overlays/`.
- Design tokens, light and dark themes, and component tokens, all in cascade layers.
- Six on-demand palettes in `styles/palettes/`: aurora, ember, orchid, ocean, rose and graphite.
