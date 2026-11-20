# Forms, content lifecycle and selection audit resolution

Scope: field, accordion, tabs, stepper, combobox and multi-select only. This ledger
covers the assigned P1 records; it does not certify neighboring P2/P3 rows or the
whole inventory. Public entry points were inspected, not inferred from input names.

## Per-ID evidence

All implementation paths below are relative to `projects/hyalo/`. Tests exercise
rendered DOM or actual Angular control state.

| ID | Resolution | Implementation and behavioral evidence | Documentation |
| --- | --- | --- | --- |
| API-001 | Implemented | `field/public-api.ts` exports `HyForms` / `HyFormsControl`. `forms-bridge.spec.ts` exercises FormControl writes, user input, reset, touch, disable/enable and non-echoing writes. `audit-contracts.spec.ts` adds real formControlName and ngModel round trips and reset. | Classic forms example below; directive JSDoc in `field/forms-bridge.ts`. |
| API-002 | Implemented for native and shared composite field metadata | `field/field.ts` exports `HyErrorStateMatcher` and applies raw invalid/touched/dirty/submitted/pending independently of value type, with explicit server error precedence. `field/value-control.ts` now forwards dirty and pending instead of silently dropping them. `audit-contracts.spec.ts` exercises dirty visibility, pending suppression/status and server override. | Error-policy example below. Classic bridge owns value/disabled/touch, not automatic classic-validator-to-field error text mapping. |
| API-009 | Implemented | `accordion/public-api.ts` exports `HyAccordionContent`; `accordion.lifecycle.spec.ts` proves eager content stays eager, lazy content is absent before opening, retained after closing, and destroyed/recreated when opted in. | Lazy content example below. |
| API-059 | Implemented | `combobox/public-api.ts` exports query/identity contracts. `combobox.spec.ts` exercises equivalent object values, duplicate source labels, displayWith and End/Enter virtual selection. Existing remote tests verify retained selected labels and aborted obsolete requests. | Selection example below. |
| API-060 | Implemented; fixed-height contract | `combobox/query.ts` windows `visibleResults`, uses spacers, absolute aria-setsize/posinset and virtual keyboard scrolling. `combobox.spec.ts` proves at most 10 rendered options for 1,000 suggestions and navigation to option 1,000. | Virtual option contract below. |
| API-159 | Implemented | `multi-select/multi-select.ts` now renders programmatic values absent from options using displayWith, keeps selection ordering and comparator-based removal. Accessible removal labels now use the same display callback. `multi-select.spec.ts` covers missing options/removal and equivalent-object virtual toggling; existing combobox suite covers remote chip retention/removal. | Selection example below. |
| API-160 | Implemented; fixed-height contract | Shared `HyOptionQuery` virtual window. `multi-select.spec.ts` proves at most 10 option nodes for 10,000 options and absolute position 99 after scrolling. Avoids evaluating all known-option deduplication when selection is empty. | Virtual option contract below. |
| API-264 | Implemented | `stepper/stepper.ts` accepts a `HyStepControl`, reads valid/pending and supports explicit completionOverride. Added statusChanges subscription with effect cleanup, fixing cached validity on the same FormControl instance. `stepper.spec.ts` proves invalid → valid → pending → valid navigation gating. | Step control example below. |
| API-296 | Implemented | `tabs/public-api.ts` exports `HyTabContent`. `tabs.lifecycle.spec.ts` proves absence before first activation, first creation, retained DOM identity, and opt-in destruction on hide. | Lazy content example below. |
| API-304 | Partial; guarded API implemented, comprehensive focus/race verification remains | `tabs/tabs.ts` provides boolean/promise beforeChange, generation-based stale request suppression, error output and destruction guard. Fixed approval after external selection changes and after target disable/removal by revalidating source and target before commit. `tabs.lifecycle.spec.ts` reproduces and verifies controlled-selection and disabled-target races. Existing `tabs.spec.ts` covers normal click/arrow/ARIA synchronization. Complete veto focus recovery, model change-away-and-back races, guard rejection and destruction race coverage remain unverified here. | Guard example below. |

## Supported usage

### Classic forms and field error policy

Import `HyForms` from `@hyalo/angular/field` with `ReactiveFormsModule` or
`FormsModule`. Bind the adapter to the actual component instance; do not attach
`[formField]` to the same control.

```html
<hy-number-input #amount [hyForms]="amount" [formControl]="amountControl" />
<!-- Inside a formGroup: -->
<hy-number-input #cost [hyForms]="cost" formControlName="cost" />
<hy-number-input #quantity [hyForms]="quantity" [(ngModel)]="quantityValue" />
```

A reusable matcher receives `invalid`, `touched`, `dirty`, `submitted`, `pending`:

```ts
const showError: HyErrorStateMatcher = (state) =>
  state.invalid && !state.pending && (state.touched || state.dirty || state.submitted);
```

Pass it as `[errorStateMatcher]="showError"` to `hy-field`. Composite controls
accept `[dirty]` and `[pending]` metadata as well as invalid/touched/errors. Explicit
`error` on the field overrides derived error text. Classic form validation messages
must be provided explicitly; the value adapter does not synthesize messages.

### Lazy retain/destroy

Import the corresponding directive (or `HY_ACCORDION` / `HY_TABS` / `HY_STEPPER`).
Projected ordinary content remains eager; only explicit templates are lazy.

```html
<hy-accordion-item heading="Details" [destroyOnClose]="true">
  <ng-template hyAccordionContent>Expensive content</ng-template>
</hy-accordion-item>
<hy-tab value="details" label="Details" [destroyOnHide]="true">
  <ng-template hyTabContent>Expensive content</ng-template>
</hy-tab>
<hy-step label="Details" [destroyOnHide]="true">
  <ng-template hyStepContent>Expensive content</ng-template>
</hy-step>
```

All destruction options default to false, retaining a created view after hiding.

### Identity, display and bounded virtual options

```html
<hy-combobox [options]="records" [compareWith]="sameRecord"
  [displayWith]="recordName" [virtualized]="true"
  [itemHeight]="44" [viewportHeight]="264" />
<hy-multi-select [options]="records" [compareWith]="sameRecord"
  [displayWith]="recordName" [virtualized]="true" />
```

`sameRecord = (a, b) => a.id === b.id` defines value identity; object options still
need a separate unique stable `key`. Duplicate labels are allowed. `displayWith`
controls display/search labels and multi-select removal labels. Missing selected
multi-values remain removable and use displayWith (or String(value) as fallback).
Virtual mode assumes uniform option heights; arbitrary variable-height option or
group templates are not a measured variable-size virtualization engine. The
viewport renders visible rows plus four overscan rows and exposes absolute option
positions; Home/End and arrow navigation can reach unrendered options.

### Form-aware steps and guarded tabs

```html
<hy-step label="Account" [control]="accountForm">...</hy-step>
<hy-step label="Optional" [completionOverride]="true">...</hy-step>
<hy-tabs [beforeChange]="approveTabChange">...</hy-tabs>
```

`accountForm` may be a classic FormControl/FormGroup. Emitted statusChanges update
linear gating without replacing that instance; pending blocks completion. For a
custom non-observable control, replace the input object when validity changes or
supply reactive getters. `beforeChange` receives `{ previous, next }` and returns
boolean or Promise<boolean>; false preserves selection. Rejections emit
`transitionError`. The selected model remains an explicit application-owned write
path, not an invocation of beforeChange.

## Verification scope

Targeted unit tests and targeted ESLint are run for this batch. No dependencies,
commits, global generated-source synchronization or unrelated parent changes were
made. Full build, packed consumer, SSR and browser acceptance are integration gates,
not claimed by this ledger.
