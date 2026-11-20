# Optional engine runtime verification (G11)

## Scope and versions

Executed against the installed lockfile: Chart.js **4.6.1**, FullCalendar core **6.1.22**, TipTap core **3.34.0**. Root manifest ranges are `^4.6.1`, `^6.1.22`, `^3.34.0`; these are not exact package.json pins. No dependency or core-entry-point changes were required.

## Reproducible checks

```sh
npx ng test hyalo --watch=false --include='**/chart.spec.ts' --include='**/scheduler*.spec.ts' --include='**/rich-text*.spec.ts'
npx ng serve docs --port 4302 --host 127.0.0.1
```

The targeted test command passed **13 tests in 5 files**. The engine specs import the real FullCalendar and TipTap factories, not fake engine objects. Static imports in those tests avoid mistaking untracked lazy-import completion for Angular fixture stability. Existing loader-race tests remain separate.

In Chromium, visit `/components/chart` on the development server and evaluate `tools/engine-chart-browser-probe.js` using the browser runtime (or paste into DevTools). Angular's development debug API is intentionally required. The probe calls the wrapper's render method directly to make engine execution independent of IntersectionObserver timing; it does **not** establish automatic viewport loading correctness.

The saved probe returned **15 passing checks**: real line/bar/area/doughnut construction; prior-instance canvas disposal; CanvasGradient before and after resizing to 500×240; Persian locale refresh; resolved dark-theme axis ink; external DOM tooltip with Persian value `۱۸`; focusable data disclosure and six data rows; tooltip clearing on replacement; normal router teardown removing chart and overlay. It verifies DOM existence, not pixel-perfect tooltip placement, scroll anchoring, or keyboard-only disclosure activation (focus plus click is used).

Additional actual Chromium runtime results:

- `/components/scheduler`: real `getApi()` initialized with three events; changing to `timeGridWeek` produced `.fc-timegrid`; navigating through the existing Components link cleared `getApi()`.
- `/components/rich-text`: a real editor accepted text insertion, emitted JSON of type `doc`, produced corresponding HTML and `.tiptap` DOM, rejected `javascript:` link commands, and reported `isDestroyed` after router navigation.

## Demonstrated defects and repairs

1. **FullCalendar lost all built-in plugins on reactive reconfiguration.** The new real-engine test first failed with `viewType "dayGridMonth" is not available` and unknown interaction options. The initial factory adds engine plugins, but subsequent `resetOptions` previously replaced them with consumer-only options. The wrapper now retains factory-owned plugins while accepting current consumer plugins on each reset. Real month→week reconfiguration and disposal pass.
2. **TipTap optional StarterKit extensions could crash toolbar/API commands.** The regression first failed with `chain.toggleBold is not a function` when bold was disabled. Toolbar availability and command dispatch now inspect the real command registry; disabled bold/link/history commands return false instead of throwing. Real JSON round-trip, external null reset, custom-extension replacement, readonly state and old/new editor destruction pass.
3. **Partial Chart.js options erased themed nested defaults.** The regression first failed because `{plugins:{legend:{display:false}}}` removed the external tooltip entirely. Nested plain-object options now merge with defaults, retaining external tooltip and themed scales when callers override unrelated keys. Explicit consumer values still win; arrays/functions/non-plain objects are not recursively copied.

The FullCalendar async workflow test passes real engine EventApi objects through its registered drop callback, confirms pending state, async veto/revert/rejection, no accepted output, and ignores late approval after disposal. It invokes the callback rather than synthesizing physical drag events.

## Limits / remaining release gates

- Chromium only. No Firefox/WebKit, physical touch, screen-reader, high-DPI performance, GPU or hydration acceptance is claimed.
- Automatic IO initialization was not reliably observable through this browser harness; direct render provides honest engine coverage without claiming that gate passed.
- No geometry assertions for tooltip scrolling/edge collision; no physical scheduler drag/resize, backend persistence, or timezone/DST matrix.
- URL checks cover public link/image commands. Host JSON and custom extensions remain trusted input; this is not a general HTML/JSON sanitizer, nor a proof of hostile extension safety.
- These targeted suites and browser probes do not replace the repository-wide build/test/package-isolation gates owned by the coordinating task.
- Development server for handoff: `http://127.0.0.1:4302`, background process `proc_caee47a87f9a`. It was intentionally not terminated.
