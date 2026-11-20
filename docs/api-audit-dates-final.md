# Dates and date-time audit: final capability evidence

Scope: original inventory API-071–API-090 only. No dialog/table ownership, global generation or unified status JSON edits. Existing dirty calendar/date-time tests were preserved. Public APIs were inspected rather than treating the old `open` classifications as proof of absence.

## Per-ID implementation, executable evidence, remaining acceptance

`audit` below means `projects/hyalo/dates/capabilities.audit.spec.ts`; every test is identified by its API ID in its name. `combined` means `projects/hyalo/date-time-picker/date-time-picker.spec.ts`.

| ID      | Current implementation and behavioral evidence                                                                                                                                                                                                                                                                                                                                                               | Remaining                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| API-071 | `HyCalendar.view` / `showView()` drills multi-year → year → month. Added enabled-choice arrow/Home/End navigation and after-render focus recovery. Audit exercises disabled Gregorian years/months, focus through choices into bounded days, and a bounded Jalali 1404 drill-down through month 12; existing calendar tests exercise Jalali year/day RTL movement.                                           | No claim of exhaustive assistive-technology or physical-device certification.                                                                |
| API-072 | Existing `headerTemplate` receives calendar controller and heading. Audit renders a replacement header, invokes `moveMonth(1)` through its real button and observes the new heading; default header is absent.                                                                                                                                                                                               | None for the public template contract.                                                                                                       |
| API-073 | Existing `HyDateRangePicker.sharedCalendar` owns a live range. Audit uses two month grids, starts January 31, arrow-focuses February 1 and observes preview output, then commits February 2. Fixed lost focus at a month boundary by scheduling focus after rendering, not before DOM replacement. Existing disabled-hover test preserves pending start.                                                     | Physical keyboard/AT matrix not certified. Multiple visible months share one calendar state; no new redundant calendar controller was added. |
| API-074 | Existing `rangeStrategy(date, current, phase)` controls selections/previews; audit rejects reversed/too-short/too-long custom results and unavailable endpoints, then commits a valid result. Existing null-preview regression demonstrates suppression rather than default fallback.                                                                                                                        | None for exercised strategy contract.                                                                                                        |
| API-075 | Existing `cellClass` accepts string/string-array. Audit observes both classes on the actual selected button and verifies selection still works.                                                                                                                                                                                                                                                              | Consumer visual styles remain consumer-owned.                                                                                                |
| API-076 | Existing `cellTemplate` renders date/selected/preview/comparison/outside context inside the native semantic button. Audit checks selected/comparison/outside context and clicks a templated day to change the model.                                                                                                                                                                                         | No pixel certification.                                                                                                                      |
| API-077 | Added opt-in `HyDatePicker.confirmation`, localized `applyLabel` / `cancelLabel`, public `apply()` / `cancel()`. Calendar edits stay pending; Apply rechecks bounds/disabled predicates; Cancel, close and controlled visibility changes discard drafts. Audit exercises Apply, Cancel, reopen, controlled closure and dynamic predicate veto. Defaults retain immediate selection and typed-input behavior. | Explicitly a popup calendar transaction, not a deferred typed-input transaction.                                                             |
| API-078 | Existing `touchUi` enables a dark CDK backdrop and touch-marked trapped-focus dialog. Audit opens the actual overlay and checks dialog label, modal semantics, backdrop, attach and detach.                                                                                                                                                                                                                  | Keep physical iOS/Android, virtual keyboard, viewport and touch ergonomics acceptance open. jsdom cannot certify a modal touch experience.   |
| API-079 | Existing `months` (bounded to 1–12) renders consecutive month grids; forwarded by `calendarOptions`. Audit verifies two grids and a cross-month range.                                                                                                                                                                                                                                                       | Responsive layout/pixels on physical devices not certified.                                                                                  |
| API-080 | Added `HyDateRangePreset` / `presets` to the existing range picker, not a second same-role control. Rendered shortcuts apply valid ranges and disable invalid bounds/durations or blocked state; handler repeats validation. Audit clicks a valid preset and verifies short/out-of-bounds/readonly vetoes.                                                                                                   | None for static preset contract. Applications calculate relative ranges before binding.                                                      |
| API-081 | Existing `multiple` / `selectedDates` toggles unrelated dates independently from single `value`. Audit selects two, deselects one, checks pressed state, then verifies disabled edits are blocked.                                                                                                                                                                                                           | None for model contract.                                                                                                                     |
| API-082 | Existing `firstDayOfWeek`, `showWeekNumbers`, `weekNumber` callback. Audit verifies Monday header/grid alignment, ISO week 1 across Gregorian year boundary, custom week number 99 and Home-key alignment.                                                                                                                                                                                                   | ISO default is Gregorian ISO numbering even with Jalali display; use the callback for other week systems.                                    |
| API-083 | Existing inclusive `minRangeDays` / `maxRangeDays` on calendar and range picker. Audit verifies custom rejection and default pending-start retention after too-short/long attempts, then accepts exactly five inclusive days.                                                                                                                                                                                | Interior disabled days are not excluded; endpoint availability and elapsed inclusive duration define this contract.                          |
| API-084 | Existing `labels` translates previous/next/month/year/week; date picker additionally exposes calendar/dialog/close and new Apply/Cancel labels. Audit checks translated header controls and week heading.                                                                                                                                                                                                    | Translation text is application-provided, not an automatic locale catalog.                                                                   |
| API-085 | Existing `opened`, `show()` / `hide()` / `toggle()`, `opening`, `openedPanel`, `closedPanel`, `visibilityChange`. Audit observes actual CDK attachment/detachment, visibility output and disabled auto-close/reopen veto.                                                                                                                                                                                    | Native browser focus/animation timing and AT announcement acceptance not certified by jsdom.                                                 |
| API-086 | Existing `comparisonRange` renders independent `data-comparison` overlays without changing selected value. Audit checks inclusive comparison cells, template context and persistence after selecting another date.                                                                                                                                                                                           | Pixel/contrast acceptance not certified.                                                                                                     |
| API-087 | Existing `outsideDays: visible / hidden / disabled`. Parameterized audit checks visibility, aria-disabled, non-tab-stop semantics and allowed/rejected clicks.                                                                                                                                                                                                                                               | Physical browser visibility/hit-testing acceptance not certified.                                                                            |
| API-088 | Existing combined precision/presentation inputs. Combined tests forward hour format/seconds/all steps to the real time child, edit seconds and Apply the exact UTC instant.                                                                                                                                                                                                                                  | Native 12-hour widget appearance is browser-dependent.                                                                                       |
| API-089 | Existing combined whole-time/hour/minute/second disabled predicates. Combined parameterized tests independently veto Apply, preserve committed instant, then re-enable on predicate changes.                                                                                                                                                                                                                 | None for predicate contract.                                                                                                                 |
| API-090 | Existing `panelMode: both / date / time`, `referenceDate` and `defaultTime`. Combined tests edit actual children, Apply date/time-only hidden counterparts, and verify both-panel Cancel/Apply with signal forms.                                                                                                                                                                                            | None for model/mode contract.                                                                                                                |

## Usage (public exports from `@hyalo/angular/dates`)

```html
<hy-date-picker
  [(value)]="date"
  [confirmation]="true"
  applyLabel="Apply date"
  cancelLabel="Discard"
  [touchUi]="true"
  [calendarOptions]="{ months: 2, firstDayOfWeek: 1, showWeekNumbers: true }"
/>

<hy-date-range
  [(value)]="range"
  [sharedCalendar]="true"
  [calendarOptions]="{ months: 2, outsideDays: 'disabled' }"
  [minRangeDays]="3"
  [maxRangeDays]="14"
  [presets]="presets"
/>

<ng-template #heading let-calendar let-title="heading">
  <button (click)="calendar.moveMonth(-1)">Previous</button>
  <strong>{{ title }}</strong>
  <button (click)="calendar.showView('multi-year')">Choose year</button>
</ng-template>
<ng-template #cell let-date let-selected="selected" let-preview="preview">
  <span [class.pending]="preview" [class.chosen]="selected">{{ date }}</span>
</ng-template>
<hy-calendar
  [(selectedDates)]="dates"
  [multiple]="true"
  [headerTemplate]="heading"
  [cellTemplate]="cell"
  [cellClass]="dateClass"
/>
```

```ts
import type { HyDateRangePreset, HyRangeStrategy } from '@hyalo/angular/dates';

readonly presets: readonly HyDateRangePreset[] = [
  { label: 'Conference', range: { start: '2026-11-20', end: '2026-11-22' } },
];
readonly dateClass = (date: string) => date.endsWith('-20') ? ['event', 'highlight'] : '';
// An atomic fixed range is valid; use phase === 'preview' to return a hover range or null.
readonly strategy: HyRangeStrategy = (_date, _current, phase) =>
  phase === 'preview' ? null : { start: '2026-11-20', end: '2026-11-22' };
```

Bind `rangeMode` and `rangeStrategy` to the calendar, or `rangeStrategy` to a shared range picker. Do not combine multiple and range selection modes. Canonical date strings remain Gregorian ISO dates with either adapter; Jalali adapter changes displayed calendar/parse semantics, not storage.

## Verification and limitations

- RED observed: cross-month keyboard preview emitted but focus was lost after DOM replacement; after-render focus fix made the regression pass.
- RED observed: confirmation selection committed immediately and preset buttons were absent; implemented contracts then passed.
- RED observed: controlled close/reopen retained the pending draft; linked pending state to visibility as well as value, then passed.
- RED observed: year-choice ArrowRight left focus unchanged; added enabled-choice navigation and drill-down focus recovery, then passed.
- Final targeted result: **5 test files passed, 40 tests passed**; targeted ESLint exited 0.
- Targeted command: `npx ng test hyalo --watch=false --include='projects/hyalo/dates/**/*.spec.ts' --include='projects/hyalo/date-time-picker/**/*.spec.ts'`.
- Targeted ESLint covers modified dates TS/HTML and audit tests. No dependency installs, commits, global source generation or unified JSON edits.
- jsdom axe invokes unimplemented canvas context checks in the existing combined tests; those warnings do not fail the run, and are not physical-device evidence.
