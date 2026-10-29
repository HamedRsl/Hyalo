# Changelog

All notable changes to `@hyalo/angular` are listed here. The format follows [Keep a Changelog](https://keepachangelog.com), and versions follow [Semantic Versioning](https://semver.org). Until 1.0, a minor version can include breaking changes.

## 0.1.0 (unreleased)

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
