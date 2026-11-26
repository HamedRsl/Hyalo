# Select roadmap verification

Status: **partial gate evidence, not a complete 8.6/8.7 sign-off**.

Follow-up: the shared-ID defect identified below is now fixed in
`core/lib/core/ids.ts` with application-scoped counters and seven regression tests.
See `id-hydration.md`. The full combined run passes 488 library tests
and 31 docs tests. The earlier observations below are retained as diagnosis;
trusted pre-bootstrap event replay and deferred hydration remain open.

## Versions and scope

Executed against installed Angular core/platform-server 22.2.3, Aria/CDK 22.2.5,
Angular build 22.2.5 and Vitest 5.0.5. These are the installed versions, not just
package.json ranges. No dependencies or public inputs were changed.

The template already retains both native select and custom trigger nodes. Mode
changes toggle hidden/disabled state rather than replacing an Angular subtree.
The inactive native select is disabled and therefore excluded from FormData.
`afterNextRender` currently enables mode scheduling; it is **not** a hydration
completion guarantee, particularly for deferred/incremental boundaries.

## Proven defect and fix

Before the fix, Angular SSR serialized `[selected]` as no `selected` attribute.
In a JavaScript-blocked browser, the documentation example rendered:

| Example          | Supplied state         | Actual server-only selection before fix |
| ---------------- | ---------------------- | --------------------------------------- |
| Strap (required) | empty / Choose a strap | Leather                                 |
| Case size        | 40                     | Select (placeholder)                    |
| Country (native) | de                     | Select (placeholder)                    |

`select.ssr.spec.ts` uses the real `renderApplication` with hydration/event-replay
providers, then parses the returned HTML. It first failed with
`expected undefined to be 'string:medium'` for `option[selected]`.

The template now binds the selected **attribute as well as the live property**
on the placeholder and grouped/ungrouped options. Server-only selection now
shows the placeholder for empty required state, 40 mm for size and Germany for
country. Keeping the property binding preserves runtime selection updates.

The SSR test restores the exact global descriptors **and accessor-backed
values**, and Angular's cached document, in `finally`. Domino assigns its DOM
constructors to globals; restoring only descriptors is insufficient under the
CLI's shared Vitest worker. The test asserts restoration of Event/KeyboardEvent
and dispatches a real browser-realm keyboard event after SSR.

## Automated regression evidence

Run:

```sh
npx ng test hyalo --watch=false --include='projects/hyalo/select/*.spec.ts'
npx eslint projects/hyalo/select/*.ts projects/hyalo/select/*.html
```

Result: **3 files / 10 tests passed**; scoped ESLint passed.

Coverage includes real SSR serialization, the existing custom keyboard/select
and axe checks, and new native contract tests for:

- Distinct keyed object values with duplicate Persian labels and RTL host.
- Disabled group rejection and labelled native optgroup.
- Signal Forms touched/dirty state, disabled state, reset and async option append.
- Numeric typed Reactive Forms through the existing opt-in `HyForms` adapter.
- Deferral while the native control is focused, stable select/trigger identity,
  label reassociation after enhancement and no hidden native submission entry.

Shared-worker regression command:

```sh
npx ng test hyalo --watch=false \
  --include='projects/hyalo/select/*.spec.ts' \
  --include='projects/hyalo/motion/drag.spec.ts' \
  --include='projects/hyalo/navbar/*.spec.ts' \
  --include='projects/hyalo/field/*.spec.ts' \
  --include='projects/hyalo/swipe-actions/*.spec.ts'
```

Result: **11 files / 35 tests passed**, including the DOM event consumers that
previously exposed the SSR test's realm pollution.

Two full-library runs were attempted after restoration. The latest returned
475 passed / 3 failed (478 tests): two selectable-card tests (focus and missing
required options) and refraction's `renderer.draw` test double. The earlier run
returned 451 passed / 4 failed (two time-picker assertions, refraction and a
Button axe timeout). These files were concurrently being edited outside this
Select task. Neither is a clean full-suite acceptance result. Existing jsdom
canvas warnings were also emitted; no remaining Event realm errors appeared.

## Real browser SSR → hydration evidence

Used the existing docs dev server at `http://127.0.0.1:4200/components/select` in
an isolated browser session. This was not CSR-only fixture evidence:

1. Block `/main.js` before navigation; assert `window.ng` is absent and retain
   references to each server-rendered select, trigger and host.
2. Inspect native selected values before allowing bootstrap.
3. Unblock and dynamically import the original `/main.js` module with a unique
   query string. Disable the development HMR WebSocket for this probe only;
   otherwise Vite reloads the page and destroys the evidence references.
4. Read the exact retained nodes, visibility, selected DOM value, Angular model,
   focus and captured console errors after bootstrap.
5. Repeat with hardwareConcurrency fixed at 8/4/2 (deviceMemory 8) to exercise
   high/medium/low detection. This simulates capability inputs, not hardware
   performance.

Recorded matrix:

| Client tier | SSR visible native controls | Hydrated native controls | Same hosts/selects/triggers | Selected size/country after hydration | Captured errors |
| ----------- | --------------------------- | ------------------------ | --------------------------- | ------------------------------------- | --------------- |
| high        | 3                           | 1 (explicit native)      | all 3                       | 40 / de                               | none            |
| medium      | 3                           | 1 (explicit native)      | all 3                       | 40 / de                               | none            |
| low         | 3                           | 3                        | all 3                       | 40 / de                               | none            |

The browser's raw JSON was saved outside the repository at
`C:/Users/hrsl0/AppData/Local/hermes/cache/browser-use/workspace/sa-0-4a963fb3/select-hydration-matrix.json`.

A separate probe focused the SSR Strap select, changed its DOM value to
`string:steel` and dispatched a bubbling change **before** bootstrap. Hydration
reused the node, retained focus and kept it native, but restored the empty model
and DOM value. The event dispatch contract was present. Therefore pre-bootstrap
input retention/event replay is **not verified and failed this synthetic-event
probe**; this does not establish the behavior of a trusted OS picker event.

## Open gate requirements / findings

- Repeated SSR requests produced IDs such as `hy-select-78..80`; the retained
  nodes became `hy-select-0..2` on the client. No NG05xx errors were captured, but
  deterministic ID equality required by 8.6 failed. The shared `injectId`/CDK
  generator is outside this task's file ownership; do not claim it is fixed.
- Pre-bootstrap input retention needs a reliable trusted-input/event-replay test
  and resolution of the failed synthetic probe above.
- Deferred/incremental hydration is not enabled in the current docs provider
  (`provideClientHydration(withEventReplay())`). No evidence here signs off that
  mode, delayed async detection, or stored-fidelity preferences.
- Focused native mode is covered; a real platform picker held open and later
  closed has not been exercised. Capability oscillation/pinning remains open.
- High/medium/low are capability-input simulations in one Chromium environment,
  not Firefox/WebKit/mobile/assistive-technology validation.
- The required `label`/typed value model exists, with optional primitive-derived
  keys and explicit object keys; comprehensive metadata validation and rich
  template equivalence remain beyond these tests.
- No blanket `ngSkipHydration`, timer-based hydration assertion, or speculative
  `afterNextRender` replacement was added.
