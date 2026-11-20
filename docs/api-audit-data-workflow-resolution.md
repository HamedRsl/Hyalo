# Data and workflow audit evidence

Scope: focused P1 verification of dates, dialog, file-upload, table and virtual-list.
This is a tested remediation batch, **not completion of the API inventory**. Existing
implementations were substantial; passing characterization tests below establish
specific behavior rather than implying every surrounding option is complete.

## Capability ledger

| ID | Result in this batch | Implementation and runtime evidence |
| --- | --- | --- |
| API-071 | Partial; bounded drill-down regression fixed | `dates/calendar.ts`: choosing a partially available month now clamps the active date to min/max. `calendar.spec.ts` clicks year → month → day views, checks disabled months and the in-bounds tab stop. Full year-view keyboard/focus and Jalali boundary matrix remain open. |
| API-073 | Partial; live preview verified | Existing disabled-endpoint test checks inclusive preview and commit while preserving a pending start. New custom-strategy test caught null preview incorrectly falling back to default range; fixed in `calendar.ts`. Keyboard-driven preview and multiple-calendar synchronization remain unverified. |
| API-074 | Partial; null preview semantics fixed | `rangeStrategy` returning null now suppresses preview, rather than invoking the default strategy. Regression failed with three preview cells, then passed with none. Full custom-selection strategy coverage remains open. |
| API-098 | Partial; event routes verified and scroll defect fixed | `dialog.spec.ts` drives programmatic/action/Escape/backdrop/navigation/window-scroll vetoes and asserts the same connected surface and focus. Window scroll previously threw when passed to Node.contains; `open-surface.ts` now uses the container document's Node constructor before containment checks. Actual drawer gesture-veto animation/focus integration remains open. |
| API-110 | Existing async guard behavior verified at ref/service boundary | Tests cover concurrent-attempt rejection, ignored approval after external disposal, rejection reporting without closing, and a later successful retry. Gesture reason is exercised through requestClose, not a physical pointer gesture. Raw CDK disposal intentionally bypasses Hyalo's normal close guard. |
| API-114 | Existing transport core verified; full workflow UI not signed off | `file-upload.spec.ts` exercises consumer uploader progress, AbortSignal cancellation, stale progress/result suppression after retry, failure and retry success, destruction abort, and unchanged File[] value. No endpoint or transport dependency added. Built-in progress/status/retry UI is not established by these tests. |
| API-273 | Multi-sort regression fixed | `table.ts` now retains a sort column's priority when its direction changes. Test originally observed cost/name instead of name/cost; now verifies query order, actual sorted rows and caller-array preservation. |
| API-274 | Local filtering verified | `table.spec.ts` combines global case-insensitive search with a custom column predicate, page reset and empty-state DOM. Existing scrolled-virtual filtering regression retained and expanded to 10,002 rows. Advanced filter UI/operators are not certified. |
| API-275 | Server protocol verified; page row accessibility fixed | Test supplies a server page with deliberately nonmatching filters/search and reverse sort: rows remain untouched, total/query events are correct, search resets page, and stable-key selection survives page replacement. `table.html` adds page offset to aria-rowindex (third two-row page begins at 6, not 2). |
| API-276 | Bounded fixed-row virtualization verified | Large-data test renders two data rows in a 96px viewport, exposes absolute row index and still renders the matching row after filtering. Variable-height expanded/grouped/frozen row interaction and real browser geometry remain open. |
| API-324 | Existing horizontal/grid range behavior verified, partial acceptance | New `virtual-list/audit.spec.ts` uses 10,000 items, scrolls to the last item, bounds mounted DOM and checks aria-posinset. RTL horizontal scrolling, focus behavior on both axes, resize geometry and invalid numeric configuration remain open. |
| API-325 | SSR request defect fixed; async lifecycle verified, partial acceptance | `virtual-list.ts` now gates automatic loading and retry on browser platform. Test failed because SSR invoked the consumer loader, then passed. Tests verify replaced-request abort, stale failure suppression, current error, retry, success and destruction abort. Loading/error/empty content presentation and two-axis loader granularity remain open. |

## Supported usage contracts

- **Table:** opt in to `sortMode="multiple"` and bind `sorts`; array order is sort
  priority. `setFilter(columnId, value)` and `setSearch(text)` reset page to one.
  `mode="server"` emits `queryChange` but does not locally filter, sort or page
  `data`; consumers own requests, race cancellation and the supplied `total`.
  `virtual`, `rowHeight`, `overscan` and `initialCount` provide fixed-row windows.
- **Calendar:** `showView('multi-year')` and `showView('year')` expose drill-down
  views. Supply `referenceDate` for deterministic SSR. With `rangeMode`, listen to
  `rangePreview` for inclusive provisional ranges and bind `range` for commits.
  `rangeStrategy(date, current, phase)` may return null to suppress a preview.
- **Dialog:** `closeGuard(attempt)` receives result and a distinct close reason;
  false/rejection keeps the surface open. `requestClose` returns whether an
  attempt was approved; a pending guard rejects duplicate attempts. Use Hyalo
  refs/registry for guarded closes, not raw CDK teardown.
- **Upload:** provide `uploader(file, {signal, progress})`; call `upload(file)` or
  `upload()` explicitly. Call `cancel(file)` to abort; call `upload(file)` again
  to retry. Read `state(file)` / `states` and lifecycle outputs. Selected files
  remain the control value, not server responses. Applications own endpoints,
  credentials and progress/status UI.
- **Virtual list:** `orientation` supports vertical, horizontal and grid;
  `columnWidth` and `columnCount` configure grid geometry. Supply `loadRange`
  only when viewport loading is needed; it receives an exclusive-end range and
  AbortSignal. It must honor cancellation and own data updates. `loading`,
  `error`, `loadError` and `retry()` expose workflow state. SSR does not invoke
  the loader. `appendOnly`/`virtual=false` deliberately relax bounded rendering.

## P2 continuation - exact acceptance boundaries

The inventory's `missing` labels are discovery snapshots: many APIs already exist.
Passing characterization below is not a new feature or a fabricated RED. New fixes
were preceded by observed failing regressions. No unused configuration was added.

| ID | Result | Evidence / remaining acceptance |
| --- | --- | --- |
| API-088 | Existing contract verified | `date-time-picker.spec.ts` passes hour format, seconds and all steps into the actual child, edits seconds and applies the exact UTC instant. Native 12-hour browser presentation remains browser-dependent. |
| API-089 | Existing contract verified | Parameterized tests independently veto whole-time/hour/minute/second predicates, disable Apply, preserve committed values and re-enable when predicates change. |
| API-090 | Existing contract verified | Date-only uses `defaultTime`; time-only uses `referenceDate`; actual child changes + Apply produce the configured instant. Both-panel transaction already covered. |
| API-115 | Existing adapter verified | Prior transport regression uses the consumer uploader and its AbortSignal/progress callbacks. No built-in HTTP endpoint promised. |
| API-116 | Existing contract verified | Native file change → async transform → accept validation; replaced preparation aborts and stale completion cannot replace the latest transformed file. |
| API-117 | Existing contract verified | Prior status/progress/retry regression plus removal test clearing per-file state. |
| API-118 | Partial | Prior transport regression verifies state, not every lifecycle output payload/order. |
| API-119 | Partial | `webkitdirectory` attribute verified; actual directory chooser/drop traversal requires browser/device testing. |
| API-120 | Existing preview hook verified | Async preview URL reaches rendered image with the file name as alt text. URL lifecycle/security policy remains application-owned. |
| API-121 | Existing contract verified | Async removal veto preserves file; approval removes it; download rejection emits exact `actionFailed` payload. |
| API-122 | Open | File/toolbar/empty TemplateRef inputs exist, but their consumer template contexts are not exercised in this continuation. |
| API-123 | Partial | Custom remove text/accessible name verified. Full translated status/error catalogue not signed off. |
| API-277 | Existing paging API verified | `workflow.spec.ts` binds page two and page size one, asserts supplied row and absolute DOM index. A built-in paginator control is not provided. |
| API-278 | Partial | Frozen start-column offsets respond to widths/reorder. Sticky geometry/frozen rows under real scrolling remain open. |
| API-279 | Existing contract verified | Actual viewport max block size and table min inline size reflect inputs. |
| API-280 | Existing resize contract verified | Native range input changes column width; programmatic resize honors minWidth. Pointer-edge dragging is not offered. |
| API-281 | Partial | `moveColumn` updates actual rendered header order, frozen offsets and exported order; draggable attribute verified. Physical drag/drop remains open. |
| API-282 | Partial | `moveRow` emits reordered copy, leaves frozen caller array intact, ignores unknown keys/noninteger indices. Physical drag/drop remains open. |
| API-283 | Existing contract verified | Native expansion button mounts/unmounts consumer detail template, updates aria-expanded and supplies row context. Variable-height virtualization integration remains open under API-276. |
| API-284 | Regression fixed; partial | Group template previously received all page rows (`A:3/B:3`); now receives actual group members (`A:2/B:1`). Group membership is indexed once per view, not scanned per rendered cell. Noncontiguous input is not automatically regrouped; consumers supply group-contiguous order. Virtual group headers remain open. |
| API-285 | Existing lifecycle verified, partial | Start/commit/cancel payloads and reset verified; commit does not mutate consumer data. Consumer editTemplate rendering/validation remains open. |
| API-286 | Existing contract verified | Shift range skips nonselectable rows; single selection replaces previous selection. |
| API-287 | Existing contract verified | Conditional row predicate rejects direct and range selection. |
| API-288 | Existing context-selection contract verified | Actual contextmenu DOM event updates `contextRow` and emits row/original event without silently changing checkbox selection. Consumer owns menu UI. |
| API-289 | Existing CSV contract verified | Filtered/all/selected scopes, ordered headers, commas, quotes, newlines and CRLF records tested. Server mode exports only supplied rows; download/file format and spreadsheet formula sanitization remain consumer-owned. |
| API-290 | Two aliasing regressions fixed | Saving previously shared filter map/sort objects; restoring shared all collections. Tests mutate saved/restored input collections and verify live filter results, selection, width and sort remain unchanged. Copies are shallow for opaque custom filter values; storage/versioning remains consumer-owned. |
| API-291 | Existing contract partly verified | Multilevel header colspan and footer row context rendered; complex rowspan accessibility and per-column `footer` option remain unverified. |
| API-292 | Open | Template inputs exist, but custom loading/empty templates are not exercised. Prior default empty/loading DOM regression remains green. |
| API-293 | Partial | Existing actions emitted from API methods; exhaustive action payload/order matrix remains open. |
| API-294 | Partial | Existing default sort cycle covered; custom cycle policy remains unverified. |
| API-325 | Two deferred cancellation regressions fixed | Initial load and retry queued just before destruction previously still invoked consumer callback with an aborted signal. Both tests observed a callback, now observe none. Existing SSR/no-load, race, retry/error tests remain green. Two-axis granularity/presentation remain open. |

Unchanged open dates IDs: API-072, API-075–087 (custom header/cells,
transaction/touch/multi-month/presets/multiselect/week/duration/translations/popup/
comparison/outside-days) were **not independently accepted** here. Several have
API surfaces, but dedicated date-only Apply/Cancel and preset-range APIs were not
established by the inspected sources; this ledger does not claim they exist.
Unchanged open dialog IDs: API-094–097, API-099–109 have no new per-ID runtime
acceptance in this continuation;
API-098/110 evidence above remains bounded to the listed routes and service/ref
boundary. API-071/073/074/276/324 retain their earlier explicitly listed gaps.

## Verification and limits

Executed before edits: scoped Angular test run passed **9 files / 38 tests**.
After fixes: same six owned entry points passed **10 files / 51 tests**.
Scoped ESLint across their TypeScript and HTML passed with exit code 0.

```sh
npx ng test hyalo --watch=false --include='projects/hyalo/{dates,date-time-picker,dialog,file-upload,table,virtual-list}/**/*.spec.ts'
npx eslint 'projects/hyalo/{dates,date-time-picker,dialog,file-upload,table,virtual-list}/**/*.{ts,html}'
```

Continuation verification: **11 files / 71 tests passed**, including the new
`table/workflow.spec.ts`. Scoped ESLint across all six entry points passed with
exit code 0. New RED→GREEN cases: grouped template membership, state save aliasing,
state restore aliasing, deferred initial loader and deferred retry after destroy.
Existing-contract tests were explicitly retained as characterization, not described
as missing implementations.

Angular/Vitest/jsdom emitted existing canvas getContext notices during axe tests;
no dependency was added to suppress them. The server-platform test verifies the
SSR branch under TestBed, not a full server-render/hydration browser session.
Date-time-picker API-088–090 now have the individual continuation evidence above.
Remaining owned P2 capabilities not accepted by a specific row stay open. No
global source sync, dependency changes, commit, package build or full-repository
acceptance gates were run by this worker.
