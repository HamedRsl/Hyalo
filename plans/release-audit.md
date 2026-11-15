# Phase 1–3 release audit

Reviewed 2026-11-15 against `phase-2`, starting at `69e9f05`.
The supplied roadmap describes intended scope; implementation and verification were
checked independently. This audit does not certify every roadmap requirement.

## Findings and changes

| Priority | Location                                                               | Before                                                                   | After                                                                                   | Why                                               |
| -------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------- |
| High     | `projects/hyalo/field/input.ts`                                        | Signal Forms bridge treated as an AbstractControl                        | Signal state read directly; classic controls subscribed separately                      | Prevents runtime and prerender crashes            |
| High     | `projects/hyalo/command/command.html`                                  | Escape consumed by the combobox; first close could only collapse results | Dialog-lifetime expanded list and explicit Escape dismissal                             | Immediate keyboard actions and reliable dismissal |
| High     | `projects/hyalo/navigation-menu`                                       | Panel clipped by ancestor cards                                          | CDK connected overlay with viewport fallback and focus handoff                          | Keeps disclosures visible and keyboard reachable  |
| Medium   | `projects/hyalo/filter`                                                | Nested field and input borders; no component interaction regression      | Shared field styling and stable editor/state regression                                 | Single rounded focus ring and retained focus      |
| Medium   | `projects/docs/src/app/pages/extensions.*`                             | Search demo only showed serialized clauses                               | Actual filtered results, count and empty state                                          | Makes the filtering contract observable           |
| Medium   | `projects/docs/src/app/pages/breadcrumb.*`, `sidebar.*`, `dashboard.*` | Demo controls navigated to unrelated pages                               | Local path/selection state and preview feedback                                         | Avoids leaving the demonstration and scroll jumps |
| Medium   | `projects/docs/src/app/pages/chart.*`                                  | Chart controls touched content                                           | Dedicated grid spacing and consistent selected button states                            | Clear control/content grouping                    |
| Medium   | `projects/docs/src/app/nav.ts`, `pages/components.*`                   | Unsorted navigation; five catalog entries missing                        | Alphabetical navigation and complete passive catalog                                    | Predictable discovery                             |
| Medium   | `projects/hyalo/sidebar`, dashboard                                    | Weak spacing and surface hierarchy                                       | 44px targets, compact rail, structural surface and responsive shell                     | Clear hierarchy without nested live blur          |
| Medium   | `projects/hyalo/motion/scene.ts`                                       | Some leave handlers ran among geometry reads                             | Collect inactive entries, then invoke handlers after reads                              | Avoids style-write/layout-read interleaving       |
| Medium   | `projects/hyalo/refraction/renderer.ts`                                | Repeated uniform lookups and canvas resets                               | Cached locations, batched measurements, conditional resizing, explicit resource cleanup | Reduces redraw work and retained resources        |
| Medium   | `projects/hyalo/core/lib/core/indicator.ts`                            | Untracked ready-frame callback                                           | Single pending callback, canceled on destruction with SSR guard                         | Prevents late work after teardown                 |
| Medium   | `projects/hyalo/code-block/code-block.html`                            | Template whitespace changed copied source                                | Exact text content                                                                      | Source fidelity                                   |
| Medium   | `eslint.config.js`, block/extension components                         | Old facade restrictions and oversized inline declarations                | Restrictions target core; templates/styles extracted                                    | Clean lint without disabling quality rules        |
| Low      | Select, accordion, navigation and split-button chevrons                | Font glyphs/inconsistent dimensions                                      | Shared SVG icons, 1rem affordances and state rotation                                   | Consistent optical alignment                      |

## Motion opportunities and decisions

| Location              | Purpose          | Frequency  | Motion and accessibility                                                                                                       |
| --------------------- | ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Sidebar toggle        | State indication | Occasional | Reversible icon transform, 220ms existing quick/out tokens; immediate layout width; reduced motion removes rotation transition |
| Disclosure chevrons   | State indication | Occasional | 180 degree rotation, 220ms existing quick/out tokens; reduced-motion override                                                  |
| Sidebar item feedback | Feedback         | Tens/day   | 120ms background/color feedback; hover gated by fine pointer and hover capability                                              |

Existing easing tokens remain the shared vocabulary:
`--hy-ease-out: cubic-bezier(0.215, 0.61, 0.355, 1)` and
`--hy-dur-quick: 0.22s`. No additional animation engine was added.

Rejected candidates:

- Command palette entrances: keyboard actions must remain immediate.
- Dashboard chart drawing and default number rollups: functional data should remain stable.
- Dashboard stagger on every filter/navigation update: repeated reading would be delayed.
- Sidebar width tween: would relayout dense dashboard content every frame; animate the state affordance instead.
- Catalog background and pointer effects on every preview: passive previews avoid multiplying expensive work.

The interface needs restrained feedback rather than more decorative motion. Existing
tab indicators, spring interactions and material fallbacks are retained. The most
valuable motion change is consistent, reversible disclosure feedback.

## Performance coverage

Reviewed OnPush/signal-based components, pointer sampling, observer/listener cleanup,
indicator scheduling, optional chart loading and refraction drawing. Tinted/solid
materials already avoid backdrop filters. Charts use lazy engine loading and release
observers/listeners on destruction; these behaviors were retained.

Refraction uses custom WebGL rather than Three.js. It renders on invalidation instead
of an idle animation loop, caps resolution, and retains CSS fallback. This pass is
source inspection and browser behavior verification, not measured cross-device GPU
profiling or a guarantee of frame rate on all devices.

## Verification scope and limitations

- Browser route/heading and horizontal-overflow checks covered all 56 component routes.
- Screenshots inspected catalog, dashboard, chapter navigation, image compare, scroll
  area, tooltip/popover, light RTL dashboard, and 390px dashboard layout.
- Specific interactions checked include sidebar collapse, command search, local demo
  navigation, and filtered results. Regression tests exercise corrected contracts.
- Production docs prerender 64 routes. Package checks validate 64 acyclic entry points
  and engine import isolation.
- Browser coverage is Chromium on this host. Safari, real touch devices, and a complete
  screen-reader/WCAG conformance audit remain outside this verification.
- Angular Aria emits development diagnostics for eager accordion/tab panel projection.
  This is an existing intentional contract: accordion content stays in the DOM for
  FAQ/search, and tabs render upfront with inactive panels inert. See comments in
  `accordion/accordion.ts` and `tabs/tabs.ts`. Replacing with deferred content would
  change that behavior; this release retains it and records the compatibility warning.

## Workspace preservation

Final verification passed: 216 library tests and 10 documentation tests, workspace
lint, production library/docs builds, 64 prerendered routes, package boundary and
generated-export checks, the packed-package consumer size build, and compilation
of 65 standalone documentation examples. The package dry run contains 229 files.
The chart controls have a measured 20px gap above the chart. Browser checks on the
production build confirm local breadcrumb/sidebar selection, filtered project
results, and the mega menu's placement in the CDK overlay container.

Local changes from `main` to angular.json and package-lock.json were preserved in a
named Git stash before checking out `phase-2`. The existing untracked `.claude-flow`
directory was left untouched. Git identity remains the user's configured identity.
