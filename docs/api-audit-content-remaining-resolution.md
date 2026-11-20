# Remaining forms/content and small-family audit evidence

This supplements `api-audit-forms-content-resolution.md`; it does **not** certify
all 329 records. Paths below are relative to `projects/hyalo/`. Existing APIs are
characterized rather than rewritten. Explicit open rows must not be counted as
implemented. No dependencies, commits, core/select/popover changes or global
source synchronization were performed in this batch.

## Per-ID ledger

| ID | Outcome | Behavioral evidence / limitation |
| --- | --- | --- |
| API-003 | Existing API characterized; visual acceptance open | `field/presentation.audit.spec.ts` renders floating-label mode; CSS implements focused/filled floating. Pixel/focus CSS behavior is not proven by jsdom. |
| API-004 | Verified | `field/presentation.audit.spec.ts`: safe hint/error/status templates, context and actual described-by targets. |
| API-005 | Verified | Same test: pending aria-busy, success/warning feedback, error precedence. |
| API-006 | Existing API characterized; visual acceptance open | Same test renders fixed subscript mode; actual reserved geometry requires browser measurement. |
| API-007 | Verified | Same test hides required marker without changing classic required validity. |
| API-008 | Supported composition verified | `field/autosize.audit.spec.ts`: `HyInput` plus CDK `TextFieldModule`/`cdkTextareaAutosize`, native naming, resize controller and multiline edits. Actual resized pixel heights remain browser-only. |
| API-010 | Verified previously | `accordion/accordion.lifecycle.spec.ts`: opt-in destruction and fresh recreation. |
| API-011 | Verified | `accordion/accordion.audit.spec.ts`: separate clickable header action does not toggle expansion. |
| API-012 | Verified | Same test renders stateful custom icon and removes it when hidden. |
| API-013 | Verified | Same test blocks trigger in manual mode while model/controller still works. |
| API-014 | Verified | Same test expands/collapses/toggles enabled items of multiple-open group, preserving disabled item. |
| API-015 | Verified event boundary | Same test rejects descendant/wrong-property transition events and accepts body grid transition completion. Reduced-motion no-transition completion semantics remain open. |
| API-061 | Verified | `combobox/query.audit.spec.ts`: offset pages append, query resets offset, obsolete/destroyed requests abort. |
| API-062 | Partial | Same test verifies query threshold. Debounce cancellation is implemented with effect cleanup but no timer-boundary regression added here. |
| API-063 | Verified | Same test commits typed arbitrary text via application `createValue`; fixed transient Aria empty selection clearing committed values. |
| API-064 | Verified | `combobox/templates.audit.spec.ts`: option/selected/group content rendered through TemplateRef with escaped text. |
| API-065 | Verified | `combobox/query.audit.spec.ts`: exact policy preserves committed value on unmatched Enter; hint rendered. |
| API-066 | Partial | `combobox/templates.audit.spec.ts` verifies actual overlay panel class/width and templates; positions/scroll strategy/offset collision geometry not browser-verified here. |
| API-067 | Verified | `combobox/query.audit.spec.ts`: open/close visibility sequence. |
| API-068 | Implemented and verified | `command/command.ts` adds typed recursive children and Back navigation; `command/command.audit.spec.ts` enters/leaves a page without closing dialog. |
| API-069 | Implemented and verified | Optional `loadItems(query, AbortSignal)` owns remote results; same test proves query replacement abort, stale suppression, rendered current results and destruction abort. No network without loader. Existing command suite proves 50-node cap and keyboard selection. |
| API-124 | Implemented and verified | `filter/operators.ts` exports `evaluateFilters` and explicit `HyFilterOperatorRegistry`; `operators.spec.ts` executes custom predicates and rejects inherited/unknown operator names. |
| API-125 | Implemented and verified | Same test executes per-field AND/OR constraints and configurable outer AND/OR. Empty groups are neutral. Existing serialized token format is unchanged. |
| API-127 | Open | Hotspot forwards placement but has no independently configurable overlay container. Shared popover is outside this agent's ownership; no fake forwarding input added. |
| API-146 | Different-role expansion, not implementation | Existing list is semantic content, not a selection control. Keep selection-list expansion separate per approved design. |
| API-147 | Open mapping verification | Paging can compose with pagination/virtual-list, but integrated data-list paging is not verified by this batch. |
| API-161 | Shared implementation, partial evidence | Multi-select inherits the same page loader tested via combobox. No separate multi-select paged integration test; do not count inherited declaration alone as full acceptance. |
| API-162 | Verified | `multi-select/policies.audit.spec.ts`: actual select-all respects maximum selection count. |
| API-163 | Verified | Same test selects filtered enabled options and clear-all retains disabled selected values. |
| API-164 | Fixed and verified | The summary callback existed but was never rendered. Added live summary when selected count exceeds rendered chips; same test catches the missing DOM and verifies callback output. |
| API-165 | Verified | `combobox/templates.audit.spec.ts`: actual multi-select option/group/chip TemplateRef content. |
| API-166 | Verified | Same test renders header/footer inside actual multi-select panel. |
| API-167 | Verified | `multi-select/policies.audit.spec.ts`: custom filter removes a result before select-all. |
| API-168 | Verified | Same test drives public show/hide controller and visibility output. |
| API-169 | Partial | Template integration verifies panel width/class; full overlay positions/scroll/outside geometry remain integration gates. |
| API-170 | Partial | Policy test verifies selection/removal/visibility emissions; fine-grained timing/attachment-completion is not certified. |
| API-183 | Implemented and verified | `number-ticker/number-ticker.{ts,html}` adds safe value/loading templates, context, loading label and aria-busy; `ticker.audit.spec.ts` switches loading to value while preserving final accessible text. Existing ticker suite still verifies animation/reduced-motion/destroy cleanup. |
| API-260 | Open mapping verification | Sparkline intentionally remains a lightweight line SVG. Chart area/bar/options capabilities exist elsewhere but no mapping test was added; do not label as a new sparkline engine. |
| API-265 | Verified DOM contract | `stepper/stepper.audit.spec.ts` renders vertical orientation; pixel layout remains browser gate. |
| API-266 | Verified | Same test renders rich label template. |
| API-267 | Partial | Same test verifies selection/after-render completion; no configurable transition duration or animation-boundary completion implemented. |
| API-268 | Verified | Same test hides unavailable headers, resets real FormControl and destroys hidden lazy view. |
| API-269 | Verified | Same test whole-stepper reset plus disabled header UI while imperative next remains available. |
| API-270 | Verified | Same test proves absent-before-activation, retained identity, and opt-in destruction. |
| API-271 | Verified | Same test renders subtitle/error/custom indicator plus invalid/busy metadata. |
| API-272 | Verified custom representation | Same test renders custom progress indicator/context; number/dot fallback already exists. |
| API-297 | Verified previously | `tabs/tabs.lifecycle.spec.ts`: inactive lazy view retain/destroy semantics. |
| API-298 | Verified | `tabs/presentation.audit.spec.ts`: custom header content. |
| API-299 | Verified | Same test routes approved selection via application Router; not automatic route-to-selection synchronization. |
| API-300 | Verified DOM/controller contract | Same test clicks paginator and verifies viewport scroll distance. Actual overflow geometry remains browser gate. |
| API-301 | Open | No animated active-panel height implementation; no input-only claim. |
| API-302 | Verified DOM contract | Same test vertical ARIA orientation and bottom-placement state; pixel layout remains browser gate. |
| API-303 | Verified | Same test add/close request outputs; application owns mutation of tab collection. |
| API-304 | Guard regressions fixed and verified | `tabs/tabs.audit.spec.ts`: veto/rejection restores selected header focus only while focus remains in headers; observed external selection changes invalidate pending generation, including change-away-and-back. Also tests superseded guards, target removal and destruction. Existing lifecycle suite tests disabled targets. |
| API-305 | Partial | Presentation test verifies focus output; completion is after-render rather than actual CSS transition-end. |
| API-306 | Verified | Presentation test changes native overflow dropdown and actual selected model. |
| API-307 | Partial | Presentation test verifies badge/custom header. Responsive compact-label pixel behavior not browser-verified. |
| API-308 | Verified | Existing `time-picker.spec.ts` tests 12/24 format, midnight/noon and canonical ASCII model. Added SSR test and selected-attribute fix for hour/minute/second/period. |
| API-309 | Verified previously | Time suite executes all disabled predicates and restores rejected edits. |
| API-310 | Verified | Time suite checks rendered unit stepping; `time-picker.ssr.spec.ts` parses server HTML and verifies selected canonical parts. |
| API-311 | Partial | Time suite verifies confirmation transaction/reset/empty values; footerTemplate exists but custom footer integration not separately tested here. |
| API-312 | Different-role expansion, not implementation | Existing time-picker is inline/native; popup controller would change its role. Application can compose a surface; no new popup family introduced. |

## Supported new usage

```ts
// @hyalo/angular/command
command.open({
  items: [{ id: 'settings', label: 'Settings', value: 'settings', children: [
    { id: 'theme', label: 'Theme', value: 'theme' },
  ] }],
  // Optional; no implicit endpoint. AbortSignal is cancelled on replacement/close.
  loadItems: (query, signal) => applicationSearch(query, signal),
  backLabel: 'Back', loadingLabel: 'Searching', errorLabel: 'Search failed',
});

// @hyalo/angular/filter - independent of serialized filter token codecs
const allowed = evaluateFilters(record, [{
  field: 'status', operator: 'or', constraints: [
    { operator: 'eq', value: 'active' }, { operator: 'eq', value: 'pending' },
  ],
}], { eq: (actual, expected) => actual === expected });
```

```html
<ng-template #value let-number let-formatted="formatted"><b>{{ formatted }}</b></ng-template>
<ng-template #waiting>Waiting for value</ng-template>
<hy-number-ticker [value]="amount" [loading]="busy" loadingLabel="Loading amount"
  [valueTemplate]="value" [loadingTemplate]="waiting" />

<!-- Native textarea composition: import TextFieldModule and HyInput. -->
<hy-field label="Notes"><textarea hyInput cdkTextareaAutosize
  cdkAutosizeMinRows="2" cdkAutosizeMaxRows="5"></textarea></hy-field>
```

## Verification scope

Targeted family tests and targeted ESLint are the gates for this batch. Full
library/docs build, packed consumer, trusted hydration replay, cross-engine visual
and AT checks remain parent integration work. jsdom accessibility checks may print
the existing canvas getContext warning; this is not pixel evidence. Final targeted run: **33 test files / 94 tests passed** using
`npx ng test hyalo --watch=false --include='projects/hyalo/{field,accordion,tabs,stepper,combobox,multi-select,command,list,hotspot,time-picker,number-ticker,sparkline,filter}/*.spec.ts'`.
Targeted ESLint over changed TypeScript/templates passed with exit code 0. One
intermediate run was blocked by a concurrent masked-input TypeScript edit; the
final rerun compiled successfully without changing that other owner's files.
