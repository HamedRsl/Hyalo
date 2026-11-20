# Feedback, status and timeline audit resolution

Scoped ledger against `superpowers/specs/2026-11-16-api-audit-inventory.md`.
This is not a completion claim for the full audit. Runtime evidence below is
Angular unit-test DOM evidence, not browser screenshot or layout certification.
No global documentation source generator was run.

## Capability ledger

### Follow-up superseding initial status rows

The primitive continuation added `HyResultState` with illustration slots
(API-263), circular progress segment gaps (API-209), and semantic timeline
reversal (API-315). Their component regression suites passed in the integrated
680-test library snapshot. Skeleton radius, stat loading composition and progress
label-template context also have dedicated continuation regressions. The initial
rows below are retained as audit history, not current missing-feature claims.
Browser geometry, SVG pixel rendering and assistive-technology acceptance remain
open. Consult the actual component specs and primitive ledger for that evidence.

| ID      | Status                                               | Implementation / evidence / remaining limitation                                                                                                                                                                                  |
| ------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API-126 | Different-role expansion, not implemented as a knob  | `gauge/gauge.ts` remains a read-only meter; `gauge.spec.ts` verifies measurements. Editing belongs to an input control, not this display.                                                                                         |
| API-157 | Implemented                                          | `meter/meter.ts`: optional low/high/optimum, normalized thresholds, quality metadata and localized quality labels; `meter.spec.ts` checks low-optimum quality changes and explicit valueText precedence.                          |
| API-158 | Different-role mapping documented                    | Existing `HyMeterGroup` in `meter/segmented.ts` is the distinct contribution display; not forced into `HyMeter`. Existing `segmented.spec.ts` verifies grouped values.                                                            |
| API-209 | Partial                                              | `progress`: success overlay on bar/circle and bar segment separators; regression checks rendered success width. Circle segment gaps are not implemented. Distinct workflow steps already live in `HySegmentedProgress`.           |
| API-210 | Implemented, browser visual review pending           | `progress`: size, thickness and linecap drive actual host/SVG geometry; stroke is bounded and radius avoids clipping. Regression checks SVG attributes and normalized custom bounds.                                              |
| API-211 | Implemented                                          | `showLabel` and typed `labelTemplate` with value/percent context in `progress.html`; default label DOM regression. Template rendering is implemented but not separately exercised in this batch.                                  |
| API-212 | Implemented                                          | Spinner forwards thickness/duration to progress; host size changes; regression verifies actual SVG stroke and animation timing CSS variable.                                                                                      |
| API-213 | Implemented directly                                 | `min`/`max` use shared measurement normalization, ARIA retains raw clamped value and fill uses fraction; regression checks 20..60 range and invalid bounds.                                                                       |
| API-252 | Existing composition, not new preset                 | Compose `HySkeleton` shapes inside `HySkeletonRegion`, place aria-busy on the real loading region. Existing skeleton tests run; no dedicated structured preset introduced.                                                        |
| API-253 | Existing wrapper option verified by source           | `HySkeleton.radius` binds inline border-radius. Existing skeleton suite runs; no new dedicated radius regression in this batch.                                                                                                   |
| API-261 | Implemented                                          | `HyStat.valueTemplate` replaces ticker, typed context includes raw value and formatted text; `stat.spec.ts` exercises custom content and absence of ticker.                                                                       |
| API-262 | Composition documented, dedicated regression pending | Switch between a skeleton region and stat in application template; keep aria-busy on containing region. No integrated loading input added.                                                                                        |
| API-263 | Open                                                 | Current error/loading state wrappers support compact/liveness and retry, but general result variants and dedicated illustration slots have not been added.                                                                        |
| API-313 | Partial                                              | Existing horizontal/start/end preserved; alternate layout added. Template regression checks config. Horizontal alternate/end-side combinations still need browser review.                                                         |
| API-314 | Implemented, visual review pending                   | Typed per-item marker/opposite TemplateRefs; runtime regression renders supplied marker and opposite text with item context.                                                                                                      |
| API-315 | Partial                                              | Pending listitem and CSS visual reverse supported/tested. DOM and assistive-technology reading order remain original projection order; reverse is explicitly visual, not a semantic data reorder.                                 |
| API-316 | Implemented, visual review pending                   | Per-item side and dotColor drive host/CSS metadata; runtime regression checks side and marker composition.                                                                                                                        |
| API-317 | Implemented for four corners and fluid width         | Channel position top/bottom + logical start/end; width capped by viewport. Regression checks top placement and normalized CSS width. No arbitrary breakpoint configuration or center positions.                                   |
| API-318 | Implemented                                          | Named cached channel service instances with independent overlays, queues, timers, pause holds, limits and dismissal; regression verifies isolation.                                                                               |
| API-319 | Implemented                                          | Per-channel maxVisible (finite integer >=1) and duplicates allow/ignore; duplicate identity is message/title/tone, returns existing ref. Regression verifies independent limits and duplicate refs.                               |
| API-320 | Implemented                                          | Typed TemplateRef context exposes toast plus dismiss; plain text message remains required as accessible fallback. Runtime regression exercises custom template and dismiss callback.                                              |
| API-321 | Implemented                                          | Ref.closed resolves once after removal with dismiss/timeout/action/swipe/overflow/destroy/server reason; action and timeout regression plus delayed close regression. Async action-return payloads are not part of this contract. |
| API-322 | Implemented                                          | Per-toast off/polite/assertive and announcementText override; original danger assertive default preserved. Runtime regression verifies off and existing defaults.                                                                 |
| API-323 | Implemented                                          | Opt-in dismissOnClick excludes nested interactive controls, Enter works on focusable toast; contentClass applies to text wrapper. Regression verifies content click dismissal.                                                    |
| API-324 | Outside owned virtual-scroller scope                 | Inventory refers to virtual-list. Existing `HyVirtualScroller` stays bounded; no claim for two-axis virtualization.                                                                                                               |
| API-325 | Outside owned virtual-scroller scope                 | virtual-list loading ownership remains separate.                                                                                                                                                                                  |
| API-326 | Outside owned virtual-scroller scope                 | No new rendered-range API on virtual-scroller.                                                                                                                                                                                    |
| API-327 | Mapping pending                                      | Existing loading placeholder composition not newly certified here.                                                                                                                                                                |
| API-328 | Outside owned virtual-scroller scope                 | No new pixel/alignment controller added.                                                                                                                                                                                          |
| API-329 | Outside owned virtual-scroller scope                 | No append-only/bypass mode added.                                                                                                                                                                                                 |

## Usage and compatibility

```ts
const uploads = toaster.channel('uploads', {
  position: 'top-start',
  width: '28rem',
  maxVisible: 2,
  duplicates: 'ignore',
});
const ref = uploads.show({
  message: 'Upload complete',
  tone: 'success',
  announcement: 'polite',
});
const reason = await ref.closed;
```

Channels are scoped to the injected toaster and retain configuration from first
access. Existing `show`, `success`, `error`, `dismissAll`, default bottom-end
placement, four-visible limit, hover/focus holds and action persistence remain.
A channel's dismissAll affects only that channel. All channels share the CDK
announcer (simultaneous announcements follow CDK policy, not a new speech queue).
Template notifications use `let-toast` and `let-dismiss="dismiss"`; keep a text
message even when supplying rich markup. No HTML-string bypass is introduced.
Provide translated announcementText and qualityLabels in application locale.

```html
<hy-progress
  label="Upload"
  [value]="30"
  [min]="20"
  [max]="60"
  variant="circle"
  size="5rem"
  [thickness]="8"
  linecap="butt"
/>
<hy-meter label="CPU" [value]="85" [low]="20" [high]="80" [optimum]="10" />
<hy-timeline pending="Waiting" reverse>
  <hy-timeline-item
    heading="Saved"
    side="end"
    dotColor="var(--hy-success)"
    [markerTemplate]="marker"
    [oppositeTemplate]="opposite"
  />
</hy-timeline>
<ng-template #marker let-item>✓</ng-template>
<ng-template #opposite>Yesterday</ng-template>
```

Progress defaults remain a 0..100 bar (0.5rem height), circle stroke 3, and spinner
1.5rem/1000ms. Segments currently apply to bars only. Success is an absolute value
in the same bounds and is capped at total progress. Null stays indeterminate.
Timeline reverse changes visual order only: reverse your source data instead when
semantic/keyboard reading order must also reverse. Custom markers are decorative;
put meaningful status wording in the heading/content/opposite text.

## Verification

New behavior was written as regressions first and observed failing before the
corresponding implementation (missing typed APIs or missing rendered behavior).
Scoped command:

```sh
npx ng test hyalo --watch=false --include='projects/hyalo/{toast,timeline,progress,meter,skeleton,stat,state,gauge,virtual-scroller}/**/*.spec.ts'
npx eslint 'projects/hyalo/{toast,timeline,progress,meter,skeleton,stat,state,gauge,virtual-scroller}/**/*.{ts,html}'
```

Final scoped verification: **11 test files, 33 tests passed**; scoped ESLint
finished with exit code 0 and no diagnostics. No repository-wide build,
consumer-package, full lint or browser certification is asserted by this ledger.
