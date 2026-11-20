# Application-scoped ID verification

Status: **cross-request `injectId` counter leakage fixed and regression-tested**.
This closes the specific ID-generation defect recorded in
[`roadmap-select-verification.md`](./roadmap-select-verification.md), not the whole
8.6/8.7 hydration gate.

## Root cause and pinned implementation evidence

Installed versions inspected: Angular core/platform-server **22.2.3**, CDK
**22.2.5**, Vitest **5.0.5**.

`node_modules/@angular/cdk/fesm2022/_id-generator-chunk.mjs` declares
`const counters = new Map()` at module scope (line 4). `_IdGenerator.getId()`
reads and increments that map (lines 8–19), keyed by prefix plus custom `APP_ID`.
Creating another generator or destroying an application does not recreate this
map. Therefore successive SSR requests in one process inherit previous requests'
counts. A fresh browser module starts at zero instead. The old `injectId` comment
claimed application scoping, but wrapping CDK's generator did not provide it.

The installed Angular/CDK public declarations do not expose an application- or
SSR-scoped ID-generator token to substitute here. Angular's public `APP_ID` is a
namespace, not a per-request counter. Its installed factory defaults to `ng`
(`@angular/core/fesm2022/_pending_tasks-chunk.mjs`, lines 2817–2820). Using that
public token with a root-scoped `InjectionToken` factory gives the required
application lifecycle without any private production APIs.

## Fix and compatibility

`projects/hyalo/core/lib/core/ids.ts` now owns a private root-provided injection
token. Its factory captures the application's `APP_ID` and creates a **local**
counter map. Root lifetime is application lifetime; each SSR bootstrap gets a
fresh map, while child/route environment injectors share the root's map.

Preserved behavior:

- Public signature `injectId(prefix: string): string`, injection-context requirement,
  independent prefix counters, starting at zero.
- Default format `hy-select-0`, `hy-select-1`, `hy-field-hint-0`.
- Existing CDK custom-namespace format: `APP_ID: 'app-a'` produces
  `hy-select-app-a0`, then `hy-select-app-a1`.
- No bootstrap provider/configuration changes for consumers.

No random/time input, process-global mutable counter, reset hook, dependency,
public API, or Select implementation/test change was added. CDK's private
`_IdGenerator` is no longer a production dependency of this helper.

## RED → GREEN regression evidence

The first new test failed against the old implementation:

```text
expected 'hy-select-2' to be 'hy-select-0'
```

This was the second live application, after the first generated two IDs. After
implementing the scoped token, that test passed. The complete new spec was also
run against the original implementation: **6 failed / 1 passed**, including the
real SSR regression (fresh client IDs were `hy-select-13`, `hy-select-14`,
`hy-field-hint-3`). Restoring the fix made all seven tests pass.

`projects/hyalo/core/lib/core/ids.spec.ts` covers:

1. Independent live applications, with interleaved generation proving no reset
   of another application's sequence.
2. Independent prefix counters, distinct IDs and safe handling of empty and
   `__proto__` prefixes.
3. Child/sibling `EnvironmentInjector` sharing, including child-first resolution
   and child `APP_ID` overrides not changing the root namespace.
4. Custom `APP_ID` layout and separate application namespaces, plus a new
   application reusing the same namespace starting at zero.
5. Application destruction followed by fresh bootstrap.
6. Injection-context enforcement.
7. Three real `renderApplication` requests with hydration providers: each
   serializes the same two input IDs, label `for` references and hint ID, matching
   the same generation sequence in a fresh browser application injector.

The SSR test restores worker global descriptors, accessor-backed values and
Angular's cached document in `finally`, following the existing Select SSR test's
restoration pattern. It then checks document/Event/KeyboardEvent identity and
dispatches a browser-realm keyboard event. The private `ɵsetDocument` import is
**test-only** and mirrors the existing SSR harness; production uses public APIs.

## Executed checks

```sh
npx ng test hyalo --watch=false --include='projects/hyalo/core/lib/core/ids.spec.ts'
# 1 file / 7 tests passed

npx ng test hyalo --watch=false \
  --include='projects/hyalo/core/lib/core/ids.spec.ts' \
  --include='projects/hyalo/select/*.spec.ts' \
  --include='projects/hyalo/motion/drag.spec.ts' \
  --include='projects/hyalo/navbar/*.spec.ts' \
  --include='projects/hyalo/field/*.spec.ts' \
  --include='projects/hyalo/swipe-actions/*.spec.ts'
# 12 files / 42 tests passed, including both SSR harnesses and DOM-event consumers

npx ng test hyalo --watch=false
# 131 files / 488 tests passed

npx ng test docs --watch=false
# 10 files / 31 tests passed

npx ng build hyalo
# Angular package build passed, including core and all secondary entry points.

npx eslint projects/hyalo/core/lib/core/ids.ts projects/hyalo/core/lib/core/ids.spec.ts
npx prettier --check projects/hyalo/core/lib/core/ids.ts projects/hyalo/core/lib/core/ids.spec.ts
npx prettier --check docs/roadmap-id-verification.md
git diff --check
# All passed; Git emitted existing LF/CRLF conversion notices.
```

The full-library run still emitted jsdom's existing unimplemented canvas
`getContext()` notices. No test failed and no DOM-event realm errors appeared.

## Limits / remaining hydration work

- These are real SSR serialization and fresh-client DI-sequence comparisons, not
  a new end-to-end browser hydration run. The prior Select browser matrix should
  be rerun to verify unchanged IDs on retained hydrated nodes.
- Counter determinism requires the same `APP_ID` and per-prefix creation order
  on server and client. This does not solve divergent trees, conditional extra
  allocations, or deferred/incremental hydration ordering.
- Multiple applications sharing one document must configure distinct, stable
  `APP_ID` namespaces. Two applications with the default `ng` (or the same custom
  namespace) intentionally restart at zero. The inherited custom-ID format
  concatenates namespace and counter without a separator; arbitrary namespaces
  ending in digits can be ambiguous across applications. That pre-existing CDK
  layout was preserved to minimize compatibility risk, not redesigned here.
- `injectId` no longer shares counters with direct CDK `_IdGenerator` consumers
  manually using the same `hy-*` prefixes. Such consumers should use their own
  namespace instead of depending on CDK's private global state.
- Application isolation is verified with simultaneously live application roots;
  HTTP-request concurrency and trusted-input/event-replay retention were not
  newly tested. There is no shared reset or mutable map in production to race.
