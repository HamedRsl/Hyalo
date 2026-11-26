<p align="center">
  <img src="https://raw.githubusercontent.com/HamedRsl/Hyalo/main/.github/assets/hyalo-logo.jpg" alt="Hyalo, Angular UI kit" width="240" />
</p>

# @hyalo/angular

Version 0.6 adds a data grid, tree and tree table, virtual scroller, Kanban board, scheduler, splitter, dashboard layout, context menu, and rich-text editor. Optional engines load through their component entry points. See the [changelog](./CHANGELOG.md) for the public API updates and fixes.

Version 0.4 adds advanced forms, including Gregorian/Jalali dates, time slots,
combobox and multi-select, localized numbers, password and OTP inputs, masks and
Iranian phone entry, sliders, uploads, ratings, selectable cards, and inline edits.
Import dates from `@hyalo/angular/dates`; other controls use their named entry points.
Booking, authentication, and settings compositions are available in `/blocks`.
Install the optional `jalaali-js` peer when using `/dates` or these form blocks:
`npm install jalaali-js`.

Bind with Angular Signal Forms. Existing typed Reactive Forms can use Angular's
`compatForm` from `@angular/forms/signals/compat` and bind its resulting fields
with `FormField`. New nullable scalar controls use `null` for an empty value:
`undefined` removes a field from Angular's signal model. Strings use `''` and
multiple selections use empty arrays. Applications own business validation and
backend actions.

Liquid glass components for Angular, built on Angular Aria and the CDK. Signal based, zoneless, server-render safe, accessible, and ready for RTL.

```sh
npm install @hyalo/angular
```

Add the stylesheet before your own styles in `angular.json`:

```json
"styles": ["node_modules/@hyalo/angular/styles/hyalo.css", "src/styles.css"]
```

`hyalo.css` includes every overlay's styles. To leave out the ones you don't use, list `hyalo-core.css` plus the files you need from `styles/overlays/` (`select.css`, `popover.css`, `dialog.css`, `toast.css`) instead.

Then import the standalone components you need. Each one has its own entry point, so a lazy route only loads what it uses:

```ts
import { HyButton } from '@hyalo/angular/button';
import { HY_CARD } from '@hyalo/angular/card';
```

`@hyalo/angular` itself holds the shared foundations, such as `provideHyalo()`, `HyFidelity` and `HyMotion`.

Version 0.2 adds carousel, gallery and lightbox, image comparison, marquee, split text,
refraction, scene hotspots, mesh backgrounds, timeline, stepper, badges, avatars and
skeletons. Each has its own package entry point, such as `@hyalo/angular/carousel`.
Button groups, links, dividers, aspect-ratio frames, chapter navigation and scroll-to-top
controls are included too. The existing segmented control provides toggle groups.

Refraction uses a supplied same-origin or CORS-enabled image and one shared WebGL
context on high fidelity. CSS glass remains available on other tiers or when WebGL
cannot run. The gallery uses the existing dialog overlay styles.

Version 0.3 adds app navigation, tables, optional Chart.js charts, filters, command search,
statistics, copy controls, and composed blocks. Import foundations from
`@hyalo/angular/core` and optional motion from `@hyalo/angular/motion`.

Configuration, theming, RTL, motion and the full component list are in the [repository README](https://github.com/HamedRsl/Hyalo#readme).

MIT licensed.
