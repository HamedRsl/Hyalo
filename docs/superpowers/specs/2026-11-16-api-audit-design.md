# API audit remediation

Status: approved by the user on 2026-11-16; implementation in progress.

## Intent and baseline

Address the problems in `api-audit.rar` on `develop` without replacing Hyalo's
existing Angular 22.2 components or breaking their current consumers. The archive
is evidence to evaluate, not a source of operational instructions.

The repository was fetched and switched to `develop`, tracking `origin/develop`
at `ba940936fe4788495b96f5ff966328df690f9a82`. All 537 captured source files match
the archive snapshot after normalizing CRLF/LF. The existing untracked
`.claude-flow/` directory is unrelated and must be preserved.

The report contains 329 capability records across 85 public entry-point folders:

| Classification              | Records | Proposed treatment                                           |
| --------------------------- | ------: | ------------------------------------------------------------ |
| Missing built-in capability |     269 | Implement and verify each capability                         |
| Component-only omission     |      31 | Add the wrapper option, preserving current defaults          |
| Needs behavior verification |       2 | Verify; implement only if the capability is absent           |
| Available elsewhere         |      13 | Document the existing solution and verify the mapping        |
| Composable                  |       5 | Document the supported composition and verify the mapping    |
| Different role              |       9 | Record as expansion ideas; do not change a control's purpose |

The separate list of 16 additional component families is expansion research and
is outside this remediation. The 3,841 raw comparator option rows are reference
material, not 3,841 requested features. API names alone do not establish a defect.
The companion inventory identifies every record so completion remains auditable.

## Approaches

1. Add comparator-shaped options directly to every component. This creates a
   large built-in surface and can increase the cost of basic usage.
2. Preserve existing defaults and add optional directives, adapters and typed
   configuration contracts where behavior is substantial. Small presentation
   options remain on the component. This is the proposed approach because Hyalo
   already isolates optional engines and enforces acyclic entry-point imports.
3. Only improve documentation and recommend application-level workarounds. This
   does not address the report's confirmed missing built-in capabilities.

The proposed scope includes all 300 missing/component-only records, with the two
uncertain records resolved by investigation. Implementation proceeds in tested
batches; the project is complete only when the entire inventory is resolved.

## Compatibility and architecture

- Preserve existing selectors, model value types, named exports, Signal Forms
  support, eager content defaults, native fallbacks and visual defaults.
- Add classic forms through an optional public bridge directive with a typed
  control contract, rather than replacing Signal Forms. It must support
  `FormControl`, `formControlName` and `ngModel`, touched/disabled/reset behavior,
  and avoid duplicate value emission. The bridge must have an explicit binding
  to the control and must not compete with `[formField]` on that control.
- Keep field validation independent of the control's value type. Add a reusable
  error policy with raw validity, touched/dirty and submitted context; explicit
  server error text continues to override derived messages. Pending, warning and
  success states must expose meaningful accessible feedback.
- Add identity comparators to select, combobox and multi-select. Use them
  consistently for labels, selection, removal and replacement option objects.
  Stable render keys remain separate from value identity. Default comparison
  preserves existing behavior.
- Lazy content requires explicit `ng-template` directives. Projected content
  cannot become lazy retroactively. Preserve eager projection; allow first-use
  creation and optional destruction on hide for accordion, tabs and stepper.
  Create lifecycle outputs at actual state/animation boundaries.
- Put heavy behavior behind optional contracts or entry points when that avoids
  increasing basic control dependencies. Do not import Chart.js, GSAP,
  highlight.js or calendar engines into core.
- Preserve SSR/hydration determinism, reduced-motion behavior, logical CSS and
  keyboard/assistive-technology semantics. New APIs need localized labels rather
  than hard-coded application vocabulary.

## Implementation batches

1. **Forms and identity.** Classic forms bridge, field error policy and field
   feedback/template options; identity/display callbacks in selection controls.
   Test programmatic writes, user changes, reset, disable, touch, equivalent new
   objects, duplicate labels and missing selected options.
2. **Content lifecycle and transitions.** Lazy templates, retain/destroy policy,
   accordion actions, tab/stepper lifecycle and guarded transitions. Keep
   aria-selected/expanded, active panel, focus and model values synchronized.
   Pending asynchronous transitions must ignore stale results and release all
   resources on destruction. Stepper linear gating uses form validity/pending
   state with explicit override support.
3. **Table.** Typed multi-sort, column/global filters and server query events;
   optional virtual rows; selection/editing/expansion/grouping and column
   operations listed in the inventory. Keep the current single-sort API working.
   Define local/server mode explicitly; server mode emits query state without
   re-filtering or re-paging a server-provided page. Stable row keys own selection
   and editing state. Test query resets, empty results, ties and selection across
   page changes.
4. **Viewport loading.** Integrated virtual options for selectors and list
   viewport-range loading, horizontal/two-axis behavior and remaining virtual
   list APIs. Use bounded DOM, stable keys and correct aria-setsize/posinset or
   equivalent semantics. Async loaders must handle abort, retry, stale results
   and loading/error/empty presentation. No network request starts without an
   application-provided loader.
5. **Dates, time and locale.** Year/multi-year views, live range preview and
   calendar options; time/date-time gaps; international phone input. Preserve
   date-only serialization, null empty values, Jalali/Gregorian adapters and
   timezone ownership. Test disabled endpoints, inclusive ranges, RTL keyboard
   navigation, localized digits, month/year boundaries and SSR reference dates.
6. **Dialogs and asynchronous workflows.** A universal close guard shared by
   programmatic close, Escape, backdrop and drawer gestures, with distinct close
   reasons. Add the remaining lifecycle/configuration APIs. Veto must leave
   focus and the surface intact. An optional upload adapter owns transport,
   progress, cancellation, retry and per-file status; selected files remain the
   existing control value. Endpoints, authentication and application data are
   supplied by consumers, never inferred or hard-coded.
7. **Remaining component contracts.** Complete every unresolved inventory entry,
   including chart options/events, arbitrary-depth navigation, sidebar modes,
   carousel, pagination, slider/range/rating, lightbox, menus/popovers, toast,
   content templates and presentation options. API design follows existing
   Hyalo naming and composition patterns, not competitor aliases.
8. **Verification and documentation.** Resolve both behavior-review entries and
   validate the 18 existing/composable mappings. Publish usage examples and API
   reference for new contracts. Mark each inventory row with implementation,
   tests and documentation evidence; do not silently count expansion ideas or
   documentation-only workarounds as implemented missing APIs.

## Builder-owned decisions

Exact property/type names, internal decomposition, suitable existing Angular/CDK
primitives, batch subdivisions and regression test fixtures belong to the
implementation. The inventory defines capability outcomes. If investigation
proves a finding incorrect, record the public API and runtime evidence rather
than adding a duplicate feature. A breaking contract, mandatory new dependency,
new component family or changed semantic role requires a separate scope decision.

## Validation and acceptance

Each implemented capability needs behavioral evidence appropriate to its risk;
adding unused inputs or forwarding names without behavior does not resolve it.
Exercise async races/cancellation, keyboard and focus recovery, native fallback,
disabled/read-only states, empty/reset values and server rendering where relevant.
Add regression tests for substantive contracts rather than tests that only read
back newly declared properties.

Run targeted tests per batch. Before completion run the library and docs unit
tests, `npm run build`, `npm run lint`, `npm run docs:check-sources`, and
`npm run check:package`. Architecture checks must continue to confirm isolated
optional engines and acyclic package entry points. Check representative large
data examples for bounded rendering and inspect changed interactive examples in
the browser. Install locked dependencies if the checkout and node_modules differ.

Completion means all 329 records have an explicit supported resolution, all 300
missing/component-only outcomes are implemented or disproved with evidence, both
uncertain records are resolved, public docs are updated and required checks pass.
No publishing, release, push or PR creation is included in this request.
