# Core policy-default / Select / Popover final scoped audit

## Verification

Executed against the shared working tree without changing the unified status JSON, dependencies, generated docs or application-scoped IDs:

```sh
npx ng test hyalo --watch=false --include='projects/hyalo/select/*.spec.ts' --include='projects/hyalo/popover/*.spec.ts' --include='projects/hyalo/core/**/*.spec.ts' --include='projects/hyalo/src/lib/core/config.spec.ts'
```

Result: **13 files, 40 tests passed**. Scoped ESLint on all ten changed/new TypeScript files passed. Prettier was run on those files. Existing native selection replay buffering and application-scoped ID implementation are preserved. No browser/device or OS-picker acceptance is claimed.

Red evidence: nullable option DOM exposed `aria-disabled="false"`; configured select defaults remained `true`; loader dismissal left its consumer AbortSignal un-aborted. These runtime regressions failed before their fixes. New tooltip and popover inputs/controller contracts first failed compilation because the public APIs were absent. Other new tests are passing characterization of already-supported APIs, not invented missing features.

## Per-ID ledger

Paths below are relative to `projects/hyalo/` unless prefixed with `docs/`.

| ID | Outcome | Behavioral evidence / remaining work |
| --- | --- | --- |
| API-070 | Implemented and verified for explicitly supported families | `core/lib/core/config.ts` exports typed `HyComponentPolicies` through existing core exports. `select/config.policies.spec.ts` exercises real nested providers, per-property/family merge, inherited select/tooltip behavior and sibling/root isolation. `select/select.policies.audit.spec.ts` proves explicit input precedence. This is not a blanket claim that every component has injectable behavioral defaults. |
| API-201 | Implemented and verified | `popover/tooltip.ts` exposes independent `tooltipHideDelay` (120 ms default). `popover/tooltip.policies.spec.ts` checks deferred dismissal, reentry cancellation, actual panel state and destruction. Focusout/Escape still bypass delay. |
| API-202 | Partial | `tooltipTouch: 'ignore' \| 'show'` is configurable; opted-in synthetic touch opens the actual overlay. Keyboard focus behavior remains covered in `popover/popover.spec.ts`. Custom pointer-position / alternate tooltip origin is not implemented; real touch-device acceptance remains open. |
| API-203 | Implemented and verified | `tooltipPanelClass` accepts string or array and applies to the CDK pane; `tooltip.policies.spec.ts` finds actual tooltip under `.consumer-tip`. Class is read at initial overlay creation; live class replacement is not promised. |
| API-204 | Supported elsewhere, verified with distinct semantics | `popoverContext` is passed to `TemplatePortal`; `popover/popover.policies.spec.ts` renders the consumer's implicit context. Use `hyPopover` for rich/interacting content. It remains a named dialog, not a text-tooltip semantic equivalent; simple tooltip retains AriaDescriber. |
| API-205 | Implemented bounded configuration; verified | `popoverTrigger: 'click' \| 'manual'` and `popoverAutoClose` boolean. Policy spec proves click suppression in manual mode and Escape suppression when auto-close is false; existing tests prove default Escape/focus restoration. Independent per-dismissal-reason switches and hover triggers are not offered. |
| API-206 | Open beyond existing placement | Existing `popoverPlacement`, collision fallback and resize repositioning remain; `popover.spec.ts` exercises reposition update scheduling/cleanup. No custom container/anchor/offset public API added. Browser collision geometry not certified. |
| API-207 | Implemented and verified | `popoverShowDelay`, `popoverHideDelay`, `show()`, `hide()`; policy test proves delayed state, pending hide cancellation by show and destruction cleanup. Existing `close()` is immediate, including dismissal paths. Direct `popoverOpen` model writes also remain immediate. |
| API-208 | Open | No public post-transition lifecycle outputs. Existing presence/timeout behavior must not be relabeled as lifecycle acceptance; reduced-motion and canceled-transition output semantics still need design and tests. |
| API-232 | Existing API characterized | `select/select.contracts.audit.spec.ts` uses duplicate labels, equivalent selected object and replacement object instances; actual trigger context and selected option update, then clicking changes the typed model. |
| API-233 | Existing API characterized | Same test renders consumer selected-template implicit value and selected-option context; real option click updates model. Native fallback remains plain option text, not rich template rendering. |
| API-234 | Existing API characterized | Same suite opens 1,000 options; custom DOM is bounded, End skips disabled last option, initially unrendered option gains actual active-descendant ID / setsize / posinset, Enter selects value 998. Native fallback deliberately retains native options. No browser scroll geometry claim. |
| API-235 | Fixed abort; partial broader acceptance | `select/select.loader.audit.spec.ts` uses deferred consumer promises, checks no request before open, loading DOM, page-size/offset, dismissal AbortSignal, stale result exclusion, error Retry DOM, successful append and hasMore stop. Angular resource in this version does not itself abort when params become undefined; explicit consumer controller fixes dismissal/destroy while preserving resource stale-result checks. Empty-state rendering and dedicated server-loader acceptance remain open. |
| API-236 | Existing API characterized; partial rejection contract | `select.contracts.audit.spec.ts` commits trimmed text through real input/Enter, checks factory/model and draft reset, and ignores empty commits. No new rejection callback/exception handling added. Native chooser cannot enter arbitrary text; use custom mode or a combobox. |
| API-237 | Open runtime mapping | Search/loading/clear mapping to combobox is not independently integration-tested in this scope. No search/clear feature added to the single-choice select merely to mimic another control. |
| API-238 | Open runtime mapping | Multi-select remains the multiple-value surface. This scope does not claim a new integrated mapping regression. |
| API-239 | Existing API characterized | `select.contracts.audit.spec.ts`: actual methods are `open/close/toggle` (not show/hide), model/output state, no duplicate open output, focus return, disabled opening refusal and overlay removal on destroy. Native OS popup controller acceptance remains open. |
| API-240 | Existing API characterized; responsive geometry open | Actual `.audit-pane` gets width 320px, selected through panelClass. Trigger-width capture exists; resize-driven min-width/browser geometry not newly verified. Native chooser width/class is OS-owned. |
| API-241 | Partial | Existing positions/scrollStrategy/offset inputs retained. No custom container implementation or real collision/scroll geometry acceptance added. |
| API-242 | Partial | Injected typeaheadDelay/wrap default and explicit input precedence are verified. Configurable actual timed typeahead, wrap edges and virtual-vs-nonvirtual policy parity remain open (virtual navigation currently has its own bounded keyboard path). |
| API-243 | Fixed DOM inconsistency; partial full nullable acceptance | Previously nonvirtual/native options appeared enabled even when nullable selection was rejected. Shared keyed-option disabled state now applies the policy to both surfaces. Regression verifies both native disabled and custom aria-disabled. Placeholder/reset and undefined-option identity semantics are not signed off; null object options still require explicit stable key. |
| API-244 | Existing supported templates characterized | `select.contracts.audit.spec.ts` renders selected/group/header/footer consumer templates, selected context, group label context and actual named group. Native fallback renders ordinary label/optgroup, not rich templates. Header/footer are context-free; no invented context contract. |

## Consumer examples

```ts
provideHyalo({
  components: {
    select: { wrap: false, typeaheadDelay: 250, canSelectNullable: false },
    tooltip: { showDelay: 300, hideDelay: 150, touch: 'ignore' },
  },
});
```

Nested `provideHyalo` merges each supported family's fields rather than discarding parent policies. Explicit component inputs override defaults. Existing material/size/tone defaults keep their existing behavior.

```html
<button hyTooltip="Copy" tooltipPanelClass="help-pane" [tooltipHideDelay]="200">Copy</button>
<button [hyPopover]="details" [popoverContext]="{ $implicit: item }"
        popoverTrigger="manual" [popoverShowDelay]="100"
        [popoverHideDelay]="100" #controller="hyPopover">Details</button>
<ng-template #details let-item>{{ item.name }}</ng-template>
```

Manual consumers call `controller.show()/hide()`; `close()` remains an immediate escape hatch. Rich popovers remain dialog surfaces and require appropriate accessible naming. No changes to application IDs, trusted-event buffering, generated example sources or unified audit statuses were made.
