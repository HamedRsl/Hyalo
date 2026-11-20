# Shared motion lifecycle verification

## Scope

This record addresses the unit-test portion of G8 in
`roadmap-implementation-status.md`. It is not a whole-scene performance,
real-device, cross-engine, hydration or accessibility certification.

Only `motion/scene.ts` production behavior changed. Existing FLIP, stagger and
progressive-blur behavior passed characterization tests; no speculative changes
were made to those implementations. Unrelated pre-existing working-tree changes
were preserved.

## Proven defects and red–green evidence

1. **Nested-root intersection state leaked between registrations of one host.**
   A dedicated test registered one host under an outer and an inner root, then
   delivered only the outer observer's intersection. Before the fix the inner
   handler also ran (one unexpected call). Participants now retain their root;
   observer callbacks update only registrations for their own root.
2. **Removing one root registration retained observation while another root
   still used the host.** The regression expected the removed root observer to
   unobserve the host; before the fix it had zero calls. Removal now unobserves
   only when the last registration for that host/root pair leaves, retaining the
   other root's observation.

The first scene test run also exposed harness setup issues: Angular's own queued
RAF made global frame-count assertions include unrelated scheduling. Draining
setup frames before those assertions corrected the harness. Initial TypeScript
strict-index diagnostics and jsdom's absent WAAPI method were fixed in the tests,
not presented as product defects.

## Behavioral coverage

- `projects/hyalo/motion/scene.spec.ts`: same-host nested roots, shared observer
  lifetime, per-root removal, one coalesced event frame, cached geometry and scroll
  invalidation, all geometry reads before handler writes, offscreen/removal,
  pointer cancellation, hidden document, reduced motion, no IntersectionObserver,
  coarse pointer, touch suppression, pending-frame teardown, and host-local CSS
  coordinates with no per-frame document-root or parent-root CSS writes.
- `projects/hyalo/motion/layout.spec.ts`: FLIP transform geometry, interrupted and
  superseded runs, retained focus/state callback, pending destroy, active/pending
  reduced-motion cancellation, absent WAAPI and zero final bounds; stagger
  offscreen/hidden/reduced cancellation, bounded delays, settled/rejected animation
  cleanup, stable child identity on reorder, new child insertion, MutationObserver
  teardown, no-IO fallback and destroy cancellation.
- `projects/hyalo/progressive-blur/progressive-blur.spec.ts`: decorative
  `aria-hidden` structure, top/bottom edge, tier changes without structural churn,
  no focusable controls, focus retention and no frame requested by teardown.
  Progressive blur is a static material effect: reduced motion does not disable
  its high-tier class. It owns no motion controller or animation to cancel.

## Commands actually executed

Baseline:

```sh
npx ng test hyalo --watch=false --include='projects/hyalo/interaction/pointer.spec.ts'
```

Result: **1 file / 5 tests passed**.

After the first root-isolation fix: **1 file / 8 tests passed**. The subsequent
per-root-unobserve regression failed **1 / 9 tests**, then passed after its fix.
The initial combined new suites passed **3 files / 18 tests** before the final
additional layout fallback/cancellation cases.

Final scoped integration:

```sh
npx ng test hyalo --watch=false \
  --include='projects/hyalo/motion/*.spec.ts' \
  --include='projects/hyalo/progressive-blur/*.spec.ts' \
  --include='projects/hyalo/interaction/*.spec.ts' \
  --include='projects/hyalo/src/lib/motion/*.spec.ts'
```

Result: **8 files / 63 tests passed**, exit 0. This includes shared drag/runtime/
spring/interaction regressions, not only the new specs.

```sh
npx eslint projects/hyalo/motion/scene.ts projects/hyalo/motion/layout.ts \
  projects/hyalo/motion/scene.spec.ts projects/hyalo/motion/layout.spec.ts \
  projects/hyalo/progressive-blur/progressive-blur.ts \
  projects/hyalo/progressive-blur/progressive-blur.spec.ts
```

Result: **exit 0**, no diagnostics. Prettier ran only on owned touched files.

## Limits / open release evidence

Tests use jsdom, controllable IntersectionObserver/RAF doubles, mocked layout
rectangles and WAAPI doubles. Stagger uses the real jsdom MutationObserver. These
prove callback ownership, scheduling, style-write destinations and lifecycle
cleanup, not native animation interpolation, actual intersection geometry,
compositing costs, focus behavior in all engines or physical touch quality.

Progressive-blur CSS reduced-transparency/forced-colors fallbacks were inspected
but not exercised in a rendered browser. There is no new style-recalculation
trace, hardware frame-time budget, 4K/mobile measurement or validation of the
64-participant cap as a performance budget. Full repository tests/build and G1
settled-tree gates belong to integration and were not run by this scoped task.
G8's dedicated lifecycle regression gap is narrowed; its profiling requirement
and G7/G10 remain open.
