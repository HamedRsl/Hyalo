# Phase 4: advanced forms

Implemented on `develop` from `origin/main` at `fc3a9b6`. Package version: 0.4.0.

## Scope

All 14 roadmap families have public controls and live, copyable documentation:

| Family                                 | Entry points                    |
| -------------------------------------- | ------------------------------- |
| Gregorian/Jalali date picker and range | `/dates`                        |
| Time picker and slots                  | `/time-picker`                  |
| Combobox                               | `/combobox`                     |
| Multi-select                           | `/multi-select`                 |
| Search field                           | `/search-field`                 |
| Number input                           | `/number-input`                 |
| Password                               | `/password`                     |
| OTP/PIN                                | `/otp`                          |
| Masked and Iranian phone input         | `/masked-input`, `/phone-input` |
| Slider and range slider                | `/slider`, `/range-slider`      |
| File upload/dropzone                   | `/file-upload`                  |
| Rating                                 | `/rating`                       |
| Selectable radio and checkbox cards    | `/selectable-card`              |
| Inline editable text                   | `/inline-edit`                  |

`HyAuthBlock`, `HyBookingBlock`, and `HySettingsBlock` live in `/blocks`.
Open `/advanced-forms` for these compositions. Dashboard editors reuse the existing
correlated clause schema, including array and absolute-range variants.

## Form and locale contracts

Controls extend the existing `hy-field` metadata contract and implement
`FormValueControl` or `FormCheckboxControl`. The shared field metadata is independent
of value type. New scalar number/date/range/combobox controls use `null` for empty
values, strings use `''`, and collections use empty arrays. Angular 22.2 removes
undefined fields from its field tree, so clearing must not emit undefined.

Use `FormField` for Signal Forms. For existing typed Reactive Forms:

```ts
readonly phone = new FormControl('', { nonNullable: true });
readonly fields = compatForm(signal({ phone: this.phone }));
// <hy-phone-input [formField]="fields.phone" />
```

Import `compatForm` from `@angular/forms/signals/compat`. Direct `[formControl]`
is not promised by these custom controls. The bridge is exercised for value,
reset, touched, and disabled behavior.

Persian and Eastern Arabic digits normalize without converting identifiers to
numbers. OTP keeps leading zeros and supports composition, full-code paste, and
native one-time-code autofill. Masks preserve caret position and delete digits
across separators. Number parsing uses locale-specific decimal/group separators,
strict grouping, and finite values; malformed drafts do not submit stale amounts.
Hosts supply business validators, including limits, identifier rules, and async validation.
Date and number controls expose `validationError()` and `validationChange` for
parse/availability failures and set native custom validity. Connect the output to
a host signal used by Angular's `validate()` rule; optional null values alone do
not make a Signal Forms field invalid. The live Number input example demonstrates
this bridge. `validationMessage` can localize the control's parsing feedback.

## Date and time semantics

`HyDateAdapter<D>` owns parsing, comparison, serialization, month boundaries, and
calendar arithmetic. Built-in adapters serialize Gregorian `YYYY-MM-DD` date-only
strings. They never infer a timezone from a date-only value.

The Jalali adapter uses `jalaali-js` conversion and explicit UTC epoch-day arithmetic.
It supports Jalali years 1200 through 1600 (1821-03-21 through 2222-03-20).
Tests check every supported month end and leap year against that trusted contract,
plus known conversion fixtures. Intl supplies localized presentation; canonical
date parts are substituted so ICU leap-year choices cannot change displayed dates.
Gregorian support spans years 1000 through 2999.

Install `jalaali-js` when importing `/dates` or the transactional `/blocks` exports:
`npm install jalaali-js`. It is an optional package peer, isolated from basic
controls. Full-range checks found an ICU/Borkowski difference at Jalali 1502 in this
runtime, so conversion does not rely on Intl.

Calendar keys: day/week arrows, RTL day reversal, Home/End, Page Up/Down for months,
and Shift+Page Up/Down for years. The picker traps focus while open, dismisses with
Escape/outside activation, and returns focus on explicit dismissal. Ranges publish
only complete ordered endpoint pairs. An unfinished range remains a local draft.
Use reset() to discard an unfinished draft if the published value is already null.

Supply a deterministic `referenceDate` for SSR. The default is 2026-01-01;
a host clock should supply today's date consistently on server and client.

Range endpoint dates are inclusive. Dashboard timestamp filters convert them to
start-inclusive/end-exclusive UTC instants, adding a calendar day to the end.
The demo reference clock is 2026-11-16T12:00:00Z. Preset filters retain their rolling
day behavior. Editor changes preserve clause IDs and the existing persisted schema.

Time controls store local `HH:mm` wall times. Booking blocks pass an IANA timezone,
defaulting to Asia/Tehran. Applications must resolve DST gaps/overlaps, server
availability, and final instants before confirming a booking.

## Selection, uploads, and actions

Combobox/multi-select use Angular Aria and CDK positioning. Remote loaders receive
an AbortSignal; stale requests cancel, and loading, empty, failure/retry states remain
distinct from selection. Selected metadata survives query changes. Object-valued
options require stable keys. Provide metadata through options for initially selected
remote values, because a value alone cannot supply its accessible label.

Uploads validate type, byte size, and count locally and keep File objects in memory.
The host owns transfer, content validation, storage, and access. Blocks emit requested
values and accept pending/error state; they do not authenticate, charge, persist,
upload, or confirm availability.

## Motion and materials

Forms retain the existing type, spacing, surface, and focus tokens. Composite
controls own their surfaces; disabled descendants do not dim the whole group.
Frequent keyboard actions, filtering, OTP typing, and slider tracking stay immediate.
No GSAP, Three.js, or other animation engine was added to these entry points.

Rejected motion candidates: calendar month choreography, staggered search results,
OTP digit entrances, and trailing slider tweens. Each would delay frequent functional
interaction. Existing color feedback remains under the quick-duration token.
Native input behavior handles pointer cancellation and platform keyboard controls.

## Verification and limits

Final checks passed: 240 library tests, 10 docs tests, workspace lint, production
library/docs builds, 79 prerendered routes, 80 compiled standalone examples, and
the packed-package consumer size build. All 80 package entry points are acyclic,
with generated exports and optional-dependency isolation verified.

Chromium axe checks found no WCAG A/AA violations in the 14 new component pages.
All 14 fit a 375px viewport without horizontal overflow. Targeted dark RTL checks
covered dates, localized numbers, and multi-select; the calendar dialog, reduced
motion, forced colors, and landscape layout were also exercised. Calendar keyboard
selection and booking submission were verified in the browser.

Tests cover independent calendar conversion/leap boundaries, invalid parsing,
month clamping, RTL keys, date availability, locale digits, composition, mask deletion,
async request cancellation, selected labels/chips, file restrictions, forms metadata,
typed Reactive Forms interoperability, inline save/cancel, and reset behavior.

Production builds prerender the documentation. Package checks validate acyclic entry
points, generated exports, and optional-engine isolation. Copyable demos are generated
from live templates and compiled separately.

Browser checks use Chromium on this host. Light/dark, RTL/Persian, reduced motion,
forced colors, 375px layout, overlays, focus, and hydration are checked within that
scope. This is not a complete screen-reader audit, a Safari/Firefox/device test matrix,
or a measured GPU/frame-rate guarantee.
