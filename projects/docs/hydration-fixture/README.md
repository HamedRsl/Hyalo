# Select hydration regression fixture

This is an independent, prerendered Angular application. It does not modify docs
routes, providers or workspace configuration. The build invokes the installed
Architect target with entry-point overrides and writes `dist/hydration-fixture`.

```sh
node tools/hydration-build.mjs
# Playwright can be installed outside the repo; point at its ESM entry point.
HY_PLAYWRIGHT=C:/path/to/node_modules/playwright/index.mjs node tools/hydration-replay.mjs
npx ng test hyalo --watch=false --include='projects/hyalo/select/*.spec.ts'
```

Install Chromium with `playwright install chromium` if necessary. The runner uses
`channel: 'chromium'` (full Chromium, not the separate headless-shell download).
It owns a temporary HTTP server on 127.0.0.1:4301 and closes it and the browser in
`finally`; do not run two copies concurrently.

## Assertions and real execution

The initial main module request is held behind an explicit promise gate. Inline
Angular event capture still executes from the actual SSR HTML. While bootstrap
is blocked, Playwright keyboard input changes the focused native select. The
harness asserts a captured `change` with `isTrusted === true`, not a synthetic
`dispatchEvent` or Playwright `selectOption` event. Then it releases the original
module request without reload and asserts the model, DOM selection and focus.

The second control is inside `@defer (hydrate on interaction)` with
`withIncrementalHydration()`. It stays native after root bootstrap; trusted
keyboard selection triggers incremental hydration. The runner checks the model,
unchanged host/select/trigger identity and IDs, then blur-driven enhancement.
The matrix repeats for persisted high/medium/low overrides loaded by fixture
code after the first root render. High and medium additionally exercise a
capability downgrade while a custom overlay is open and its trigger focused.
No fixed sleep is used as evidence of hydration completion.

Actual RED evidence: before the Select fix the eager model never reached
`second` after the trusted selection. After capturing its initial live DOM key,
the incremental control exposed `NG0950: Input "options" is required but no value
is available yet` from replay entering `pickNative` before required input binding.
Buffering native keys until that instance's first render fixes the second defect.
The resulting Chromium run reports **3 passing tier scenarios**, trusted input
and change events for both controls, retained nodes/IDs, and **no console or page
errors**. The Select specs pass **11 tests**. A combined SSR/ID/DOM-event consumer
run passes **13 files / 45 tests** (includes concurrently-added tests).

`afterNextRender` is used only to gate the local instance's first render and
input availability, never asserted to mean global hydration completion. All
native fallback nodes remain in place. There is no `ngSkipHydration`, hydration
sleep, or application-wide completion assumption. Existing SSR specs continue
to restore global property descriptors, accessor-backed values and Angular's
cached document; the browser harness runs in isolated browser contexts instead
of mutating Vitest globals.

## Scope limits

This proves Chromium keyboard-generated native input, not a platform picker
held open by a mouse/touch interaction, Firefox/WebKit behavior or assistive
technology behavior. Persistence is implemented by this fixture as a consumer
of `HyFidelity.setTier`; it does not claim the service owns preference storage.
The native baseline restoration intentionally treats a live selection differing
from its serialized default as pre-hydration user input; untrusted page scripts
can also mutate that DOM. Invalid/disabled keys still use normal Select guards.
The fixture has one deferred boundary in server/client allocation order and does
not prove arbitrary out-of-order deferred shared-ID allocation.
